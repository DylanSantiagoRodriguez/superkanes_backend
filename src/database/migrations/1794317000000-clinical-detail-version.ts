import { MigrationInterface, QueryRunner } from 'typeorm';
export class ClinicalDetailVersion1794317000000 implements MigrationInterface {
  async up(runner: QueryRunner): Promise<void> {
    await runner.query(`
      CREATE FUNCTION vet.versionar_revision_por_detalle() RETURNS trigger
      LANGUAGE plpgsql SET search_path=pg_catalog,vet AS $$
      DECLARE registro jsonb; rid uuid;
      BEGIN
        registro := CASE WHEN TG_OP='DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END;
        IF TG_TABLE_NAME='prescripcion_item' THEN
          SELECT revision_id INTO rid FROM vet.prescripcion
          WHERE organizacion_id=(registro->>'organizacion_id')::uuid AND id=(registro->>'prescripcion_id')::uuid;
        ELSE rid := (registro->>'revision_id')::uuid; END IF;
        UPDATE vet.revision_clinica SET motivo_consulta=motivo_consulta
        WHERE organizacion_id=(registro->>'organizacion_id')::uuid AND id=rid;
        RETURN NULL;
      END $$;
    `);
    for (const table of [
      'seccion_clinica',
      'medicion_clinica',
      'diagnostico_atencion',
      'prescripcion',
      'prescripcion_item',
      'adjunto_clinico',
    ])
      await runner.query(
        `CREATE TRIGGER zy_version_revision AFTER INSERT OR UPDATE OR DELETE ON vet.${table} FOR EACH ROW EXECUTE FUNCTION vet.versionar_revision_por_detalle()`,
      );
  }
  async down(runner: QueryRunner): Promise<void> {
    for (const table of [
      'seccion_clinica',
      'medicion_clinica',
      'diagnostico_atencion',
      'prescripcion',
      'prescripcion_item',
      'adjunto_clinico',
    ])
      await runner.query(`DROP TRIGGER zy_version_revision ON vet.${table}`);
    await runner.query('DROP FUNCTION vet.versionar_revision_por_detalle()');
  }
}
