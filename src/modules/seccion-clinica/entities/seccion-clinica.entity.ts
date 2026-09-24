import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { OrganizacionEntity } from '../../organizacion/entities/organizacion.entity';
import { PlantillaSeccionEntity } from '../../plantilla-seccion/entities/plantilla-seccion.entity';
import { RevisionClinicaEntity } from '../../revision-clinica/entities/revision-clinica.entity';
import { UsuarioEntity } from '../../usuario/entities/usuario.entity';

@Entity({ name: 'seccion_clinica', schema: 'vet', synchronize: false })
export class SeccionClinicaEntity {
  @PrimaryColumn({
    type: 'uuid',
    nullable: false,
    default: () => 'gen_random_uuid()',
  })
  id!: string;

  @Column({ type: 'uuid', nullable: false })
  organizacion_id!: string;

  @Column({ type: 'uuid', nullable: false })
  revision_id!: string;

  @Column({ type: 'uuid', nullable: false })
  tipo_seccion_id!: string;

  @Column({ type: 'uuid', nullable: false })
  plantilla_id!: string;

  @Column({ type: 'text', nullable: false, default: () => "'no_evaluado'" })
  estado_evaluacion!: 'no_evaluado' | 'sin_hallazgos' | 'con_hallazgos';

  @Column({ type: 'text', nullable: true })
  hallazgos!: string | null;

  @Column({ type: 'jsonb', nullable: false, default: () => "'{}'::jsonb" })
  datos_estructurados!: Record<string, unknown> | unknown[];

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

  @ManyToOne(() => RevisionClinicaEntity, {
    cascade: false,
    eager: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn([
    { name: 'organizacion_id', referencedColumnName: 'organizacion_id' },
    { name: 'revision_id', referencedColumnName: 'id' },
  ])
  revision?: Relation<RevisionClinicaEntity>;

  @ManyToOne(() => PlantillaSeccionEntity, {
    cascade: false,
    eager: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn([
    { name: 'organizacion_id', referencedColumnName: 'organizacion_id' },
    { name: 'tipo_seccion_id', referencedColumnName: 'tipo_seccion_id' },
    { name: 'plantilla_id', referencedColumnName: 'id' },
  ])
  plantilla?: Relation<PlantillaSeccionEntity>;
}
