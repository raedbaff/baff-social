import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFiles, Req } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { CreateMessagingDto } from './dto/create-messaging.dto';
import { UpdateMessagingDto } from './dto/update-messaging.dto';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { Role } from 'generated/prisma';
import { Request } from 'express';

@Controller('messaging')
export class MessagingController {
  constructor(
    private readonly messagingService: MessagingService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('files'))
  async create(@UploadedFiles() files: Express.Multer.File[], @Body() createMessagingDto: CreateMessagingDto) {
    if (files && files.length > 0) {
      createMessagingDto.files = files.map((file) => this.fileUploadService.handleFileUpload(file));
    }
    return await this.messagingService.create(createMessagingDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id') id: string) {
    return await this.messagingService.findOne(+id);
  }
  @Get(':id_1/:id_2')
  @UseGuards(AuthGuard('jwt'))
  async findMessageBetweenUsers(@Param('id_1') id_1: number, @Param('id_2') id_2: number) {
    return await this.messagingService.findMessageBetweenUsers(id_1, id_2);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(@Req() req: Request, @Param('id') id: string, @Body() updateMessagingDto: UpdateMessagingDto) {
    return await this.messagingService.update(req.user.id, +id, updateMessagingDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Req() req: Request, @Param('id') id: string) {
    return await this.messagingService.remove(req.user.id, +id);
  }
}
