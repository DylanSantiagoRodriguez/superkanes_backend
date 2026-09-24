import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { MembresiaEntity } from './entities/membresia.entity';
import { MembresiaController } from './membresia.controller';
import { MembresiaService } from './membresia.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MembresiaEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [MembresiaController],
  providers: [MembresiaService],
  exports: [MembresiaService],
})
export class MembresiaModule {}
