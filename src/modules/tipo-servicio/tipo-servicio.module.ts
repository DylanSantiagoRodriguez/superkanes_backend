import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { TipoServicioEntity } from './entities/tipo-servicio.entity';
import { TipoServicioController } from './tipo-servicio.controller';
import { TipoServicioService } from './tipo-servicio.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TipoServicioEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [TipoServicioController],
  providers: [TipoServicioService],
  exports: [TipoServicioService],
})
export class TipoServicioModule {}
