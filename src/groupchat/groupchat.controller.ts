import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { GroupchatService } from './groupchat.service';
import { CreateGroupchatDto } from './dto/create-groupchat.dto';
import { UpdateGroupchatDto } from './dto/update-groupchat.dto';
import { JWTAuthGuard } from 'src/auth/auth.guard';
import { PaginationDTO } from './dto/pagination.dto';

@Controller('groupchat')
export class GroupchatController {
  constructor(private readonly groupchatService: GroupchatService) {}

  @Post()
  create(@Body() createGroupchatDto: CreateGroupchatDto) {
    return this.groupchatService.create(createGroupchatDto);
  }

  @Get()
  @UseGuards(JWTAuthGuard)
  async findAll(@Query() pagination: PaginationDTO) {
    return await this.groupchatService.findAll(pagination.page, pagination.take);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupchatService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGroupchatDto: UpdateGroupchatDto) {
    return this.groupchatService.update(+id, updateGroupchatDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupchatService.remove(+id);
  }
}
