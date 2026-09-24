import { TipoSeccionClinicaEntity } from './entities/tipo-seccion-clinica.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreateTipoSeccionClinicaDto } from './dto/create-tipo-seccion-clinica.dto';
import { UpdateTipoSeccionClinicaDto } from './dto/update-tipo-seccion-clinica.dto';

@Injectable()
export class TipoSeccionClinicaService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(
      identity,
      organizationId,
      TipoSeccionClinicaEntity,
      { ...query },
    );
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(
      identity,
      organizationId,
      TipoSeccionClinicaEntity,
      id,
    );
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreateTipoSeccionClinicaDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      TipoSeccionClinicaEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdateTipoSeccionClinicaDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      TipoSeccionClinicaEntity,
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
      TipoSeccionClinicaEntity,
      id,
      version,
    );
  }
}
