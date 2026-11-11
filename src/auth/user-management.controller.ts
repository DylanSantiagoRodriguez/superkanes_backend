import {
  Body,
  Controller,
  Get,
  Header,
  Headers,
  Param,
  Post,
  Query,
  Req,
  UseFilters,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { AuthenticatedRequest } from './auth.guard';
import { DatabaseErrorFilter } from '../resources/database-error.filter';
import { uuid } from '../resources/resource-validation';
import { UserManagementService } from './user-management.service';
import {
  CreateManagedUserDto,
  LinkOrganizationsDto,
  OrganizationOptionsDto,
  UserSearchDto,
} from './dto/manage-users.dto';

@ApiTags('Administración de usuarios')
@ApiBearerAuth()
@UseFilters(DatabaseErrorFilter)
@Controller('auth/admin')
export class UserManagementController {
  constructor(private readonly service: UserManagementService) {}
  @Get('users')
  @Header('Cache-Control', 'no-store')
  users(@Req() req: AuthenticatedRequest, @Query() query: UserSearchDto) {
    return this.service.users(req.identity, query);
  }
  @Get('organizations')
  @Header('Cache-Control', 'no-store')
  organizations(
    @Req() req: AuthenticatedRequest,
    @Query() query: OrganizationOptionsDto,
  ) {
    return this.service.organizations(req.identity, query);
  }
  @Post('users')
  @Header('Cache-Control', 'no-store')
  @ApiHeader({ name: 'Idempotency-Key', required: true })
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() body: CreateManagedUserDto,
    @Headers('idempotency-key') key: string,
  ) {
    return this.service.save(req.identity, body, uuid(key));
  }
  @Post('users/:id/organizations')
  @Header('Cache-Control', 'no-store')
  @ApiHeader({ name: 'Idempotency-Key', required: true })
  link(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: LinkOrganizationsDto,
    @Headers('idempotency-key') key: string,
  ) {
    return this.service.save(req.identity, body, uuid(key), uuid(id));
  }
}
