import { MedicionClinicaEntity } from './entities/medicion-clinica.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreateMedicionClinicaDto } from './dto/create-medicion-clinica.dto';
import { UpdateMedicionClinicaDto } from './dto/update-medicion-clinica.dto';

@Injectable()
export class MedicionClinicaService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(
      identity,
      organizationId,
      MedicionClinicaEntity,
      { ...query },
    );
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(
      identity,
      organizationId,
      MedicionClinicaEntity,
      id,
    );
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreateMedicionClinicaDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      MedicionClinicaEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdateMedicionClinicaDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      MedicionClinicaEntity,
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
      MedicionClinicaEntity,
      id,
      version,
    );
  }
}
