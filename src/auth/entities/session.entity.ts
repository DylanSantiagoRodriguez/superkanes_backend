import { Column, Entity, PrimaryColumn } from 'typeorm';
@Entity({ name: 'session', schema: 'auth', synchronize: false })
export class SessionEntity {
  @PrimaryColumn({ type: 'uuid', nullable: false })
  id!: string;
  @Column({ type: 'uuid', nullable: false })
  usuario_id!: string;
  @Column({ type: 'integer', nullable: false })
  credential_version!: number;
  @Column({ type: 'timestamptz', nullable: false })
  created_at!: Date;
  @Column({ type: 'timestamptz', nullable: false })
  expires_at!: Date;
  @Column({ type: 'timestamptz', nullable: true })
  revoked_at!: Date | null;
}
