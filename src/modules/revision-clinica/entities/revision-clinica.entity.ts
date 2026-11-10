import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { AtencionClinicaEntity } from '../../atencion-clinica/entities/atencion-clinica.entity';
import { OrganizacionEntity } from '../../organizacion/entities/organizacion.entity';
import { UsuarioEntity } from '../../usuario/entities/usuario.entity';

@Entity({ name: 'revision_clinica', schema: 'vet', synchronize: false })
export class RevisionClinicaEntity {
  @PrimaryColumn({
    type: 'uuid',
    nullable: false,
    default: () => 'gen_random_uuid()',
  })
  id!: string;

  @Column({ type: 'uuid', nullable: false })
  organizacion_id!: string;

  @Column({ type: 'uuid', nullable: false })
  atencion_id!: string;

  @Column({ type: 'integer', nullable: false })
  numero!: number;

  @Column({ type: 'uuid', nullable: true })
  revision_previa_id!: string | null;

  @Column({ type: 'text', nullable: true })
  motivo_cambio!: string | null;

  @Column({ type: 'text', nullable: false })
  motivo_consulta!: string;

  @Column({ type: 'jsonb', nullable: true })
  documento!: Record<string, unknown> | null;

  @Column({ type: 'text', nullable: true })
  anamnesis!: string | null;

  @Column({ type: 'text', nullable: true })
  examen_fisico!: string | null;

  @Column({ type: 'text', nullable: true })
  evaluacion!: string | null;

  @Column({ type: 'text', nullable: true })
  plan!: string | null;

  @Column({ type: 'text', nullable: false, default: () => "'borrador'" })
  estado!: 'borrador' | 'cerrada';

  @Column({ type: 'timestamptz', nullable: true })
  cerrada_en!: Date | null;

  @Column({ type: 'uuid', nullable: true })
  cerrada_por!: string | null;

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

  @ManyToOne(() => AtencionClinicaEntity, {
    cascade: false,
    eager: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn([
    { name: 'organizacion_id', referencedColumnName: 'organizacion_id' },
    { name: 'atencion_id', referencedColumnName: 'id' },
  ])
  atencion?: Relation<AtencionClinicaEntity>;

  @ManyToOne(() => RevisionClinicaEntity, {
    cascade: false,
    eager: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn([
    { name: 'organizacion_id', referencedColumnName: 'organizacion_id' },
    { name: 'atencion_id', referencedColumnName: 'atencion_id' },
    { name: 'revision_previa_id', referencedColumnName: 'id' },
  ])
  revisionPrevia?: Relation<RevisionClinicaEntity>;

  @ManyToOne(() => UsuarioEntity, {
    cascade: false,
    eager: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn([{ name: 'cerrada_por', referencedColumnName: 'id' }])
  cerradaPor?: Relation<UsuarioEntity>;
}
