import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { ArchivoEntity } from '../../archivo/entities/archivo.entity';
import { OrganizacionEntity } from '../../organizacion/entities/organizacion.entity';
import { PlantillaConsentimientoEntity } from '../../plantilla-consentimiento/entities/plantilla-consentimiento.entity';
import { ServicioPeluqueriaEntity } from '../../servicio-peluqueria/entities/servicio-peluqueria.entity';
import { UsuarioEntity } from '../../usuario/entities/usuario.entity';

@Entity({ name: 'consentimiento', schema: 'vet', synchronize: false })
export class ConsentimientoEntity {
  @PrimaryColumn({
    type: 'uuid',
    nullable: false,
    default: () => 'gen_random_uuid()',
  })
  id!: string;

  @Column({ type: 'uuid', nullable: false })
  organizacion_id!: string;

  @Column({ type: 'uuid', nullable: false })
  servicio_id!: string;

  @Column({ type: 'uuid', nullable: false })
  plantilla_id!: string;

  @Column({ type: 'uuid', nullable: false })
  documento_archivo_id!: string;

  @Column({ type: 'char', nullable: false, length: 64 })
  hash_documento!: string;

  @Column({ type: 'text', nullable: false, default: () => "'pendiente'" })
  estado!: 'pendiente' | 'aceptado' | 'rechazado' | 'revocado';

  @Column({ type: 'timestamptz', nullable: false, default: () => 'now()' })
  emitido_en!: Date;

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

  @ManyToOne(() => ServicioPeluqueriaEntity, {
    cascade: false,
    eager: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn([
    { name: 'organizacion_id', referencedColumnName: 'organizacion_id' },
    { name: 'servicio_id', referencedColumnName: 'id' },
  ])
  servicio?: Relation<ServicioPeluqueriaEntity>;

  @ManyToOne(() => PlantillaConsentimientoEntity, {
    cascade: false,
    eager: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn([
    { name: 'organizacion_id', referencedColumnName: 'organizacion_id' },
    { name: 'plantilla_id', referencedColumnName: 'id' },
  ])
  plantilla?: Relation<PlantillaConsentimientoEntity>;

  @ManyToOne(() => ArchivoEntity, {
    cascade: false,
    eager: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn([
    { name: 'organizacion_id', referencedColumnName: 'organizacion_id' },
    { name: 'documento_archivo_id', referencedColumnName: 'id' },
  ])
  documentoArchivo?: Relation<ArchivoEntity>;
}
