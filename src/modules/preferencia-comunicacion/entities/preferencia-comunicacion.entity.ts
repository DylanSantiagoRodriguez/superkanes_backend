import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { ArchivoEntity } from '../../archivo/entities/archivo.entity';
import { OrganizacionEntity } from '../../organizacion/entities/organizacion.entity';
import { TutorEntity } from '../../tutor/entities/tutor.entity';
import { UsuarioEntity } from '../../usuario/entities/usuario.entity';

@Entity({ name: 'preferencia_comunicacion', schema: 'vet', synchronize: false })
export class PreferenciaComunicacionEntity {
  @PrimaryColumn({
    type: 'uuid',
    nullable: false,
    default: () => 'gen_random_uuid()',
  })
  id!: string;

  @Column({ type: 'uuid', nullable: false })
  organizacion_id!: string;

  @Column({ type: 'uuid', nullable: false })
  tutor_id!: string;

  @Column({ type: 'text', nullable: false })
  canal!: 'email' | 'sms' | 'whatsapp' | 'push' | 'telefono';

  @Column({ type: 'text', nullable: false })
  finalidad!: string;

  @Column({ type: 'text', nullable: false })
  estado!: 'aceptada' | 'revocada';

  @Column({ type: 'timestamptz', nullable: false, default: () => 'now()' })
  registrada_en!: Date;

  @Column({ type: 'text', nullable: false })
  fuente!: string;

  @Column({ type: 'uuid', nullable: true })
  evidencia_archivo_id!: string | null;

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
