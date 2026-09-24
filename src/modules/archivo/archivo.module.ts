import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { ArchivoEntity } from './entities/archivo.entity';
import { ArchivoController } from './archivo.controller';
import { ArchivoService } from './archivo.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArchivoEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [ArchivoController],
  providers: [ArchivoService],
  exports: [ArchivoService],
})
export class ArchivoModule {}
