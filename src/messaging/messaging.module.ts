import { Module } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { MessagingController } from './messaging.controller';
import { PrismaModule } from 'src/services/prisma/prisma.module';
import { FileUploadModule } from 'src/file-upload/file-upload.module';
import { MessagingGateway } from './messaging.gateway';

@Module({
  imports: [PrismaModule, FileUploadModule],
  controllers: [MessagingController],
  providers: [MessagingService, MessagingGateway],
})
export class MessagingModule {}
