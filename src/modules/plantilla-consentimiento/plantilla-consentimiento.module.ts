import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { PlantillaConsentimientoEntity } from './entities/plantilla-consentimiento.entity';
import { PlantillaConsentimientoController } from './plantilla-consentimiento.controller';
import { PlantillaConsentimientoService } from './plantilla-consentimiento.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlantillaConsentimientoEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [PlantillaConsentimientoController],
  providers: [PlantillaConsentimientoService],
  exports: [PlantillaConsentimientoService],
})
export class PlantillaConsentimientoModule {}
