import { Module } from '@nestjs/common';
import { GroupchatService } from './groupchat.service';
import { GroupchatController } from './groupchat.controller';

@Module({
  controllers: [GroupchatController],
  providers: [GroupchatService],
})
export class GroupchatModule {}
