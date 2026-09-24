import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { ReporteEmitidoEntity } from './entities/reporte-emitido.entity';
import { ReporteEmitidoController } from './reporte-emitido.controller';
import { ReporteEmitidoService } from './reporte-emitido.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReporteEmitidoEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [ReporteEmitidoController],
  providers: [ReporteEmitidoService],
  exports: [ReporteEmitidoService],
})
export class ReporteEmitidoModule {}
