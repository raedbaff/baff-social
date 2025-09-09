import { Body, Controller, Get, Param, Post, Put, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ELoginUser } from 'src/DTO/user/login.dto';
import { ERegisterUser } from 'src/DTO/user/register.dto';
import { UserModel } from 'src/DTO/user/user.dto';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { Role } from 'generated/prisma';
import { RefreshGuard } from './refresh.guard';
import { EUpdateUser } from 'src/DTO/user/user.update.dto';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { FullUserInfo } from 'src/DTO/user/fullUser.dto';

export interface IAuthController {
  register(data: ERegisterUser): Promise<UserModel>;
  login(res: Response, data: ELoginUser): Promise<UserModel>;
  updateUserInfo(file: Express.Multer.File, req: Request, userId: number, UserInfo: EUpdateUser): Promise<UserModel>;
  refreshToken(req: Request, res: Response): Promise<{ message: string }>;
  getUser(userId: number): Promise<FullUserInfo>;
}

@Controller('auth')
export class AuthController implements IAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly fileUploadService: FileUploadService,
  ) {}
  @UseGuards(AuthGuard('jwt'))
  @Get(':userId')
  async getUser(@Param('userId') userId: number): Promise<FullUserInfo> {
    return await this.authService.getUser(userId);
  }

  @Put(':userId')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  async updateUserInfo(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
    @Param('userId') userId: number,
    @Body() UserInfo: EUpdateUser,
  ): Promise<UserModel> {
    console.log(file);
    if (file) {
      const filePath = this.fileUploadService.handleFileUpload(file);
      console.log(filePath);
      UserInfo.photo = filePath;
    }
    return await this.authService.updateUserInfo(req.user as { id: number; email: string; role: Role }, userId, UserInfo);
  }

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
  async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<{ message: string }> {
    const user = req.user as { id: number; email: string; role: Role };
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
