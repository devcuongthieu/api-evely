import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSeatDto, UpdateSeatDto } from './dto/seat.dto';

@Injectable()
export class SeatService {
  constructor(private prismaService: PrismaService) {}

  async create({ name, row, column, screen_id, seat_type }: CreateSeatDto) {
    try {
      const screen = await this.prismaService.screen.findUnique({
        where: { id: screen_id },
      });

      if (!screen) {
        throw new BadRequestException('Not found');
      }

      const seat = await this.prismaService.seat.create({
        data: {
          name,
          row,
          column,
          screen_id,
          seat_type,
        },
      });

      return { seat, message: 'Created successfully' };
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      const seats = await this.prismaService.seat.findMany();
      return seats;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const seat = await this.prismaService.seat.findUnique({
        where: { id },
      });

      if (!seat) {
        throw new NotFoundException('Not found');
      }

      return seat;
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: number,
    { name, row, column, screen_id, seat_type }: UpdateSeatDto,
  ) {
    try {
      const checkSeat = await this.prismaService.seat.findUnique({
        where: {
          id,
        },
      });

      if (!checkSeat) {
        throw new NotFoundException('Not found');
      }

      const seat = await this.prismaService.seat.update({
        where: {
          id,
        },
        data: {
          name,
          row,
          column,
          screen_id,
          seat_type,
        },
      });

      return { seat, message: 'Updated successfully' };
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const seat = await this.prismaService.seat.findUnique({
        where: { id },
      });

      if (!seat) {
        throw new NotFoundException('Not found');
      }

      return {
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw error;
    }
  }
}
