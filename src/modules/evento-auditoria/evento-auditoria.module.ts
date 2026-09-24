import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { EventoAuditoriaEntity } from './entities/evento-auditoria.entity';
import { EventoAuditoriaController } from './evento-auditoria.controller';
import { EventoAuditoriaService } from './evento-auditoria.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventoAuditoriaEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [EventoAuditoriaController],
  providers: [EventoAuditoriaService],
  exports: [EventoAuditoriaService],
})
export class EventoAuditoriaModule {}
