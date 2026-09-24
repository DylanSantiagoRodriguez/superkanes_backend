import { Column, Entity, PrimaryColumn } from 'typeorm';
@Entity({ name: 'credential', schema: 'auth', synchronize: false })
export class CredentialEntity {
  @PrimaryColumn({ type: 'uuid', nullable: false })
  usuario_id!: string;
  @Column({ type: 'text', nullable: false, select: false })
  password_hash!: string;
  @Column({ type: 'integer', nullable: false })
  version!: number;
  @Column({ type: 'boolean', nullable: false })
  platform_admin!: boolean;
  @Column({ type: 'timestamptz', nullable: false })
  changed_at!: Date;
}
