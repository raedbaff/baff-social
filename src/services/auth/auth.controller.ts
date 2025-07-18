import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ELoginUser } from 'src/DTO/login.dto';
import { ERegisterUser } from 'src/DTO/register.dto';
import { UserModel } from 'src/DTO/user.dto';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { Role } from 'generated/prisma';
import { RefreshGuard } from './refresh.guard';

export interface IAuthController {
  register(data: ERegisterUser): Promise<UserModel>;
  login(res: Response, data: ELoginUser): Promise<UserModel>;
  refreshToken(req: Request, res: Response): Promise<{ message: string }>;
}

@Controller('auth')
export class AuthController implements IAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() data: ERegisterUser): Promise<UserModel> {
    return await this.authService.register(data);
  }

  @Post('login')
  async login(@Res({ passthrough: true }) res: Response, @Body() data: ELoginUser): Promise<UserModel> {
    const loginData = await this.authService.login(data);
    res
      .cookie('accessToken', loginData.token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
        path: '/',
      })
      .cookie('refreshToken', loginData.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });
    return loginData.user;
  }

  @UseGuards(RefreshGuard)
  @Post('/refresh')
  async refreshToken(@Req()req: Request, @Res({ passthrough: true }) res: Response): Promise<{ message: string }> {
    const user = req.user as { id: string; email: string; role: Role };
    const { accessToken, refreshToken } = await this.authService.generateAccessAndRefreshTokens(user);
    res
      .cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
        path: '/',
      })
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });
    return { message: 'success' };
  }
}
