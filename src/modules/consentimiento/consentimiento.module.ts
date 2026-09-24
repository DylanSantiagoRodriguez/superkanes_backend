import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { ConsentimientoEntity } from './entities/consentimiento.entity';
import { ConsentimientoController } from './consentimiento.controller';
import { ConsentimientoService } from './consentimiento.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConsentimientoEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [ConsentimientoController],
  providers: [ConsentimientoService],
  exports: [ConsentimientoService],
})
export class ConsentimientoModule {}
