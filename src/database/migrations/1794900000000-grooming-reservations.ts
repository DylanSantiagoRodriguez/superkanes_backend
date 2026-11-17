import { MigrationInterface, QueryRunner } from 'typeorm';

export class GroomingReservations1794900000000 implements MigrationInterface {
  async up(runner: QueryRunner): Promise<void> {
    await runner.query(`
      ALTER TABLE vet.servicio_peluqueria ALTER COLUMN responsable_id DROP NOT NULL;
      ALTER TABLE vet.servicio_peluqueria ALTER COLUMN telefono_contacto_servicio DROP NOT NULL;
      ALTER TABLE vet.servicio_peluqueria ADD CONSTRAINT ck_peluqueria_datos_servicio
        CHECK (estado NOT IN ('en_servicio','finalizado','entregado') OR (responsable_id IS NOT NULL AND telefono_contacto_servicio IS NOT NULL));
      ALTER TABLE vet.cita ALTER COLUMN fin DROP NOT NULL;
      ALTER TABLE vet.cita ADD CONSTRAINT ck_cita_fin_por_tipo
        CHECK (tipo = 'peluqueria' OR fin IS NOT NULL);
      ALTER TABLE vet.cita DROP CONSTRAINT ex_cita_responsable;
      ALTER TABLE vet.cita ADD CONSTRAINT ex_cita_responsable EXCLUDE USING gist
        (organizacion_id WITH =,responsable_id WITH =,tstzrange(inicio,fin,'[)') WITH &&)
        WHERE(responsable_id IS NOT NULL AND fin IS NOT NULL AND estado IN ('programada','confirmada','en_atencion'));
    `);
  }
  async down(runner: QueryRunner): Promise<void> {
    // Fail rather than invent an end time or delete reservations.
    await runner.query(`ALTER TABLE vet.servicio_peluqueria ALTER COLUMN responsable_id SET NOT NULL;
      ALTER TABLE vet.servicio_peluqueria ALTER COLUMN telefono_contacto_servicio SET NOT NULL;
      ALTER TABLE vet.servicio_peluqueria DROP CONSTRAINT ck_peluqueria_datos_servicio;
      ALTER TABLE vet.cita ALTER COLUMN fin SET NOT NULL;
      ALTER TABLE vet.cita DROP CONSTRAINT ck_cita_fin_por_tipo;
      ALTER TABLE vet.cita DROP CONSTRAINT ex_cita_responsable;
      ALTER TABLE vet.cita ADD CONSTRAINT ex_cita_responsable EXCLUDE USING gist
        (organizacion_id WITH =,responsable_id WITH =,tstzrange(inicio,fin,'[)') WITH &&)
        WHERE(responsable_id IS NOT NULL AND estado IN ('programada','confirmada','en_atencion'));
    `);
  }
}
