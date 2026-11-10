import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { MascotaEntity } from '../../mascota/entities/mascota.entity';
import { MembresiaEntity } from '../../membresia/entities/membresia.entity';
import { OrganizacionEntity } from '../../organizacion/entities/organizacion.entity';
import { PendienteVacunalEntity } from '../../pendiente-vacunal/entities/pendiente-vacunal.entity';
import { SedeEntity } from '../../sede/entities/sede.entity';
import { TutorEntity } from '../../tutor/entities/tutor.entity';
import { UsuarioEntity } from '../../usuario/entities/usuario.entity';

@Entity({ name: 'cita', schema: 'vet', synchronize: false })
export class CitaEntity {
  @PrimaryColumn({
    type: 'uuid',
    nullable: false,
    default: () => 'gen_random_uuid()',
  })
  id!: string;

  @Column({ type: 'uuid', nullable: false })
  organizacion_id!: string;

  @Column({ type: 'uuid', nullable: false })
  mascota_id!: string;

  @Column({ type: 'uuid', nullable: false })
  sede_id!: string;

  @Column({ type: 'uuid', nullable: false })
  tutor_contacto_id!: string;

  @Column({ type: 'text', nullable: false })
  tipo!: 'clinica' | 'vacunacion' | 'peluqueria';

  @Column({ type: 'timestamptz', nullable: false })
  inicio!: Date;

  @Column({ type: 'timestamptz', nullable: false })
  fin!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  llegada_en!: Date | null;

  @Column({ type: 'uuid', nullable: true })
  responsable_id!: string | null;

  @Column({ type: 'uuid', nullable: true })
  pendiente_vacunal_id!: string | null;

  @Column({ type: 'text', nullable: false, default: () => "'programada'" })
  estado!:
    | 'programada'
    | 'confirmada'
    | 'en_atencion'
    | 'completada'
    | 'cancelada'
    | 'no_asistio';

  @Column({ type: 'text', nullable: true })
  notas!: string | null;

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

  @ManyToOne(() => MascotaEntity, {
    cascade: false,
    eager: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn([
    { name: 'organizacion_id', referencedColumnName: 'organizacion_id' },
    { name: 'mascota_id', referencedColumnName: 'id' },
  ])
  mascota?: Relation<MascotaEntity>;

  @ManyToOne(() => SedeEntity, {
    cascade: false,
    eager: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn([
    { name: 'organizacion_id', referencedColumnName: 'organizacion_id' },
    { name: 'sede_id', referencedColumnName: 'id' },
  ])
  sede?: Relation<SedeEntity>;

  @ManyToOne(() => TutorEntity, {
    cascade: false,
    eager: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn([
    { name: 'organizacion_id', referencedColumnName: 'organizacion_id' },
    { name: 'tutor_contacto_id', referencedColumnName: 'id' },
  ])
  tutorContacto?: Relation<TutorEntity>;

  @ManyToOne(() => MembresiaEntity, {
    cascade: false,
    eager: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn([
    { name: 'organizacion_id', referencedColumnName: 'organizacion_id' },
    { name: 'responsable_id', referencedColumnName: 'id' },
  ])
  responsable?: Relation<MembresiaEntity>;

  @ManyToOne(() => PendienteVacunalEntity, {
    cascade: false,
    eager: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn([
    { name: 'organizacion_id', referencedColumnName: 'organizacion_id' },
    { name: 'mascota_id', referencedColumnName: 'mascota_id' },
    { name: 'pendiente_vacunal_id', referencedColumnName: 'id' },
  ])
  pendienteVacunal?: Relation<PendienteVacunalEntity>;
}
