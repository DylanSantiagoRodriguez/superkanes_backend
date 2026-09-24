import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { MascotaTutorEntity } from './entities/mascota-tutor.entity';
import { MascotaTutorController } from './mascota-tutor.controller';
import { MascotaTutorService } from './mascota-tutor.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MascotaTutorEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [MascotaTutorController],
  providers: [MascotaTutorService],
  exports: [MascotaTutorService],
})
export class MascotaTutorModule {}
