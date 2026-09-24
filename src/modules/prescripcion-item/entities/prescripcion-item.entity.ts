import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { MedicamentoEntity } from '../../medicamento/entities/medicamento.entity';
import { OrganizacionEntity } from '../../organizacion/entities/organizacion.entity';
import { PrescripcionEntity } from '../../prescripcion/entities/prescripcion.entity';
import { UsuarioEntity } from '../../usuario/entities/usuario.entity';

@Entity({ name: 'prescripcion_item', schema: 'vet', synchronize: false })
export class PrescripcionItemEntity {
  @PrimaryColumn({
    type: 'uuid',
    nullable: false,
    default: () => 'gen_random_uuid()',
  })
  id!: string;

  @Column({ type: 'uuid', nullable: false })
  organizacion_id!: string;

  @Column({ type: 'uuid', nullable: false })
  prescripcion_id!: string;

  @Column({ type: 'uuid', nullable: false })
  medicamento_id!: string;

  @Column({ type: 'text', nullable: false })
  descripcion_emitida!: string;

  @Column({ type: 'numeric', nullable: true, precision: 12, scale: 4 })
  dosis!: string | null;

  @Column({ type: 'text', nullable: true })
  unidad_dosis!: string | null;

  @Column({ type: 'text', nullable: false })
  via!: string;

  @Column({ type: 'text', nullable: false })
  frecuencia!: string;

  @Column({ type: 'text', nullable: false })
  duracion!: string;

  @Column({ type: 'numeric', nullable: true, precision: 12, scale: 3 })
  cantidad!: string | null;

  @Column({ type: 'text', nullable: false })
  instrucciones!: string;

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

  @ManyToOne(() => PrescripcionEntity, {
    cascade: false,
    eager: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn([
    { name: 'organizacion_id', referencedColumnName: 'organizacion_id' },
    { name: 'prescripcion_id', referencedColumnName: 'id' },
  ])
  prescripcion?: Relation<PrescripcionEntity>;

  @ManyToOne(() => MedicamentoEntity, {
    cascade: false,
    eager: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn([
    { name: 'organizacion_id', referencedColumnName: 'organizacion_id' },
    { name: 'medicamento_id', referencedColumnName: 'id' },
  ])
  medicamento?: Relation<MedicamentoEntity>;
}
