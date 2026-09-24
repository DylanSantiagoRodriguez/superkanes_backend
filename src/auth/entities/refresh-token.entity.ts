import { Column, Entity, PrimaryColumn } from 'typeorm';
@Entity({ name: 'refresh_token', schema: 'auth', synchronize: false })
export class RefreshTokenEntity {
  @PrimaryColumn({ type: 'char', nullable: false, length: 64, select: false })
  token_hash!: string;
  @Column({ type: 'uuid', nullable: false })
  session_id!: string;
  @Column({ type: 'timestamptz', nullable: true })
  consumed_at!: Date | null;
  @Column({ type: 'timestamptz', nullable: false })
  created_at!: Date;
}
