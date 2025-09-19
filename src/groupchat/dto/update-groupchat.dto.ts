import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupchatDto } from './create-groupchat.dto';

export class UpdateGroupchatDto extends PartialType(CreateGroupchatDto) {}
