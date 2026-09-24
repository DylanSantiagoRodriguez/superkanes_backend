import { AdjuntoPeluqueriaEntity } from './entities/adjunto-peluqueria.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreateAdjuntoPeluqueriaDto } from './dto/create-adjunto-peluqueria.dto';
import { UpdateAdjuntoPeluqueriaDto } from './dto/update-adjunto-peluqueria.dto';

@Injectable()
export class AdjuntoPeluqueriaService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(
      identity,
      organizationId,
      AdjuntoPeluqueriaEntity,
      { ...query },
    );
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(
      identity,
      organizationId,
      AdjuntoPeluqueriaEntity,
      id,
    );
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreateAdjuntoPeluqueriaDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      AdjuntoPeluqueriaEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdateAdjuntoPeluqueriaDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      AdjuntoPeluqueriaEntity,
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
      AdjuntoPeluqueriaEntity,
      id,
      version,
    );
  }
}
