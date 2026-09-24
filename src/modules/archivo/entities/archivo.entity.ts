import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { OrganizacionEntity } from '../../organizacion/entities/organizacion.entity';
import { UsuarioEntity } from '../../usuario/entities/usuario.entity';

@Entity({ name: 'archivo', schema: 'vet', synchronize: false })
export class ArchivoEntity {
  @PrimaryColumn({
    type: 'uuid',
    nullable: false,
    default: () => 'gen_random_uuid()',
  })
  id!: string;

  @Column({ type: 'uuid', nullable: false })
  organizacion_id!: string;

  @Column({ type: 'text', nullable: false })
  proveedor!: 'minio' | 'local';

  @Column({ type: 'text', nullable: false })
  contenedor!: string;

  @Column({ type: 'text', nullable: false })
  ruta_relativa!: string;

  @Column({ type: 'text', nullable: true })
  version_objeto!: string | null;

  @Column({ type: 'text', nullable: false })
  nombre_original!: string;

  @Column({ type: 'text', nullable: true })
  mime_detectado!: string | null;

  @Column({ type: 'bigint', nullable: true })
  tamano_bytes!: string | null;

  @Column({ type: 'char', nullable: true, length: 64 })
  sha256!: string | null;

  @Column({ type: 'text', nullable: false })
  categoria!: string;

  @Column({ type: 'text', nullable: false, default: () => "'pendiente'" })
  estado_analisis!: 'pendiente' | 'disponible' | 'rechazado';

  @Column({ type: 'timestamptz', nullable: false, default: () => 'now()' })
  cargado_en!: Date;

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
}
