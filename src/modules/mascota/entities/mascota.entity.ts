import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { ArchivoEntity } from '../../archivo/entities/archivo.entity';
import { EspecieEntity } from '../../especie/entities/especie.entity';
import { OrganizacionEntity } from '../../organizacion/entities/organizacion.entity';
import { RazaEntity } from '../../raza/entities/raza.entity';
import { UsuarioEntity } from '../../usuario/entities/usuario.entity';

@Entity({ name: 'mascota', schema: 'vet', synchronize: false })
export class MascotaEntity {
  @PrimaryColumn({
    type: 'uuid',
    nullable: false,
    default: () => 'gen_random_uuid()',
  })
  id!: string;

  @Column({ type: 'uuid', nullable: false })
  organizacion_id!: string;

  @Column({ type: 'text', nullable: false })
  codigo!: string;

  @Column({ type: 'text', nullable: false })
  nombre!: string;

  @Column({ type: 'uuid', nullable: false })
  especie_id!: string;

  @Column({ type: 'uuid', nullable: true })
  raza_id!: string | null;

  @Column({ type: 'text', nullable: false, default: () => "'desconocido'" })
  sexo!: 'macho' | 'hembra' | 'desconocido';

  @Column({ type: 'date', nullable: true })
  fecha_nacimiento!: string | null;

  @Column({ type: 'boolean', nullable: false, default: () => 'false' })
  nacimiento_estimado!: boolean;

  @Column({ type: 'text', nullable: true })
  color!: string | null;

  @Column({ type: 'text', nullable: true })
  microchip!: string | null;

  @Column({ type: 'boolean', nullable: true })
  esterilizada!: boolean | null;

  @Column({ type: 'uuid', nullable: true })
  foto_archivo_id!: string | null;

  @Column({ type: 'text', nullable: false, default: () => "'activa'" })
  estado!: 'activa' | 'inactiva' | 'fallecida';

  @Column({ type: 'date', nullable: true })
  fecha_fallecimiento!: string | null;

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

  @ManyToOne(() => EspecieEntity, {
    cascade: false,
    eager: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn([
    { name: 'organizacion_id', referencedColumnName: 'organizacion_id' },
    { name: 'especie_id', referencedColumnName: 'id' },
  ])
  especie?: Relation<EspecieEntity>;

  @ManyToOne(() => RazaEntity, {
    cascade: false,
    eager: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn([
    { name: 'organizacion_id', referencedColumnName: 'organizacion_id' },
    { name: 'especie_id', referencedColumnName: 'especie_id' },
    { name: 'raza_id', referencedColumnName: 'id' },
  ])
  raza?: Relation<RazaEntity>;

  @ManyToOne(() => ArchivoEntity, {
    cascade: false,
    eager: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn([
    { name: 'organizacion_id', referencedColumnName: 'organizacion_id' },
    { name: 'foto_archivo_id', referencedColumnName: 'id' },
  ])
  fotoArchivo?: Relation<ArchivoEntity>;
}
