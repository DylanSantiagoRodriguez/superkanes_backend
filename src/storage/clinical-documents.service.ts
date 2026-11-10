import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import { EntityManager } from 'typeorm';
import type { Identity } from '../auth/token.service';
import {
  Access,
  ResourceAccessService,
} from '../resources/resource-access.service';
import { Action, resource, Row } from '../resources/resource-registry';
import { expectedVersion } from '../resources/resource-validation';
import { StorageService } from './storage.service';
import {
  clinicalFileType,
  clinicalPdf,
  documentText,
} from './clinical-document-files';

function valueText(value: unknown): string {
  return typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
    ? String(value)
    : value instanceof Date
      ? value.toISOString()
      : '';
}

@Injectable()
export class ClinicalDocumentsService {
  constructor(
    private readonly access: ResourceAccessService,
    private readonly storage: StorageService,
  ) {}
  private scope(
    a: Access,
    table: string,
    action: Action,
    alias: string,
    params: unknown[],
  ) {
    const r = resource(table);
    return this.access.scopeSql(
      r,
      alias,
      this.access.authorize(a, r, action),
      params,
    );
  }
  private async find(
    manager: EntityManager,
    a: Access,
    table: string,
    id: string,
    action: Action = 'read',
    lock = false,
  ): Promise<Row> {
    const params: unknown[] = [a.organizationId, id],
      scope = this.scope(a, table, action, 'r', params);
    const rows: Row[] = await manager.query(
      `SELECT r.* FROM vet."${table}" r WHERE ${table === 'organizacion' ? 'r.id' : 'r.organizacion_id'}=$1 AND r.id=$2 AND ${scope}${lock ? ' FOR UPDATE OF r' : ''}`,
      params,
    );
    if (!rows[0]) throw new NotFoundException('Registro no disponible');
    if (action === 'read')
      await manager.query('SELECT vet.record_api_access($1,$2,$3)', [
        table,
        id,
        'READ',
      ]);
    return rows[0];
  }
  private async idempotency(
    manager: EntityManager,
    a: Access,
    key: string,
    kind: string,
    hash: string,
    execute: () => Promise<Row>,
  ) {
    await manager.query(
      'SELECT pg_advisory_xact_lock(hashtextextended($1,0))',
      [`${a.organizationId}:${a.userId}:${key}`],
    );
    const prior: { resource: string; request_hash: string; response: Row }[] =
      await manager.query(
        'SELECT resource,request_hash,response FROM api.idempotency WHERE organizacion_id=$1 AND usuario_id=$2 AND key=$3 AND expires_at>now()',
        [a.organizationId, a.userId, key],
      );
    if (prior[0]) {
      if (prior[0].resource !== kind || prior[0].request_hash !== hash)
        throw new ConflictException('Idempotency-Key ya utilizado');
      return { data: prior[0].response };
    }
    const row = await execute();
    await manager.query(
      'DELETE FROM api.idempotency WHERE organizacion_id=$1 AND usuario_id=$2 AND key=$3 AND expires_at<=now()',
      [a.organizationId, a.userId, key],
    );
    await manager.query(
      'INSERT INTO api.idempotency(organizacion_id,usuario_id,key,resource,request_hash,response) VALUES($1,$2,$3,$4,$5,$6)',
      [a.organizationId, a.userId, key, kind, hash, JSON.stringify(row)],
    );
    return { data: row };
  }
  upload(
    identity: Identity,
    org: string,
    id: string,
    key: string,
    etag: string,
    file?: { buffer: Buffer; originalname: string },
  ) {
    const version = expectedVersion(etag);
    if (!file?.buffer.length)
      throw new BadRequestException('Selecciona un archivo');
    const name =
      Array.from(file.originalname)
        .map((c) =>
          c.charCodeAt(0) < 32 ||
          c.charCodeAt(0) === 127 ||
          ['/', '\\'].includes(c)
            ? '_'
            : c,
        )
        .join('')
        .slice(0, 180) || 'documento';
    const hash = createHash('sha256')
      .update(file.buffer)
      .update(JSON.stringify({ id, name, version }))
      .digest('hex');
    return this.access.run(identity, org, async (manager, a) => {
      const revision = await this.find(
        manager,
        a,
        'revision_clinica',
        id,
        'update',
        true,
      );
      const params: unknown[] = [org, id],
        scope = this.scope(a, 'adjunto_clinico', 'create', 'r', params);
      // Evaluate the inherited site scope against the intended parent before storing bytes.
      const allowed: Row[] = await manager.query(
        `SELECT 1 FROM (SELECT $1::uuid AS organizacion_id,$2::uuid AS revision_id) r WHERE ${scope}`,
        params,
      );
      if (!allowed.length)
        throw new ForbiddenException('Sin acceso a esta sede');
      for (const action of ['create', 'read'] as const)
        this.scope(a, 'archivo', action, 'r', []);
      return this.idempotency(
        manager,
        a,
        key,
        'clinical-upload',
        hash,
        async () => {
          if (revision.version !== version)
            throw new HttpException('La revision cambio', 412);
          if (revision.estado !== 'borrador')
            throw new ConflictException(
              'Adjunte documentos a una revision en borrador',
            );
          const mime = await clinicalFileType(file.buffer);
          const archivo = await this.storage.storeClinical(
            manager,
            a,
            file.buffer,
            name,
            mime,
            'adjunto_clinico',
          );
          const rows: Row[] = await manager.query(
            'INSERT INTO vet.adjunto_clinico(organizacion_id,revision_id,archivo_id,descripcion) VALUES($1,$2,$3,$4) RETURNING *',
            [org, id, archivo.id, name],
          );
          const updated = await this.find(manager, a, 'revision_clinica', id);
          return { archivo, adjunto: rows[0], revision: updated };
        },
      );
    });
  }
  download(identity: Identity, org: string, id: string) {
    return this.access.run(identity, org, async (manager, a) => {
      const archivo = await this.find(manager, a, 'archivo', id);
      let authorized = false;
      for (const table of ['adjunto_clinico', 'reporte_emitido']) {
        try {
          const params: unknown[] = [org, id],
            scope = this.scope(a, table, 'read', 'r', params);
          let extra = '';
          if (table === 'reporte_emitido') {
            const revisionScope = this.scope(
              a,
              'revision_clinica',
              'read',
              'v',
              params,
            );
            extra = ` AND EXISTS(SELECT 1 FROM vet.revision_clinica v WHERE v.organizacion_id=r.organizacion_id AND v.id::text=r.parametros->>'revision_id' AND ${revisionScope})`;
          }
          const rows: Row[] = await manager.query(
            `SELECT r.id FROM vet.${table} r WHERE r.organizacion_id=$1 AND r.archivo_id=$2 AND ${scope}${extra} LIMIT 1`,
            params,
          );
          if (rows.length) {
            authorized = true;
            await manager.query('SELECT vet.record_api_access($1,$2,$3)', [
              table,
              rows[0].id,
              'READ',
            ]);
            break;
          }
        } catch (error) {
          if (!(error instanceof ForbiddenException)) throw error;
        }
      }
      if (!authorized) throw new NotFoundException('Documento no disponible');
      return {
        buffer: await this.storage.clinicalContent(archivo, org),
        mime: String(archivo.mime_detectado),
        name: String(archivo.nombre_original),
      };
    });
  }
  report(
    identity: Identity,
    org: string,
    id: string,
    type: string,
    key: string,
  ) {
    if (!['historia', 'receta', 'indicaciones'].includes(type))
      throw new BadRequestException('Tipo de reporte invalido');
    return this.access.run(identity, org, async (manager, a) => {
      const revision = await this.find(manager, a, 'revision_clinica', id);
      if (revision.estado !== 'cerrada')
        throw new ConflictException(
          'Cierre la revision antes de emitir documentos',
        );
      this.scope(a, 'reporte_emitido', 'read', 'r', []);
      for (const action of ['create', 'read'] as const)
        this.scope(a, 'archivo', action, 'r', []);
      const attention = await this.find(
        manager,
        a,
        'atencion_clinica',
        String(revision.atencion_id),
      );
      const patient = await this.find(
        manager,
        a,
        'mascota',
        String(attention.mascota_id),
      );
      const professional = await this.find(
        manager,
        a,
        'profesional',
        String(attention.profesional_id),
      );
      const organization = await this.find(manager, a, 'organizacion', org);
      const hash = createHash('sha256')
        .update(JSON.stringify({ id, type }))
        .digest('hex');
      return this.idempotency(
        manager,
        a,
        key,
        'clinical-report',
        hash,
        async () => {
          const sources: Row[] = [
            { entidad: 'revision_clinica', id, version: revision.version },
            { entidad: 'mascota', id: patient.id, version: patient.version },
            {
              entidad: 'profesional',
              id: professional.id,
              version: professional.version,
            },
          ];
          const lines = [
            String(organization.nombre),
            `Paciente: ${valueText(patient.nombre)} · ${valueText(patient.codigo)}`,
            `Sexo: ${valueText(patient.sexo)} · Nacimiento: ${valueText(patient.fecha_nacimiento ?? 'No registrado')}`,
            `Profesional: ${valueText(professional.nombre_profesional)} · Registro: ${valueText(professional.registro_profesional ?? 'No registrado')}`,
            `Atención: ${new Date(String(attention.fecha_atencion)).toISOString()}`,
            `Revisión ${valueText(revision.numero)} · Cierre: ${new Date(String(revision.cerrada_en)).toISOString()}`,
            `Identificador de revisión: ${id}`,
          ];
          if (type === 'historia') {
            for (const [field, title] of [
              ['motivo_consulta', 'Motivo'],
              ['anamnesis', 'Anamnesis'],
              ['examen_fisico', 'Examen físico'],
              ['evaluacion', 'Evaluación'],
              ['plan', 'Plan'],
            ])
              lines.push(
                `${title}: ${valueText(revision[field] ?? 'No registrado')}`,
              );
            if (revision.documento)
              lines.push(
                'Documento complementario:',
                documentText(revision.documento),
              );
          }
          if (type === 'indicaciones')
            lines.push(
              'Indicaciones registradas por el profesional:',
              valueText(revision.plan ?? 'No registradas'),
            );
          for (const table of type === 'historia'
            ? [
                'medicion_clinica',
                'diagnostico_atencion',
                'prescripcion',
                'prescripcion_item',
              ]
            : type === 'receta'
              ? ['prescripcion', 'prescripcion_item']
              : []) {
            const params: unknown[] = [org, id],
              scope = this.scope(a, table, 'read', 'r', params);
            const from =
              table === 'prescripcion_item'
                ? 'vet.prescripcion_item r JOIN vet.prescripcion p ON p.id=r.prescripcion_id AND p.organizacion_id=r.organizacion_id'
                : `vet.${table} r`;
            const parent =
              table === 'prescripcion_item' ? 'p.revision_id' : 'r.revision_id';
            const diagnosisScope =
              table === 'diagnostico_atencion'
                ? this.scope(a, 'diagnostico', 'read', 'd', params)
                : '';
            const diagnosisJoin = diagnosisScope
              ? ` JOIN vet.diagnostico d ON d.id=r.diagnostico_id AND d.organizacion_id=r.organizacion_id AND ${diagnosisScope}`
              : '';
            const records: Row[] = await manager.query(
              `SELECT r.*${diagnosisScope ? ',d.nombre AS diagnostico_nombre,d.version AS diagnostico_version' : ''} FROM ${from}${diagnosisJoin} WHERE r.organizacion_id=$1 AND ${parent}=$2 AND ${scope} ORDER BY r.creado_en,r.id LIMIT 1001`,
              params,
            );
            if (records.length > 1000)
              throw new ConflictException('Reporte demasiado extenso');
            await manager.query('SELECT vet.record_api_access($1,$2,$3)', [
              table,
              id,
              'LIST',
            ]);
            for (const row of records) {
              sources.push({
                entidad: table,
                id: row.id,
                version: row.version,
              });
              if (table === 'medicion_clinica')
                lines.push(
                  `${valueText(row.tipo)}: ${valueText(row.valor)} ${valueText(row.unidad)} · ${new Date(String(row.medida_en)).toISOString()}`,
                );
              if (table === 'diagnostico_atencion') {
                sources.push({
                  entidad: 'diagnostico',
                  id: row.diagnostico_id,
                  version: row.diagnostico_version,
                });
                lines.push(
                  `Diagnóstico ${valueText(row.clasificacion)}: ${valueText(row.diagnostico_nombre)}. ${valueText(row.observaciones ?? '')}`,
                );
              }
              if (table === 'prescripcion')
                lines.push(
                  `Indicaciones generales: ${valueText(row.indicaciones_generales ?? 'Sin indicaciones adicionales')}`,
                );
              if (table === 'prescripcion_item')
                lines.push(
                  `Medicamento: ${valueText(row.descripcion_emitida)}`,
                  `Dosis: ${valueText(row.dosis ?? 'Según indicaciones')} ${valueText(row.unidad_dosis ?? '')} · Vía: ${valueText(row.via)}`,
                  `Frecuencia: ${valueText(row.frecuencia)} · Duración: ${valueText(row.duracion)} · Cantidad: ${valueText(row.cantidad ?? 'No registrada')}`,
                  `Instrucciones: ${valueText(row.instrucciones)}`,
                );
            }
          }
          const title =
            type === 'historia'
              ? 'Historia de consulta'
              : type === 'receta'
                ? 'Prescripción veterinaria'
                : 'Indicaciones de consulta';
          const buffer = await clinicalPdf(title, lines);
          const archivo = await this.storage.storeClinical(
            manager,
            a,
            buffer,
            `${type}-${valueText(patient.codigo)}-r${valueText(revision.numero)}.pdf`,
            'application/pdf',
            'reporte_clinico',
          );
          const reports: Row[] = await manager.query(
            `INSERT INTO vet.reporte_emitido(organizacion_id,mascota_id,tipo,parametros,datos_identificacion_snapshot,fuentes_versionadas,version_plantilla,archivo_id,emitido_por,creado_por) VALUES($1,$2,$3,$4,$5,$6,'clinica-v1',$7,$8,$8) RETURNING *`,
            [
              org,
              patient.id,
              type,
              JSON.stringify({ revision_id: id }),
              JSON.stringify({
                patient,
                professional,
                organizacion: organization.nombre,
              }),
              JSON.stringify(sources),
              archivo.id,
              a.userId,
            ],
          );
          return { report: reports[0], archivo };
        },
      );
    });
  }
}
