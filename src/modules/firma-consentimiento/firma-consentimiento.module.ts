import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { FirmaConsentimientoEntity } from './entities/firma-consentimiento.entity';
import { FirmaConsentimientoController } from './firma-consentimiento.controller';
import { FirmaConsentimientoService } from './firma-consentimiento.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FirmaConsentimientoEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [FirmaConsentimientoController],
  providers: [FirmaConsentimientoService],
  exports: [FirmaConsentimientoService],
})
export class FirmaConsentimientoModule {}
