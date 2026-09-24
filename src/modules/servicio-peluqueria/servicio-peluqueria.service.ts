import { ServicioPeluqueriaEntity } from './entities/servicio-peluqueria.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreateServicioPeluqueriaDto } from './dto/create-servicio-peluqueria.dto';
import { UpdateServicioPeluqueriaDto } from './dto/update-servicio-peluqueria.dto';

@Injectable()
export class ServicioPeluqueriaService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(
      identity,
      organizationId,
      ServicioPeluqueriaEntity,
      { ...query },
    );
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(
      identity,
      organizationId,
      ServicioPeluqueriaEntity,
      id,
    );
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreateServicioPeluqueriaDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      ServicioPeluqueriaEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdateServicioPeluqueriaDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      ServicioPeluqueriaEntity,
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
      ServicioPeluqueriaEntity,
      id,
      version,
    );
  }
}
