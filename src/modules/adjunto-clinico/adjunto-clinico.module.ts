import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { AdjuntoClinicoEntity } from './entities/adjunto-clinico.entity';
import { AdjuntoClinicoController } from './adjunto-clinico.controller';
import { AdjuntoClinicoService } from './adjunto-clinico.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdjuntoClinicoEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [AdjuntoClinicoController],
  providers: [AdjuntoClinicoService],
  exports: [AdjuntoClinicoService],
})
export class AdjuntoClinicoModule {}
