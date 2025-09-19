import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {  Role } from 'generated/prisma';
import { ERegisterUser } from 'src/DTO/user/register.dto';
import { UserModel } from 'src/DTO/user/user.dto';
import * as bcrypt from 'bcrypt';
import { ELoginUser } from 'src/DTO/user/login.dto';
import { PrismaService } from '../prisma/prisma.service';
import { EUpdateUser } from 'src/DTO/user/user.update.dto';
import { FullUserInfo } from 'src/DTO/user/fullUser.dto';

export interface IAuthService {
  register(data: ERegisterUser): Promise<UserModel>;
  login(data: ELoginUser): Promise<{ user: UserModel; token: string; refreshToken: string }>;
  updateUserInfo(User: { id: number; email: string; role: Role }, userId: number, UserInfo: EUpdateUser): Promise<UserModel>;
  generateAccessAndRefreshTokens(user: { id: number; email: string; role: Role }): Promise<{ accessToken: string; refreshToken: string }>;
  getUser(id: number): Promise<FullUserInfo>;
}

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwt: JwtService,
  ) {}
  async getUser(id: number): Promise<FullUserInfo> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        links: true,
      },
    });
    if (!user) throw new NotFoundException(`user with id ${id} not found`);
    return new FullUserInfo({
      id: user.id,
      email: user.email,
      username: user.username,
      bio: user.bio,
      photo: user.photo,
      links: user.links.map((link) => link.url),
    });
  }
  async updateUserInfo(User: { id: number; email: string; role: Role }, userId: number, UserInfo: EUpdateUser): Promise<UserModel> {
    const id = Number(userId);
    if (!id) throw new BadRequestException('Invalid user id');
    if (User.id !== id) throw new UnauthorizedException('You are not authorized to update this user');

    const { links, ...rest } = UserInfo;
    const updatedUser = await this.prisma.user.update({ where: { id }, data: rest });
    if (Array.isArray(links) && links.length > 0) {
      await this.prisma.link.deleteMany({ where: { userId: id } });
      await this.prisma.link.createMany({
        data: links.map((link) => ({ url: link, userId })),
      });
    }

    return new UserModel({ id: updatedUser.id, email: updatedUser.email, username: updatedUser.username });
  }

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
    id: number;
    email: string;
    role: Role;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const token = this.jwt.sign({ sub: user.id, email: user.email, role: user.role });
    const refreshToken = this.jwt.sign({ sub: user.id, email: user.email, role: user.role }, { expiresIn: '7d' });

    return { accessToken: token, refreshToken };
  }
}
