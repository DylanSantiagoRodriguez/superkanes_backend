import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { SedeEntity } from './entities/sede.entity';
import { SedeController } from './sede.controller';
import { SedeService } from './sede.service';

@Module({
  imports: [TypeOrmModule.forFeature([SedeEntity]), ResourcePersistenceModule],
  controllers: [SedeController],
  providers: [SedeService],
  exports: [SedeService],
})
export class SedeModule {}
