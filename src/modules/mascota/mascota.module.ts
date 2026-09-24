import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { MascotaEntity } from './entities/mascota.entity';
import { MascotaController } from './mascota.controller';
import { MascotaService } from './mascota.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MascotaEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [MascotaController],
  providers: [MascotaService],
  exports: [MascotaService],
})
export class MascotaModule {}
