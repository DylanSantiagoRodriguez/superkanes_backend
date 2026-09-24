import { AdjuntoClinicoEntity } from './entities/adjunto-clinico.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreateAdjuntoClinicoDto } from './dto/create-adjunto-clinico.dto';
import { UpdateAdjuntoClinicoDto } from './dto/update-adjunto-clinico.dto';

@Injectable()
export class AdjuntoClinicoService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(
      identity,
      organizationId,
      AdjuntoClinicoEntity,
      { ...query },
    );
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(
      identity,
      organizationId,
      AdjuntoClinicoEntity,
      id,
    );
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreateAdjuntoClinicoDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      AdjuntoClinicoEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdateAdjuntoClinicoDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      AdjuntoClinicoEntity,
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
      AdjuntoClinicoEntity,
      id,
      version,
    );
  }
}
