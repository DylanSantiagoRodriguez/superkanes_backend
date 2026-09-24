import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { CitaEntity } from '../../cita/entities/cita.entity';
import { OrganizacionEntity } from '../../organizacion/entities/organizacion.entity';
import { PendienteVacunalEntity } from '../../pendiente-vacunal/entities/pendiente-vacunal.entity';
import { TutorEntity } from '../../tutor/entities/tutor.entity';
import { UsuarioEntity } from '../../usuario/entities/usuario.entity';

@Entity({ name: 'recordatorio', schema: 'vet', synchronize: false })
export class RecordatorioEntity {
  @PrimaryColumn({
    type: 'uuid',
    nullable: false,
    default: () => 'gen_random_uuid()',
  })
  id!: string;

  @Column({ type: 'uuid', nullable: false })
  organizacion_id!: string;

  @Column({ type: 'uuid', nullable: false })
  tutor_id!: string;

  @Column({ type: 'uuid', nullable: true })
  cita_id!: string | null;

  @Column({ type: 'uuid', nullable: true })
  pendiente_vacunal_id!: string | null;

  @Column({ type: 'text', nullable: false })
  canal!: 'email' | 'sms' | 'whatsapp' | 'push';

  @Column({ type: 'timestamptz', nullable: false })
  programado_en!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  enviado_en!: Date | null;

  @Column({ type: 'text', nullable: false, default: () => "'pendiente'" })
  estado!: 'pendiente' | 'procesando' | 'enviado' | 'fallido' | 'cancelado';

  @Column({ type: 'integer', nullable: false, default: () => '0' })
  intentos!: number;

  @Column({ type: 'text', nullable: false })
  clave_idempotencia!: string;

  @Column({ type: 'text', nullable: true })
  referencia_proveedor!: string | null;

  @Column({ type: 'timestamptz', nullable: false, default: () => 'now()' })
  creado_en!: Date;

  @Column({ type: 'uuid', nullable: true })
  creado_por!: string | null;

  @Column({ type: 'timestamptz', nullable: false, default: () => 'now()' })
  actualizado_en!: Date;

  @Column({ type: 'uuid', nullable: true })
  actualizado_por!: string | null;

  @Column({ type: 'integer', nullable: false, default: () => '1' })
  version!: number;

  @ManyToOne(() => OrganizacionEntity, {
    cascade: false,
    eager: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn([{ name: 'organizacion_id', referencedColumnName: 'id' }])
  organizacion?: Relation<OrganizacionEntity>;

  @ManyToOne(() => UsuarioEntity, {
    cascade: false,
    eager: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn([{ name: 'creado_por', referencedColumnName: 'id' }])
  creadoPor?: Relation<UsuarioEntity>;

  @ManyToOne(() => UsuarioEntity, {
    cascade: false,
    eager: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn([{ name: 'actualizado_por', referencedColumnName: 'id' }])
  actualizadoPor?: Relation<UsuarioEntity>;

  @ManyToOne(() => TutorEntity, {
    cascade: false,
    eager: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn([
    { name: 'organizacion_id', referencedColumnName: 'organizacion_id' },
    { name: 'tutor_id', referencedColumnName: 'id' },
  ])
  tutor?: Relation<TutorEntity>;

  @ManyToOne(() => CitaEntity, {
    cascade: false,
    eager: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn([
    { name: 'organizacion_id', referencedColumnName: 'organizacion_id' },
    { name: 'cita_id', referencedColumnName: 'id' },
  ])
  cita?: Relation<CitaEntity>;

  @ManyToOne(() => PendienteVacunalEntity, {
    cascade: false,
    eager: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn([
    { name: 'organizacion_id', referencedColumnName: 'organizacion_id' },
    { name: 'pendiente_vacunal_id', referencedColumnName: 'id' },
  ])
  pendienteVacunal?: Relation<PendienteVacunalEntity>;
}
