import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { RazaEntity } from './entities/raza.entity';
import { RazaController } from './raza.controller';
import { RazaService } from './raza.service';

@Module({
  imports: [TypeOrmModule.forFeature([RazaEntity]), ResourcePersistenceModule],
  controllers: [RazaController],
  providers: [RazaService],
  exports: [RazaService],
})
export class RazaModule {}
