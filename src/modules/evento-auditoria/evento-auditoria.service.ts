import { EventoAuditoriaEntity } from './entities/evento-auditoria.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreateEventoAuditoriaDto } from './dto/create-evento-auditoria.dto';
import { UpdateEventoAuditoriaDto } from './dto/update-evento-auditoria.dto';

@Injectable()
export class EventoAuditoriaService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(
      identity,
      organizationId,
      EventoAuditoriaEntity,
      { ...query },
    );
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(
      identity,
      organizationId,
      EventoAuditoriaEntity,
      id,
    );
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreateEventoAuditoriaDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      EventoAuditoriaEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdateEventoAuditoriaDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      EventoAuditoriaEntity,
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
      EventoAuditoriaEntity,
      id,
      version,
    );
  }
}
