import { UserManagementController } from './user-management.controller';
import { UserManagementService } from './user-management.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CredentialEntity } from './entities/credential.entity';
import { SessionEntity } from './entities/session.entity';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { PasswordResetEntity } from './entities/password-reset.entity';
import { LoginBucketEntity } from './entities/login-bucket.entity';
import { SecurityEventEntity } from './entities/security-event.entity';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { TokenService } from './token.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CredentialEntity,
      SessionEntity,
      RefreshTokenEntity,
      PasswordResetEntity,
      LoginBucketEntity,
      SecurityEventEntity,
    ]),
  ],
  controllers: [AuthController, UserManagementController],
  providers: [
    TokenService,
    AuthService,
    UserManagementService,
    PasswordService,
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
  exports: [TokenService],
})
export class AuthModule {}
