import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Role } from 'generated/prisma';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class RefreshJWTStrategy extends PassportStrategy(Strategy, 'refresh-jwt') {
  constructor(private jwtService: JwtService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => req.cookies.refreshToken]),
      ignoreExpiration: false,
      secretOrKey: process.env.REFRESH_TOKEN_SECRET,
    });
  }
  validate(payload: { sub: number; email: string; role: Role }) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
