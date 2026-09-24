import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { AlertaMascotaEntity } from './entities/alerta-mascota.entity';
import { AlertaMascotaController } from './alerta-mascota.controller';
import { AlertaMascotaService } from './alerta-mascota.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AlertaMascotaEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [AlertaMascotaController],
  providers: [AlertaMascotaService],
  exports: [AlertaMascotaService],
})
export class AlertaMascotaModule {}
