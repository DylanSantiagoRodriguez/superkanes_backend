import { AdjuntoVacunacionEntity } from './entities/adjunto-vacunacion.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreateAdjuntoVacunacionDto } from './dto/create-adjunto-vacunacion.dto';
import { UpdateAdjuntoVacunacionDto } from './dto/update-adjunto-vacunacion.dto';

@Injectable()
export class AdjuntoVacunacionService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(
      identity,
      organizationId,
      AdjuntoVacunacionEntity,
      { ...query },
    );
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(
      identity,
      organizationId,
      AdjuntoVacunacionEntity,
      id,
    );
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreateAdjuntoVacunacionDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      AdjuntoVacunacionEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdateAdjuntoVacunacionDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      AdjuntoVacunacionEntity,
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
      AdjuntoVacunacionEntity,
      id,
      version,
    );
  }
}
