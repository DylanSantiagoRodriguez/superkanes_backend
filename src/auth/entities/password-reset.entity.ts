import { Column, Entity, PrimaryColumn } from 'typeorm';
@Entity({ name: 'password_reset', schema: 'auth', synchronize: false })
export class PasswordResetEntity {
  @PrimaryColumn({ type: 'char', nullable: false, length: 64, select: false })
  token_hash!: string;
  @Column({ type: 'uuid', nullable: false })
  usuario_id!: string;
  @Column({ type: 'timestamptz', nullable: false })
  expires_at!: Date;
  @Column({ type: 'timestamptz', nullable: true })
  used_at!: Date | null;
}
