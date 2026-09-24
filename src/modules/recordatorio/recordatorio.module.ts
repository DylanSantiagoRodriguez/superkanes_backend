import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { RecordatorioEntity } from './entities/recordatorio.entity';
import { RecordatorioController } from './recordatorio.controller';
import { RecordatorioService } from './recordatorio.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RecordatorioEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [RecordatorioController],
  providers: [RecordatorioService],
  exports: [RecordatorioService],
})
export class RecordatorioModule {}
