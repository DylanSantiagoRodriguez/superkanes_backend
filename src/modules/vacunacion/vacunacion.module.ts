import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { VacunacionEntity } from './entities/vacunacion.entity';
import { VacunacionController } from './vacunacion.controller';
import { VacunacionService } from './vacunacion.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([VacunacionEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [VacunacionController],
  providers: [VacunacionService],
  exports: [VacunacionService],
})
export class VacunacionModule {}
