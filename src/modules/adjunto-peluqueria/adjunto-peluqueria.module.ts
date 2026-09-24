import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { AdjuntoPeluqueriaEntity } from './entities/adjunto-peluqueria.entity';
import { AdjuntoPeluqueriaController } from './adjunto-peluqueria.controller';
import { AdjuntoPeluqueriaService } from './adjunto-peluqueria.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdjuntoPeluqueriaEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [AdjuntoPeluqueriaController],
  providers: [AdjuntoPeluqueriaService],
  exports: [AdjuntoPeluqueriaService],
})
export class AdjuntoPeluqueriaModule {}
