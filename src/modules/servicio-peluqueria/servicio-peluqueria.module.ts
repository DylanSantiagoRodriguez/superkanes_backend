import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { ServicioPeluqueriaEntity } from './entities/servicio-peluqueria.entity';
import { ServicioPeluqueriaController } from './servicio-peluqueria.controller';
import { ServicioPeluqueriaService } from './servicio-peluqueria.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServicioPeluqueriaEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [ServicioPeluqueriaController],
  providers: [ServicioPeluqueriaService],
  exports: [ServicioPeluqueriaService],
})
export class ServicioPeluqueriaModule {}
