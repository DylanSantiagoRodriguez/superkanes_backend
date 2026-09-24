import { EventoSalidaEntity } from './entities/evento-salida.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreateEventoSalidaDto } from './dto/create-evento-salida.dto';
import { UpdateEventoSalidaDto } from './dto/update-evento-salida.dto';

@Injectable()
export class EventoSalidaService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(identity, organizationId, EventoSalidaEntity, {
      ...query,
    });
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(
      identity,
      organizationId,
      EventoSalidaEntity,
      id,
    );
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreateEventoSalidaDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      EventoSalidaEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdateEventoSalidaDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      EventoSalidaEntity,
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
      EventoSalidaEntity,
      id,
      version,
    );
  }
}
