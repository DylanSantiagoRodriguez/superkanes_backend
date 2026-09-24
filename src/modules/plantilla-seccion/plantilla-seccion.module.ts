import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { PlantillaSeccionEntity } from './entities/plantilla-seccion.entity';
import { PlantillaSeccionController } from './plantilla-seccion.controller';
import { PlantillaSeccionService } from './plantilla-seccion.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlantillaSeccionEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [PlantillaSeccionController],
  providers: [PlantillaSeccionService],
  exports: [PlantillaSeccionService],
})
export class PlantillaSeccionModule {}
