import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { ProfesionalEntity } from './entities/profesional.entity';
import { ProfesionalController } from './profesional.controller';
import { ProfesionalService } from './profesional.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProfesionalEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [ProfesionalController],
  providers: [ProfesionalService],
  exports: [ProfesionalService],
})
export class ProfesionalModule {}
