import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { PreferenciaComunicacionEntity } from './entities/preferencia-comunicacion.entity';
import { PreferenciaComunicacionController } from './preferencia-comunicacion.controller';
import { PreferenciaComunicacionService } from './preferencia-comunicacion.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PreferenciaComunicacionEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [PreferenciaComunicacionController],
  providers: [PreferenciaComunicacionService],
  exports: [PreferenciaComunicacionService],
})
export class PreferenciaComunicacionModule {}
