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
  async create(@UploadedFiles() files: Express.Multer.File[], @Req() req: Request, @Body() createMessagingDto: CreateMessagingDto) {
    if (files && files.length > 0) {
      createMessagingDto.files = files.map((file) => this.fileUploadService.handleFileUpload(file));
    }
    return this.messagingService.create(req.user as { id: number; email: string; role: Role }, createMessagingDto);
  }

  @Get()
  findAll() {
    return this.messagingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messagingService.findOne(+id);
  }
  @Get(':id_1/:id_2')
  @UseGuards(AuthGuard('jwt'))
  findMessageBetweenUsers(@Param('id_1') id_1: number, @Param('id_2') id_2: number) {
    return this.messagingService.findMessageBetweenUsers(id_1, id_2);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMessagingDto: UpdateMessagingDto) {
    return this.messagingService.update(+id, updateMessagingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messagingService.remove(+id);
  }
}
