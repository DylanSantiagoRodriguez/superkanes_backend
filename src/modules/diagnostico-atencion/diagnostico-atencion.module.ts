import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { DiagnosticoAtencionEntity } from './entities/diagnostico-atencion.entity';
import { DiagnosticoAtencionController } from './diagnostico-atencion.controller';
import { DiagnosticoAtencionService } from './diagnostico-atencion.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DiagnosticoAtencionEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [DiagnosticoAtencionController],
  providers: [DiagnosticoAtencionService],
  exports: [DiagnosticoAtencionService],
})
export class DiagnosticoAtencionModule {}
