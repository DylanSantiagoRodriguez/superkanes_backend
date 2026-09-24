import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { EspecieEntity } from './entities/especie.entity';
import { EspecieController } from './especie.controller';
import { EspecieService } from './especie.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([EspecieEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [EspecieController],
  providers: [EspecieService],
  exports: [EspecieService],
})
export class EspecieModule {}
