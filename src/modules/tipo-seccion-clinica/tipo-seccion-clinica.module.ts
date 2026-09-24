import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { TipoSeccionClinicaEntity } from './entities/tipo-seccion-clinica.entity';
import { TipoSeccionClinicaController } from './tipo-seccion-clinica.controller';
import { TipoSeccionClinicaService } from './tipo-seccion-clinica.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TipoSeccionClinicaEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [TipoSeccionClinicaController],
  providers: [TipoSeccionClinicaService],
  exports: [TipoSeccionClinicaService],
})
export class TipoSeccionClinicaModule {}
