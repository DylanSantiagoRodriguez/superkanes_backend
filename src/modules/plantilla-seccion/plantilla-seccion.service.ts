import { PlantillaSeccionEntity } from './entities/plantilla-seccion.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreatePlantillaSeccionDto } from './dto/create-plantilla-seccion.dto';
import { UpdatePlantillaSeccionDto } from './dto/update-plantilla-seccion.dto';

@Injectable()
export class PlantillaSeccionService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(
      identity,
      organizationId,
      PlantillaSeccionEntity,
      { ...query },
    );
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(
      identity,
      organizationId,
      PlantillaSeccionEntity,
      id,
    );
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreatePlantillaSeccionDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      PlantillaSeccionEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdatePlantillaSeccionDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      PlantillaSeccionEntity,
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
      PlantillaSeccionEntity,
      id,
      version,
    );
  }
}
