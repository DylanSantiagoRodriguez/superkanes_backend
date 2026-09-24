import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { ArchivoEntity } from '../../archivo/entities/archivo.entity';
import { MascotaEntity } from '../../mascota/entities/mascota.entity';
import { OrganizacionEntity } from '../../organizacion/entities/organizacion.entity';
import { UsuarioEntity } from '../../usuario/entities/usuario.entity';

@Entity({ name: 'reporte_emitido', schema: 'vet', synchronize: false })
export class ReporteEmitidoEntity {
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

  @Column({ type: 'text', nullable: false })
  tipo!: string;

  @Column({ type: 'jsonb', nullable: false, default: () => "'{}'::jsonb" })
  parametros!: Record<string, unknown> | unknown[];

  @Column({ type: 'jsonb', nullable: false })
  datos_identificacion_snapshot!: Record<string, unknown> | unknown[];

  @Column({ type: 'jsonb', nullable: false })
  fuentes_versionadas!: Record<string, unknown> | unknown[];

  @Column({ type: 'text', nullable: false })
  version_plantilla!: string;

  @Column({ type: 'uuid', nullable: false })
  archivo_id!: string;

  @Column({ type: 'timestamptz', nullable: false, default: () => 'now()' })
  emitido_en!: Date;

  @Column({ type: 'uuid', nullable: false })
  emitido_por!: string;

  @Column({ type: 'timestamptz', nullable: false, default: () => 'now()' })
  creado_en!: Date;

  @Column({ type: 'uuid', nullable: true })
  creado_por!: string | null;

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

  @ManyToOne(() => ArchivoEntity, {
    cascade: false,
    eager: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn([
    { name: 'organizacion_id', referencedColumnName: 'organizacion_id' },
    { name: 'archivo_id', referencedColumnName: 'id' },
  ])
  archivo?: Relation<ArchivoEntity>;

  @ManyToOne(() => UsuarioEntity, {
    cascade: false,
    eager: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn([{ name: 'emitido_por', referencedColumnName: 'id' }])
  emitidoPor?: Relation<UsuarioEntity>;
}
