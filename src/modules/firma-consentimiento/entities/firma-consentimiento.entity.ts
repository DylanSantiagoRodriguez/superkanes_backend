import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { ArchivoEntity } from '../../archivo/entities/archivo.entity';
import { ConsentimientoEntity } from '../../consentimiento/entities/consentimiento.entity';
import { OrganizacionEntity } from '../../organizacion/entities/organizacion.entity';
import { TutorEntity } from '../../tutor/entities/tutor.entity';
import { UsuarioEntity } from '../../usuario/entities/usuario.entity';

@Entity({ name: 'firma_consentimiento', schema: 'vet', synchronize: false })
export class FirmaConsentimientoEntity {
  @PrimaryColumn({
    type: 'uuid',
    nullable: false,
    default: () => 'gen_random_uuid()',
  })
  id!: string;

  @Column({ type: 'uuid', nullable: false })
  organizacion_id!: string;

  @Column({ type: 'uuid', nullable: false })
  consentimiento_id!: string;

  @Column({ type: 'uuid', nullable: false })
  tutor_id!: string;

  @Column({ type: 'jsonb', nullable: false })
  identidad_firmante_snapshot!: Record<string, unknown> | unknown[];

  @Column({ type: 'timestamptz', nullable: false, default: () => 'now()' })
  firmado_en!: Date;

  @Column({ type: 'text', nullable: false })
  metodo!: 'presencial_digital' | 'documento_escaneado' | 'firma_electronica';

  @Column({ type: 'uuid', nullable: false })
  evidencia_archivo_id!: string;

  @Column({ type: 'char', nullable: false, length: 64 })
  hash_documento_aceptado!: string;

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

  @ManyToOne(() => ConsentimientoEntity, {
    cascade: false,
    eager: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn([
    { name: 'organizacion_id', referencedColumnName: 'organizacion_id' },
    { name: 'consentimiento_id', referencedColumnName: 'id' },
    { name: 'hash_documento_aceptado', referencedColumnName: 'hash_documento' },
  ])
  consentimiento?: Relation<ConsentimientoEntity>;

  @ManyToOne(() => TutorEntity, {
    cascade: false,
    eager: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn([
    { name: 'organizacion_id', referencedColumnName: 'organizacion_id' },
    { name: 'tutor_id', referencedColumnName: 'id' },
  ])
  tutor?: Relation<TutorEntity>;

  @ManyToOne(() => ArchivoEntity, {
    cascade: false,
    eager: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn([
    { name: 'organizacion_id', referencedColumnName: 'organizacion_id' },
    { name: 'evidencia_archivo_id', referencedColumnName: 'id' },
  ])
  evidenciaArchivo?: Relation<ArchivoEntity>;
}
