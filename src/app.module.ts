import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth/auth.controller';
import { JWTStrategy } from './auth/jwt.strategy';
import { RefreshJWTStrategy } from './auth/refreshToken.strategy';
import { FileUploadModule } from './file-upload/file-upload.module';
import { MessagingModule } from './messaging/messaging.module';
import { PrismaModule } from './prisma/prisma.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
    PassportModule,
    FileUploadModule,
    MessagingModule,
    PrismaModule,
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthService, JWTStrategy, RefreshJWTStrategy],
})
export class AppModule {}
