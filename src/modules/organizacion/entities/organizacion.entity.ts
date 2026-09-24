import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { UsuarioEntity } from '../../usuario/entities/usuario.entity';

@Entity({ name: 'organizacion', schema: 'vet', synchronize: false })
export class OrganizacionEntity {
  @PrimaryColumn({
    type: 'uuid',
    nullable: false,
    default: () => 'gen_random_uuid()',
  })
  id!: string;

  @Column({ type: 'text', nullable: false })
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  identificacion_fiscal!: string | null;

  @Column({ type: 'text', nullable: false, default: () => "'activa'" })
  estado!: 'activa' | 'suspendida' | 'inactiva';

  @Column({ type: 'text', nullable: false, default: () => "'America/Bogota'" })
  zona_horaria_default!: string;

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
}
