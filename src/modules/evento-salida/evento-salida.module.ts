import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { EventoSalidaEntity } from './entities/evento-salida.entity';
import { EventoSalidaController } from './evento-salida.controller';
import { EventoSalidaService } from './evento-salida.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventoSalidaEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [EventoSalidaController],
  providers: [EventoSalidaService],
  exports: [EventoSalidaService],
})
export class EventoSalidaModule {}
