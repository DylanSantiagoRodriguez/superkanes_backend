import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { AdjuntoVacunacionEntity } from './entities/adjunto-vacunacion.entity';
import { AdjuntoVacunacionController } from './adjunto-vacunacion.controller';
import { AdjuntoVacunacionService } from './adjunto-vacunacion.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdjuntoVacunacionEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [AdjuntoVacunacionController],
  providers: [AdjuntoVacunacionService],
  exports: [AdjuntoVacunacionService],
})
export class AdjuntoVacunacionModule {}
