import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CinemaService } from './cinema.service';
import { CreateCinemaDto, UpdateCinemaDto } from './dto/cinema.dto';

@Controller('cinema')
export class CinemaController {
  constructor(private readonly cinemaService: CinemaService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createCinemaDto: CreateCinemaDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.cinemaService.create(createCinemaDto, file);
  }

  @Get()
  findAll() {
    return this.cinemaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cinemaService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateCinemaDto: UpdateCinemaDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.cinemaService.update(+id, updateCinemaDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.cinemaService.remove(+id);
  }
}
