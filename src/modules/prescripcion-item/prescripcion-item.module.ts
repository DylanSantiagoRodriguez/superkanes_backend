import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { PrescripcionItemEntity } from './entities/prescripcion-item.entity';
import { PrescripcionItemController } from './prescripcion-item.controller';
import { PrescripcionItemService } from './prescripcion-item.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PrescripcionItemEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [PrescripcionItemController],
  providers: [PrescripcionItemService],
  exports: [PrescripcionItemService],
})
export class PrescripcionItemModule {}
