import { Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { EntityManager } from 'typeorm';
import type { Identity } from '../auth/token.service';
import {
  Access,
  ResourceAccessService,
} from '../resources/resource-access.service';
import { resource, Row } from '../resources/resource-registry';
import { validateClinicalDocument } from '../resources/clinical-document';
import { StorageService } from './storage.service';

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, canonical(item)]),
    );
  return value;
}
@Injectable()
export class ClinicalDocumentArchiveService {
  constructor(
    private readonly storage: StorageService,
    private readonly access: ResourceAccessService,
  ) {}

  async save(manager: EntityManager, a: Access, revision: Row) {
    if (revision.documento == null) return;
    const buffer = Buffer.from(
      JSON.stringify(canonical(validateClinicalDocument(revision.documento))),
    );
    const hash = createHash('sha256').update(buffer).digest('hex');
    const latest: Row[] = await manager.query(
      `SELECT f.sha256 FROM vet.documento_clinico_version d
      JOIN vet.archivo f ON f.organizacion_id=d.organizacion_id AND f.id=d.archivo_id
      WHERE d.organizacion_id=$1 AND d.revision_id=$2 ORDER BY d.version_revision DESC LIMIT 1`,
      [a.organizationId, revision.id],
    );
    if (latest[0]?.sha256 === hash) return;
    const rows: Row[] = await manager.query(
      'SELECT mascota_id FROM vet.atencion_clinica WHERE organizacion_id=$1 AND id=$2',
      [a.organizationId, revision.atencion_id],
    );
    if (!rows[0]) throw new NotFoundException('Atención no disponible');
    const patientId = String(rows[0].mascota_id);
    const file = await this.storage.storeClinical(
      manager,
      a,
      buffer,
      `historia-${patientId}-r${String(revision.numero)}-v${String(revision.version)}.json`,
      'application/json',
      'documento_clinico',
      { patientId, revisionId: String(revision.id) },
    );
    await manager.query(
      `INSERT INTO vet.documento_clinico_version
      (organizacion_id,mascota_id,atencion_id,revision_id,archivo_id,version_revision,creado_por)
      VALUES($1,$2,$3,$4,$5,$6,$7)`,
      [
        a.organizationId,
        patientId,
        revision.atencion_id,
        revision.id,
        file.id,
        revision.version,
        a.userId,
      ],
    );
  }

  list(
    identity: Identity,
    org: string,
    patientId: string,
    query: { after?: string; revision_id?: string },
  ) {
    return this.access.run(identity, org, async (manager, a) => {
      const params: unknown[] = [org, patientId];
      const scope = (name: string, alias: string) =>
        this.access.scopeSql(
          resource(name),
          alias,
          this.access.authorize(a, resource(name), 'read'),
          params,
        );
      const patientScope = scope('mascota', 'p');
      const patients: Row[] = await manager.query(
        `SELECT p.id FROM vet.mascota p WHERE p.organizacion_id=$1 AND p.id=$2 AND ${patientScope}`,
        params,
      );
      if (!patients.length)
        throw new NotFoundException('Paciente no disponible');
      params.length = 2;
      const revisionScope = scope('revision_clinica', 'r'),
        fileScope = scope('archivo', 'f');
      let filter = '';
      if (query.after) {
        params.push(query.after);
        filter += ` AND d.id>$${params.length}::uuid`;
      }
      if (query.revision_id) {
        params.push(query.revision_id);
        filter += ` AND d.revision_id=$${params.length}::uuid`;
      }
      const rows: Row[] = await manager.query(
        `SELECT d.*,f.nombre_original,f.sha256,f.tamano_bytes,r.numero AS numero_revision,r.estado AS estado_revision
        FROM vet.documento_clinico_version d
        JOIN vet.revision_clinica r ON r.organizacion_id=d.organizacion_id AND r.id=d.revision_id
        JOIN vet.archivo f ON f.organizacion_id=d.organizacion_id AND f.id=d.archivo_id
        WHERE d.organizacion_id=$1 AND d.mascota_id=$2 AND ${revisionScope} AND ${fileScope}${filter} ORDER BY d.id LIMIT 26`,
        params,
      );
      await manager.query(
        "SELECT vet.record_api_access('documento_clinico_version',$1,'LIST')",
        [patientId],
      );
      return {
        data: rows.slice(0, 25),
        page: { limit: 25, next: rows.length > 25 ? rows[24].id : null },
      };
    });
  }
}
