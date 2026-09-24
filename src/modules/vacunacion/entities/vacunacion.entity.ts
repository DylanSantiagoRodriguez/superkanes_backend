import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { MascotaEntity } from '../../mascota/entities/mascota.entity';
import { OrganizacionEntity } from '../../organizacion/entities/organizacion.entity';
import { ProfesionalEntity } from '../../profesional/entities/profesional.entity';
import { SedeEntity } from '../../sede/entities/sede.entity';
import { UsuarioEntity } from '../../usuario/entities/usuario.entity';
import { VacunaEntity } from '../../vacuna/entities/vacuna.entity';

@Entity({ name: 'vacunacion', schema: 'vet', synchronize: false })
export class VacunacionEntity {
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
  sede_id!: string | null;

  @Column({ type: 'uuid', nullable: false })
  vacuna_id!: string;

  @Column({ type: 'timestamptz', nullable: false })
  aplicada_en!: Date;

  @Column({ type: 'text', nullable: false, default: () => "'interna'" })
  origen!: 'interna' | 'externa';

  @Column({ type: 'numeric', nullable: true, precision: 7, scale: 3 })
  peso_kg!: string | null;

  @Column({ type: 'uuid', nullable: true })
  aplicada_por!: string | null;

  @Column({ type: 'text', nullable: true })
  vacunador_externo!: string | null;

  @Column({ type: 'text', nullable: true })
  procedencia_externa!: string | null;

  @Column({ type: 'text', nullable: true })
  lote!: string | null;

  @Column({ type: 'date', nullable: true })
  vencimiento_lote!: string | null;

  @Column({ type: 'numeric', nullable: true, precision: 8, scale: 3 })
  dosis!: string | null;

  @Column({ type: 'text', nullable: true })
  unidad_dosis!: string | null;

  @Column({ type: 'text', nullable: true })
  via!: string | null;

  @Column({ type: 'text', nullable: false })
  descripcion_vacuna_emitida!: string;

  @Column({ type: 'text', nullable: true })
  observaciones!: string | null;

  @Column({ type: 'text', nullable: false, default: () => "'aplicada'" })
  estado!: 'aplicada' | 'anulada';

  @Column({ type: 'text', nullable: true })
  motivo_anulacion!: string | null;

  @Column({ type: 'uuid', nullable: true })
  reemplaza_id!: string | null;

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

  @ManyToOne(() => VacunaEntity, {
    cascade: false,
    eager: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn([
    { name: 'organizacion_id', referencedColumnName: 'organizacion_id' },
    { name: 'vacuna_id', referencedColumnName: 'id' },
  ])
  vacuna?: Relation<VacunaEntity>;

  @ManyToOne(() => ProfesionalEntity, {
    cascade: false,
    eager: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn([
    { name: 'organizacion_id', referencedColumnName: 'organizacion_id' },
    { name: 'aplicada_por', referencedColumnName: 'id' },
  ])
  aplicadaPor?: Relation<ProfesionalEntity>;

  @ManyToOne(() => VacunacionEntity, {
    cascade: false,
    eager: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn([
    { name: 'organizacion_id', referencedColumnName: 'organizacion_id' },
    { name: 'mascota_id', referencedColumnName: 'mascota_id' },
    { name: 'reemplaza_id', referencedColumnName: 'id' },
  ])
  reemplaza?: Relation<VacunacionEntity>;
}
