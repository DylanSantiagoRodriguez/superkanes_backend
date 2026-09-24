import { MascotaTutorEntity } from './entities/mascota-tutor.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreateMascotaTutorDto } from './dto/create-mascota-tutor.dto';
import { UpdateMascotaTutorDto } from './dto/update-mascota-tutor.dto';

@Injectable()
export class MascotaTutorService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(identity, organizationId, MascotaTutorEntity, {
      ...query,
    });
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(
      identity,
      organizationId,
      MascotaTutorEntity,
      id,
    );
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreateMascotaTutorDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      MascotaTutorEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdateMascotaTutorDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      MascotaTutorEntity,
      id,
      dto,
      version,
    );
  }
  remove(
    identity: Identity,
    organizationId: string,
    id: string,
    version: string,
  ) {
    return this.persistence.delete(
      identity,
      organizationId,
      MascotaTutorEntity,
      id,
      version,
    );
  }
}
