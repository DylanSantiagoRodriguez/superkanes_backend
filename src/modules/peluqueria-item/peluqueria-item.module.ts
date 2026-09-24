import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { PeluqueriaItemEntity } from './entities/peluqueria-item.entity';
import { PeluqueriaItemController } from './peluqueria-item.controller';
import { PeluqueriaItemService } from './peluqueria-item.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PeluqueriaItemEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [PeluqueriaItemController],
  providers: [PeluqueriaItemService],
  exports: [PeluqueriaItemService],
})
export class PeluqueriaItemModule {}
