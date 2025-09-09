import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Role } from 'generated/prisma';
import { ExtractJwt, Strategy } from 'passport-jwt';
export type JWTUser = {
  id: number;
  email: string;
  role: string;
};

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
  constructor(private jwtService: JwtService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => req.cookies.accessToken]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }
  validate(payload: { sub: number; email: string; role: Role }): JWTUser {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
