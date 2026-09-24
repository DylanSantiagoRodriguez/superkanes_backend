import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { SeccionClinicaEntity } from './entities/seccion-clinica.entity';
import { SeccionClinicaController } from './seccion-clinica.controller';
import { SeccionClinicaService } from './seccion-clinica.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SeccionClinicaEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [SeccionClinicaController],
  providers: [SeccionClinicaService],
  exports: [SeccionClinicaService],
})
export class SeccionClinicaModule {}
