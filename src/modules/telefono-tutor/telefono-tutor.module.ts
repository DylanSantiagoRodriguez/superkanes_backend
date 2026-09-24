import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { TelefonoTutorEntity } from './entities/telefono-tutor.entity';
import { TelefonoTutorController } from './telefono-tutor.controller';
import { TelefonoTutorService } from './telefono-tutor.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TelefonoTutorEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [TelefonoTutorController],
  providers: [TelefonoTutorService],
  exports: [TelefonoTutorService],
})
export class TelefonoTutorModule {}
