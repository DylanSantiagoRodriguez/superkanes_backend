import { validateMeasurement } from '../clinical/clinical-measurements';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import Ajv, { ValidateFunction } from 'ajv';
import { Access } from './resource-access.service';
import { Resource, Row } from './resource-registry';

export const immutable: Record<string, string[]> = {
  membresia: ['usuario_id'],
  profesional: ['membresia_id'],
  mascota_tutor: ['mascota_id', 'tutor_id', 'vigente_desde'],
  revision_clinica: ['atencion_id', 'numero', 'revision_previa_id'],
  seccion_clinica: ['revision_id', 'tipo_seccion_id', 'plantilla_id'],
  medicion_clinica: ['revision_id'],
  diagnostico_atencion: ['revision_id'],
  prescripcion: ['revision_id'],
  prescripcion_item: ['prescripcion_id'],
  consentimiento: [
    'atencion_id',
    'procedimiento',
    'alcance',
    'servicio_id',
    'plantilla_id',
    'documento_archivo_id',
    'hash_documento',
    'emitido_en',
  ],
  adjunto_clinico: ['revision_id'],
  adjunto_vacunacion: ['vacunacion_id'],
  adjunto_peluqueria: ['servicio_id'],
};
export const graphs: Record<string, Record<string, string[]>> = {
  cita: {
    programada: ['confirmada', 'en_atencion', 'cancelada', 'no_asistio'],
    confirmada: ['en_atencion', 'cancelada', 'no_asistio'],
    en_atencion: ['completada', 'cancelada'],
    completada: [],
    cancelada: [],
    no_asistio: [],
  },
  atencion_clinica: {
    abierta: ['cerrada', 'anulada'],
    cerrada: ['anulada'],
    anulada: [],
  },
  revision_clinica: { borrador: ['cerrada'], cerrada: [] },
  servicio_peluqueria: {
    programado: ['recibido', 'cancelado'],
    recibido: ['en_servicio', 'cancelado'],
    en_servicio: ['finalizado'],
    finalizado: ['entregado'],
    entregado: [],
    cancelado: [],
  },
  pendiente_vacunal: {
    pendiente: ['cumplido', 'cancelado'],
    cumplido: [],
    cancelado: [],
  },
  consentimiento: {
    pendiente: ['aceptado', 'rechazado'],
    aceptado: ['revocado'],
    rechazado: [],
    revocado: [],
  },
};
@Injectable()
export class ResourceRulesService {
  private readonly ajv = new Ajv({
    allErrors: false,
    strict: true,
    validateFormats: false,
  });
  private readonly validators = new Map<string, ValidateFunction>();

  async validate(
    manager: EntityManager,
    r: Resource,
    data: Row,
    old: Row | undefined,
    access: Access,
  ): Promise<void> {
    for (const name of ['cerrada_por', 'cerrada_en', 'emitido_por']) {
      if (name in data)
        throw new BadRequestException(`${name} es asignado por el servidor`);
    }
    if (old)
      for (const key of immutable[r.name] ?? [])
        if (key in data && data[key] !== old[key])
          throw new ConflictException(
            `No se puede cambiar ${key}; cree una nueva relacion`,
          );
    const merged = { ...old, ...data };
    if (
      ['cita', 'servicio_peluqueria'].includes(r.name) &&
      (!old ||
        ('mascota_id' in data && data.mascota_id !== old.mascota_id) ||
        ('tutor_contacto_id' in data &&
          data.tutor_contacto_id !== old.tutor_contacto_id))
    ) {
      const links: Row[] = await manager.query(
        'SELECT id FROM vet.mascota_tutor WHERE organizacion_id=$1 AND mascota_id=$2 AND tutor_id=$3 AND vigente_hasta IS NULL FOR SHARE',
        [access.organizationId, merged.mascota_id, merged.tutor_contacto_id],
      );
      if (!links.length)
        throw new BadRequestException(
          'El tutor de contacto debe estar vinculado a la mascota.',
        );
    }
    if (r.name === 'medicion_clinica') validateMeasurement(merged);
    if (
      r.name === 'mascota_tutor' &&
      !old &&
      data.vigente_desde === undefined
    ) {
      const dates: { inicio: string }[] = await manager.query(
        "SELECT to_char(current_timestamp AT TIME ZONE zona_horaria_default,'YYYY-MM-DD') AS inicio FROM vet.organizacion WHERE id=$1",
        [access.organizationId],
      );
      data.vigente_desde = dates[0].inicio;
    }
    if (
      old &&
      data.estado !== undefined &&
      data.estado !== old.estado &&
      graphs[r.name]
    ) {
      if (
        typeof data.estado !== 'string' ||
        !graphs[r.name][String(old.estado)]?.includes(data.estado)
      )
        throw new ConflictException('Transicion de estado no permitida');
    }
    if (!old) {
      const initial: Record<string, string> = {
        revision_clinica: 'borrador',
        atencion_clinica: 'abierta',
        consentimiento: 'pendiente',
        servicio_peluqueria: 'programado',
        pendiente_vacunal: 'pendiente',
        recordatorio: 'pendiente',
      };
      if (
        initial[r.name] &&
        data.estado !== undefined &&
        data.estado !== initial[r.name]
      )
        throw new BadRequestException(
          `Estado inicial requerido: ${initial[r.name]}`,
        );
    }
    if (r.name === 'vacunacion' && old) {
      if (
        Object.keys(data).some(
          (k) => !['estado', 'motivo_anulacion'].includes(k),
        ) ||
        data.estado !== 'anulada'
      )
        throw new ConflictException(
          'Solo se permite anular con motivo; la correccion es otra vacunacion',
        );
      const used: Row[] = await manager.query(
        "SELECT id FROM vet.pendiente_vacunal WHERE organizacion_id=$1 AND vacunacion_cumplimiento_id=$2 AND estado='cumplido'",
        [access.organizationId, old.id],
      );
      if (used.length)
        throw new ConflictException(
          'La vacuna cumple un pendiente; requiere correccion clinica coordinada',
        );
    }
    if (
      r.name === 'recordatorio' &&
      old &&
      Object.keys(data).some((k) => k !== 'estado')
    )
      throw new ForbiddenException(
        'El resultado de envio solo lo registra el servicio de comunicaciones',
      );
    if (r.name === 'recordatorio' && old && data.estado !== 'cancelado')
      throw new ForbiddenException('Solo se permite cancelar el recordatorio');
    if (r.name === 'recordatorio' && !old) {
      if (
        ['enviado_en', 'intentos', 'referencia_proveedor'].some(
          (k) => k in data,
        )
      )
        throw new BadRequestException(
          'Datos de entrega reservados al servicio',
        );
    }
    if (r.name === 'archivo' && !access.platformAdmin) {
      if (old?.estado_analisis !== 'pendiente' && old)
        throw new ConflictException('Archivo verificado inmutable');
      if (
        data.estado_analisis !== undefined &&
        data.estado_analisis !== 'pendiente'
      )
        throw new ForbiddenException(
          'La disponibilidad se confirma mediante el proceso de archivos',
        );
    }
    if (r.name === 'revision_clinica' && data.estado === 'cerrada') {
      await this.clinicalAuthor(manager, merged.atencion_id, access);
      data.cerrada_por = access.userId;
      data.cerrada_en = new Date().toISOString();
    }
    if (
      ['atencion_clinica', 'prescripcion'].includes(r.name) &&
      (!old || data.profesional_id)
    )
      await this.professional(manager, merged.profesional_id, access);
    if (
      r.name === 'vacunacion' &&
      !old &&
      (merged.origen ?? 'interna') === 'interna'
    )
      await this.professional(manager, merged.aplicada_por, access);
    if (r.name === 'atencion_clinica' && data.estado === 'cerrada') {
      const rows: Row[] = await manager.query(
        "SELECT id FROM vet.revision_clinica WHERE organizacion_id=$1 AND atencion_id=$2 AND estado='cerrada'",
        [access.organizationId, old?.id],
      );
      if (!rows.length)
        throw new ConflictException('Cierre primero una revision clinica');
    }
    if (r.name === 'membresia' && merged.usuario_id === access.userId && old)
      throw new ForbiddenException(
        'Otro administrador debe modificar su membresia',
      );
    if (['asignacion_rol', 'rol_permiso'].includes(r.name))
      await this.preventEscalation(manager, r, data, old, access);
    if (r.name === 'plantilla_seccion' && data.esquema_validacion) {
      try {
        this.ajv.compile(data.esquema_validacion);
      } catch {
        throw new BadRequestException(
          'Esquema de formulario no valido o contiene referencias no admitidas',
        );
      }
    }
    if (r.name === 'consentimiento' && !old) {
      if (Boolean(merged.servicio_id) === Boolean(merged.atencion_id))
        throw new BadRequestException('Seleccione una atencion o un servicio');
      if (merged.atencion_id) {
        if (
          typeof merged.procedimiento !== 'string' ||
          !merged.procedimiento.trim()
        )
          throw new BadRequestException('Indique el procedimiento');
        await this.clinicalAuthor(manager, merged.atencion_id, access);
        const files: Row[] = await manager.query(
          'SELECT x.id FROM vet.adjunto_clinico x JOIN vet.revision_clinica v ON v.id=x.revision_id AND v.organizacion_id=x.organizacion_id WHERE x.organizacion_id=$1 AND x.archivo_id=$2 AND v.atencion_id=$3',
          [
            access.organizationId,
            merged.documento_archivo_id,
            merged.atencion_id,
          ],
        );
        if (!files.length)
          throw new BadRequestException(
            'El documento debe estar adjunto a esta atencion',
          );
      }
    }
    if (r.name === 'firma_consentimiento' && !old) {
      const tutors: Row[] = await manager.query(
        'SELECT nombres,apellidos,pais_documento,tipo_documento,numero_documento FROM vet.tutor WHERE organizacion_id=$1 AND id=$2',
        [access.organizationId, data.tutor_id],
      );
      if (!tutors[0]) throw new NotFoundException('Tutor no disponible');
      data.identidad_firmante_snapshot = tutors[0];
    }
    if (r.name === 'seccion_clinica') {
      const rows: Row[] = await manager.query(
        'SELECT id,esquema_validacion,publicada_en FROM vet.plantilla_seccion WHERE organizacion_id=$1 AND id=$2',
        [access.organizationId, merged.plantilla_id],
      );
      if (!rows[0]?.publicada_en)
        throw new ConflictException('La plantilla debe estar publicada');
      const key = String(rows[0].id);
      if (!this.validators.has(key)) {
        const oldest = this.validators.keys().next().value as
          string | undefined;
        if (this.validators.size >= 100 && oldest)
          this.validators.delete(oldest);
        try {
          this.validators.set(
            key,
            this.ajv.compile(rows[0].esquema_validacion as object),
          );
        } catch {
          throw new ConflictException('Plantilla no valida');
        }
      }
      if (!this.validators.get(key)!(merged.datos_estructurados ?? {}))
        throw new BadRequestException(
          'Los datos no cumplen el formulario clinico',
        );
    }
    if (r.name === 'mascota' && merged.raza_id && merged.especie_id) {
      const breeds: Row[] = await manager.query(
        'SELECT especie_id FROM vet.raza WHERE organizacion_id=$1 AND id=$2',
        [access.organizationId, merged.raza_id],
      );
      if (breeds[0] && breeds[0].especie_id !== merged.especie_id)
        throw new BadRequestException({
          code: 'BREED_SPECIES_MISMATCH',
          message:
            'La raza seleccionada no pertenece a la especie del paciente',
        });
    }
    for (const ref of r.refs) {
      if (
        ref.columns.some((k) =>
          ['id', 'creado_por', 'actualizado_por'].includes(k),
        )
      )
        continue;
      const values = ref.columns.map((k) =>
        k === 'organizacion_id'
          ? access.organizationId
          : { ...merged, ...data }[k],
      );
      if (values.some((v) => v === undefined || v === null)) continue;
      const where = ref.targetColumns
        .map((k, i) => `"${k}"=$${i + 1}`)
        .join(' AND ');
      const targets: Row[] = await manager.query(
        `SELECT * FROM vet."${ref.target}" WHERE ${where}`,
        values,
      );
      if (!targets.length)
        throw new NotFoundException('Registro relacionado no disponible');
      if (
        r.name === 'consentimiento' &&
        ref.target === 'plantilla_consentimiento' &&
        (!targets[0].publicada_en || !targets[0].activa)
      )
        throw new ConflictException(
          'La plantilla de consentimiento debe estar publicada y activa',
        );
      if (ref.target === 'archivo') {
        if (targets[0].estado_analisis !== 'disponible')
          throw new ConflictException('El archivo aun no esta disponible');
        if (
          r.name === 'consentimiento' &&
          targets[0].sha256 !== merged.hash_documento
        )
          throw new BadRequestException('El hash no corresponde al documento');
      }
    }
  }

  private async professional(
    manager: EntityManager,
    id: unknown,
    access: Access,
  ) {
    const rows: Row[] = await manager.query(
      `SELECT p.id FROM vet.profesional p JOIN vet.membresia m ON m.id=p.membresia_id AND m.organizacion_id=p.organizacion_id
      WHERE p.organizacion_id=$1 AND p.id=$2 AND m.usuario_id=$3 AND m.activo`,
      [access.organizationId, id, access.userId],
    );
    if (!rows.length)
      throw new ForbiddenException(
        'La autoria clinica debe corresponder al profesional autenticado',
      );
  }
  private async clinicalAuthor(
    manager: EntityManager,
    attention: unknown,
    access: Access,
  ) {
    const rows: Row[] = await manager.query(
      'SELECT profesional_id FROM vet.atencion_clinica WHERE organizacion_id=$1 AND id=$2 FOR UPDATE',
      [access.organizationId, attention],
    );
    if (!rows[0]) throw new NotFoundException();
    await this.professional(manager, rows[0].profesional_id, access);
  }
  private async preventEscalation(
    manager: EntityManager,
    r: Resource,
    data: Row,
    old: Row | undefined,
    access: Access,
  ) {
    if (access.platformAdmin) return;
    const merged = { ...old, ...data };
    if (
      !access.permissions
        .get(`${r.name}.${old ? 'update' : 'create'}`)
        ?.has(null)
    )
      throw new ForbiddenException(
        'La gestion de permisos requiere alcance de organizacion',
      );
    if (r.name === 'asignacion_rol') {
      const self: Row[] = await manager.query(
        'SELECT id FROM vet.membresia WHERE id=$1 AND usuario_id=$2 AND organizacion_id=$3',
        [merged.membresia_id, access.userId, access.organizationId],
      );
      if (self.length)
        throw new ForbiddenException(
          'No puede modificar sus propias asignaciones',
        );
    }
    const codes: { codigo: string }[] =
      r.name === 'rol_permiso'
        ? await manager.query('SELECT codigo FROM vet.permiso WHERE id=$1', [
            merged.permiso_id,
          ])
        : await manager.query(
            'SELECT p.codigo FROM vet.rol_permiso rp JOIN vet.permiso p ON p.id=rp.permiso_id WHERE rp.organizacion_id=$1 AND rp.rol_id=$2',
            [access.organizationId, merged.rol_id],
          );
    if (codes.some((p) => !access.permissions.get(p.codigo)?.has(null)))
      throw new ForbiddenException(
        'No puede conceder permisos superiores a los propios',
      );
  }
}
