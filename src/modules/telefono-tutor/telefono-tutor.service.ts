import { TelefonoTutorEntity } from './entities/telefono-tutor.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreateTelefonoTutorDto } from './dto/create-telefono-tutor.dto';
import { UpdateTelefonoTutorDto } from './dto/update-telefono-tutor.dto';

@Injectable()
export class TelefonoTutorService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(
      identity,
      organizationId,
      TelefonoTutorEntity,
      { ...query },
    );
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(
      identity,
      organizationId,
      TelefonoTutorEntity,
      id,
    );
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreateTelefonoTutorDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      TelefonoTutorEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdateTelefonoTutorDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      TelefonoTutorEntity,
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
      TelefonoTutorEntity,
      id,
      version,
    );
  }
}
