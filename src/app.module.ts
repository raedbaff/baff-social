import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './services/prisma/prisma.service';
import { AuthService } from './services/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './services/auth/auth.controller';
import { JWTStrategy } from './services/auth/jwt.strategy';
import { RefreshJWTStrategy } from './services/auth/refreshToken.strategy';
import { FileUploadModule } from './file-upload/file-upload.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
    PassportModule,
    FileUploadModule,
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, PrismaService, AuthService, JWTStrategy, RefreshJWTStrategy],
})
export class AppModule {}
