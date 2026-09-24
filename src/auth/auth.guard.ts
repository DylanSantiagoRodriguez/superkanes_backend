import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { TokenService, Identity } from './token.service';

export const Public = () => SetMetadata('publicRoute', true);
export interface AuthenticatedRequest extends Request {
  identity: Identity;
}
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokens: TokenService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (
      this.reflector.getAllAndOverride<boolean>('publicRoute', [
        context.getHandler(),
        context.getClass(),
      ])
    )
      return true;
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    if (
      !authorization ||
      !/^Bearer [^\s]+$/i.test(authorization) ||
      authorization.length > 16384
    )
      throw new UnauthorizedException();
    request.identity = await this.tokens.verify(authorization.slice(7));
    return true;
  }
}
