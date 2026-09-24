import { Column, Entity, PrimaryColumn } from 'typeorm';
@Entity({ name: 'security_event', schema: 'auth', synchronize: false })
export class SecurityEventEntity {
  @Column({ type: 'uuid', nullable: true })
  actor_usuario_id!: string | null;
  @PrimaryColumn({ type: 'uuid', nullable: false })
  id!: string;
  @Column({ type: 'uuid', nullable: true })
  usuario_id!: string | null;
  @Column({ type: 'text', nullable: false })
  action!: string;
  @Column({ type: 'timestamptz', nullable: false })
  occurred_at!: Date;
}
