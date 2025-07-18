import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient, Role, User } from 'generated/prisma';
import { ERegisterUser } from 'src/DTO/register.dto';
import { UserModel } from 'src/DTO/user.dto';
import * as bcrypt from 'bcrypt';
import { ELoginUser } from 'src/DTO/login.dto';
import { PrismaService } from '../prisma/prisma.service';

export interface IAuthService {
  register(data: ERegisterUser): Promise<UserModel>;
  login(data: ELoginUser): Promise<{ user: UserModel; token: string; refreshToken: string }>;
  generateAccessAndRefreshTokens(user: { id: string; email: string; role: Role }): Promise<{ accessToken: string; refreshToken: string }>;
}

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(data: ERegisterUser): Promise<UserModel> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) throw new ConflictException(`User with email ${data.email} already exists`);

    data.password = await bcrypt.hash(data.password, 10);

    const newUser = await this.prisma.user.create({ data });
    return new UserModel({
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
    });
  }
  async login(data: ELoginUser): Promise<{ user: UserModel; token: string; refreshToken: string }> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!existingUser) throw new NotFoundException(`User with email ${data.email} does not exist`);
    const isPasswordValid = await bcrypt.compare(data.password, existingUser.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');
    const token = this.jwt.sign({ sub: existingUser.id, email: existingUser.email, role: existingUser.role });
    const refreshToken = this.jwt.sign({ sub: existingUser.id, email: existingUser.email, role: existingUser.role }, { expiresIn: '7d' });
    const user = new UserModel({ id: existingUser.id, email: existingUser.email, username: existingUser.username });
    return { user, token, refreshToken };
  }
  async generateAccessAndRefreshTokens(user: {
    id: string;
    email: string;
    role: Role;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const token = this.jwt.sign({ sub: user.id, email: user.email, role: user.role });
    const refreshToken = this.jwt.sign({ sub: user.id, email: user.email, role: user.role }, { expiresIn: '7d' });

    return { accessToken: token, refreshToken };
  }
}
