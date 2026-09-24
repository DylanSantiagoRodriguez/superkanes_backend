import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { OrganizacionEntity } from '../../organizacion/entities/organizacion.entity';
import { UsuarioEntity } from '../../usuario/entities/usuario.entity';

@Entity({ name: 'evento_auditoria', schema: 'vet', synchronize: false })
export class EventoAuditoriaEntity {
  @PrimaryColumn({
    type: 'uuid',
    nullable: false,
    default: () => 'gen_random_uuid()',
  })
  id!: string;

  @Column({ type: 'uuid', nullable: false })
  organizacion_id!: string;

  @Column({ type: 'uuid', nullable: true })
  actor_usuario_id!: string | null;

  @Column({ type: 'text', nullable: true })
  actor_servicio!: string | null;

  @Column({ type: 'text', nullable: false })
  accion!: string;

  @Column({ type: 'text', nullable: false })
  entidad!: string;

  @Column({ type: 'uuid', nullable: false })
  registro_id!: string;

  @Column({
    type: 'timestamptz',
    nullable: false,
    default: () => 'clock_timestamp()',
  })
  ocurrido_en!: Date;

  @Column({ type: 'jsonb', nullable: false, default: () => "'[]'::jsonb" })
  campos_modificados!: Record<string, unknown> | unknown[];

  @Column({ type: 'text', nullable: true })
  motivo!: string | null;

  @Column({ type: 'uuid', nullable: true })
  request_id!: string | null;

  @Column({ type: 'inet', nullable: true })
  ip!: string | null;

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
  @JoinColumn([{ name: 'actor_usuario_id', referencedColumnName: 'id' }])
  actorUsuario?: Relation<UsuarioEntity>;
}
