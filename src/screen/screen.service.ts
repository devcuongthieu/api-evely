import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateScreenDto, UpdateScreenDto } from './dto/screen.dto';

@Injectable()
export class ScreenService {
  constructor(private prismaService: PrismaService) {}

  async create({ cinema_id, column_size, name, row_size }: CreateScreenDto) {
    try {
      const cinema = await this.prismaService.cinema.findUnique({
        where: { id: cinema_id },
      });

      if (!cinema) {
        throw new BadRequestException('Not found');
      }

      const screen = await this.prismaService.screen.create({
        data: {
          cinema_id,
          column_size,
          name,
          row_size,
        },
      });

      return { screen, message: 'Created successfully' };
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      const screens = await this.prismaService.screen.findMany();
      return screens;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const screen = await this.prismaService.screen.findUnique({
        where: {
          id,
        },
      });

      if (!screen) {
        throw new NotFoundException('Not found');
      }

      return screen;
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: number,
    { cinema_id, column_size, name, row_size }: UpdateScreenDto,
  ) {
    try {
      const checkScreen = await this.prismaService.screen.findUnique({
        where: {
          id,
        },
      });

      if (!checkScreen) {
        throw new NotFoundException('Not found');
      }

      const screen = await this.prismaService.screen.update({
        where: {
          id,
        },
        data: {
          cinema_id,
          column_size,
          name,
          row_size,
        },
      });

      return { screen, message: 'Updated successfully' };
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const screen = await this.prismaService.screen.findUnique({
        where: { id },
      });

      if (!screen) {
        throw new NotFoundException('Not found');
      }

      await this.prismaService.screen.delete({
        where: {
          id,
        },
      });

      return {
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw error;
    }
  }
}
