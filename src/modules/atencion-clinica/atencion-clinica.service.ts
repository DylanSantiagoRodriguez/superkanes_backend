import { CreateAtencionHistoriaDto } from './dto/create-atencion-historia.dto';
import { AtencionClinicaEntity } from './entities/atencion-clinica.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreateAtencionClinicaDto } from './dto/create-atencion-clinica.dto';
import { UpdateAtencionClinicaDto } from './dto/update-atencion-clinica.dto';

@Injectable()
export class AtencionClinicaService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  author(identity: Identity, organizationId: string) {
    return this.persistence.clinicalAuthor(identity, organizationId);
  }
  createWithHistory(
    identity: Identity,
    organizationId: string,
    dto: CreateAtencionHistoriaDto,
    key: string,
  ) {
    const { motivo_consulta, documento, ...attention } = dto;
    return this.persistence.create(
      identity,
      organizationId,
      AtencionClinicaEntity,
      attention,
      key,
      { motivo_consulta, documento },
    );
  }
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(
      identity,
      organizationId,
      AtencionClinicaEntity,
      { ...query },
    );
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(
      identity,
      organizationId,
      AtencionClinicaEntity,
      id,
    );
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreateAtencionClinicaDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      AtencionClinicaEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdateAtencionClinicaDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      AtencionClinicaEntity,
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
      AtencionClinicaEntity,
      id,
      version,
    );
  }
}
