import { Module } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { MessagingController } from './messaging.controller';
import { PrismaModule } from 'src/services/prisma/prisma.module';
import { FileUploadModule } from 'src/file-upload/file-upload.module';

@Module({
  imports: [PrismaModule, FileUploadModule],
  controllers: [MessagingController],
  providers: [MessagingService],
})
export class MessagingModule {}
