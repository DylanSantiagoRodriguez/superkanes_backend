import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { VacunaEntity } from './entities/vacuna.entity';
import { VacunaController } from './vacuna.controller';
import { VacunaService } from './vacuna.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([VacunaEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [VacunaController],
  providers: [VacunaService],
  exports: [VacunaService],
})
export class VacunaModule {}
