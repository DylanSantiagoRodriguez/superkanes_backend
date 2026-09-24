import { Column, Entity, PrimaryColumn } from 'typeorm';
@Entity({ name: 'login_bucket', schema: 'auth', synchronize: false })
export class LoginBucketEntity {
  @PrimaryColumn({ type: 'char', nullable: false, length: 64 })
  key!: string;
  @Column({ type: 'integer', nullable: false })
  attempts!: number;
  @Column({ type: 'timestamptz', nullable: false })
  expires_at!: Date;
}
