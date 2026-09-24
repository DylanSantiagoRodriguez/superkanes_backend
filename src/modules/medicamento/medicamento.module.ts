import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { MedicamentoEntity } from './entities/medicamento.entity';
import { MedicamentoController } from './medicamento.controller';
import { MedicamentoService } from './medicamento.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicamentoEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [MedicamentoController],
  providers: [MedicamentoService],
  exports: [MedicamentoService],
})
export class MedicamentoModule {}
