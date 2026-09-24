import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { MascotaEntity } from '../../mascota/entities/mascota.entity';
import { OrganizacionEntity } from '../../organizacion/entities/organizacion.entity';
import { UsuarioEntity } from '../../usuario/entities/usuario.entity';
import { VacunaEntity } from '../../vacuna/entities/vacuna.entity';
import { VacunacionEntity } from '../../vacunacion/entities/vacunacion.entity';

@Entity({ name: 'pendiente_vacunal', schema: 'vet', synchronize: false })
export class PendienteVacunalEntity {
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

  @Column({ type: 'uuid', nullable: true })
  vacunacion_origen_id!: string | null;

  @Column({ type: 'uuid', nullable: true })
  vacuna_prevista_id!: string | null;

  @Column({ type: 'text', nullable: false })
  indicacion!: string;

  @Column({ type: 'date', nullable: false })
  fecha_objetivo!: string;

  @Column({ type: 'text', nullable: false, default: () => "'pendiente'" })
  estado!: 'pendiente' | 'cumplido' | 'cancelado';

  @Column({ type: 'uuid', nullable: true })
  vacunacion_cumplimiento_id!: string | null;

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

  @ManyToOne(() => VacunaEntity, {
    cascade: false,
    eager: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn([
    { name: 'organizacion_id', referencedColumnName: 'organizacion_id' },
    { name: 'vacuna_prevista_id', referencedColumnName: 'id' },
  ])
  vacunaPrevista?: Relation<VacunaEntity>;

  @ManyToOne(() => VacunacionEntity, {
    cascade: false,
    eager: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn([
    { name: 'organizacion_id', referencedColumnName: 'organizacion_id' },
    { name: 'mascota_id', referencedColumnName: 'mascota_id' },
    { name: 'vacunacion_origen_id', referencedColumnName: 'id' },
  ])
  vacunacionOrigen?: Relation<VacunacionEntity>;

  @ManyToOne(() => VacunacionEntity, {
    cascade: false,
    eager: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn([
    { name: 'organizacion_id', referencedColumnName: 'organizacion_id' },
    { name: 'mascota_id', referencedColumnName: 'mascota_id' },
    { name: 'vacunacion_cumplimiento_id', referencedColumnName: 'id' },
  ])
  vacunacionCumplimiento?: Relation<VacunacionEntity>;
}
