import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { PrescripcionEntity } from './entities/prescripcion.entity';
import { PrescripcionController } from './prescripcion.controller';
import { PrescripcionService } from './prescripcion.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PrescripcionEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [PrescripcionController],
  providers: [PrescripcionService],
  exports: [PrescripcionService],
})
export class PrescripcionModule {}
