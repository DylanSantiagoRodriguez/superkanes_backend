import { PlantillaConsentimientoEntity } from './entities/plantilla-consentimiento.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreatePlantillaConsentimientoDto } from './dto/create-plantilla-consentimiento.dto';
import { UpdatePlantillaConsentimientoDto } from './dto/update-plantilla-consentimiento.dto';

@Injectable()
export class PlantillaConsentimientoService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(
      identity,
      organizationId,
      PlantillaConsentimientoEntity,
      { ...query },
    );
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(
      identity,
      organizationId,
      PlantillaConsentimientoEntity,
      id,
    );
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreatePlantillaConsentimientoDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      PlantillaConsentimientoEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdatePlantillaConsentimientoDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      PlantillaConsentimientoEntity,
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
      PlantillaConsentimientoEntity,
      id,
      version,
    );
  }
}
