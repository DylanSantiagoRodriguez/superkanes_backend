import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Header,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseFilters,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { TokenResponseDto } from './dto/token-response.dto';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { Public } from './auth.guard';
import type { AuthenticatedRequest } from './auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { CreateAccountDto } from './dto/create-account.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { IssueResetDto, ResetPasswordDto } from './dto/reset-password.dto';
import { DatabaseErrorFilter } from '../resources/database-error.filter';

@ApiTags('Autenticacion')
@UseFilters(DatabaseErrorFilter)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}
  private webRequest(req: Request) {
    if (
      !req.headers.origin ||
      !this.config
        .getOrThrow<string[]>('CORS_ORIGINS')
        .includes(req.headers.origin) ||
      req.headers['x-csrf-protection'] !== '1'
    )
      throw new ForbiddenException('Origen o proteccion CSRF invalida');
  }
  private cookieOptions() {
    return {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'strict' as const,
      path: '/api/v1/auth',
    };
  }
  private deliver(
    result: Awaited<ReturnType<AuthService['login']>>,
    res: Response,
    native: boolean,
  ) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    if (native) return result;
    res.cookie('superkanes_refresh', result.refreshToken, {
      ...this.cookieOptions(),
      expires: new Date(result.refreshExpiresAt),
    });
    const { refreshToken: _secret, ...body } = result;
    void _secret;
    return body;
  }
  @Public()
  @Post('login')
  @ApiOkResponse({ type: TokenResponseDto })
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (dto.client !== 'native') this.webRequest(req);
    return this.deliver(
      await this.auth.login(dto.email, dto.password, req.ip ?? 'unknown'),
      res,
      dto.client === 'native',
    );
  }
  @Public()
  @Post('refresh')
  @ApiOkResponse({ type: TokenResponseDto })
  @HttpCode(200)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async refresh(
    @Body() dto: RefreshDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    let token = dto.refreshToken;
    if (dto.client === 'native') {
      if (!token) throw new UnauthorizedException('Refresh token requerido');
    } else {
      this.webRequest(req);
      if (token)
        throw new ForbiddenException('El cliente web debe usar la cookie');
      token = req.headers.cookie
        ?.split(';')
        .map((v) => v.trim())
        .find((v) => v.startsWith('superkanes_refresh='))
        ?.slice('superkanes_refresh='.length);
    }
    if (!token) throw new UnauthorizedException('Renovacion no disponible');
    return this.deliver(
      await this.auth.refresh(token, req.ip ?? 'unknown'),
      res,
      dto.client === 'native',
    );
  }
  @ApiBearerAuth()
  @Get('me')
  @Header('Cache-Control', 'no-store')
  me(@Req() req: AuthenticatedRequest) {
    return this.auth.me(req.identity);
  }

  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(204)
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.auth.logout(req.identity);
    res.clearCookie('superkanes_refresh', this.cookieOptions());
  }
  @ApiBearerAuth()
  @Post('logout-all')
  @HttpCode(204)
  async logoutAll(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.auth.logout(req.identity, true);
    res.clearCookie('superkanes_refresh', this.cookieOptions());
  }
  @ApiBearerAuth()
  @Post('password/change')
  @HttpCode(204)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async changePassword(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.auth.changePassword(
      req.identity,
      dto.currentPassword,
      dto.newPassword,
    );
    res.clearCookie('superkanes_refresh', this.cookieOptions());
  }
  @ApiBearerAuth()
  @Post('users')
  @Header('Cache-Control', 'no-store')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  createAccount(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateAccountDto,
  ) {
    return this.auth.createAccount(req.identity, dto);
  }

  @ApiBearerAuth()
  @Post('users/:id/reset-token')
  @Header('Cache-Control', 'no-store')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  issueReset(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: IssueResetDto,
  ) {
    return this.auth.issueReset(req.identity, id, dto.currentPassword);
  }

  @Public()
  @Post('password/reset')
  @HttpCode(204)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async resetPassword(@Req() req: Request, @Body() dto: ResetPasswordDto) {
    await this.auth.resetPassword(
      dto.token,
      dto.newPassword,
      req.ip ?? 'unknown',
    );
  }
}
