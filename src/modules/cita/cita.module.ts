import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { CitaEntity } from './entities/cita.entity';
import { CitaController } from './cita.controller';
import { CitaService } from './cita.service';

@Module({
  imports: [TypeOrmModule.forFeature([CitaEntity]), ResourcePersistenceModule],
  controllers: [CitaController],
  providers: [CitaService],
  exports: [CitaService],
})
export class CitaModule {}
