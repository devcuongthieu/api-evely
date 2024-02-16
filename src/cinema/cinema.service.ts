import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCinemaDto, UpdateCinemaDto } from './dto/cinema.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class CinemaService {
  constructor(
    private prismaService: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(
    { address, name, phone_number }: CreateCinemaDto,
    file: Express.Multer.File,
  ) {
    try {
      const { url } = await this.cloudinaryService.uploadFile(
        file,
        'evely/cinema',
      );

      const cinema = await this.prismaService.cinema.create({
        data: {
          address,
          image: url,
          name,
          phone_number,
        },
      });

      return { cinema, message: 'Created successfully' };
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      const cinemas = await this.prismaService.cinema.findMany();

      return cinemas;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const cinema = await this.prismaService.cinema.findUnique({
        where: {
          id,
        },
      });

      if (!cinema) {
        throw new NotFoundException('Not found');
      }

      return cinema;
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: number,
    { address, name, phone_number }: UpdateCinemaDto,
    file: Express.Multer.File,
  ) {
    try {
      const checkCinema = await this.prismaService.cinema.findUnique({
        where: {
          id,
        },
      });

      if (!checkCinema) {
        throw new NotFoundException('Not found');
      }

      if (file) await this.deleteImageCloudinary(checkCinema.image);

      const image = file
        ? (await this.cloudinaryService.uploadFile(file, 'evely/cinema')).url
        : checkCinema.image;

      const cinema = await this.prismaService.cinema.update({
        where: {
          id,
        },
        data: {
          address,
          image,
          name,
          phone_number,
        },
      });

      return { cinema, message: 'Updated successfully' };
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const cinema = await this.prismaService.cinema.findUnique({
        where: {
          id,
        },
      });

      if (!cinema) {
        throw new NotFoundException('Not found');
      }

      await this.deleteImageCloudinary(cinema.image);

      await this.prismaService.cinema.delete({
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

  private deleteImageCloudinary = async (url: string) => {
    const public_id = `evely/cinema/${url.split('/').pop().split('.')[0]}`;

    await this.cloudinaryService.bulkDelete([public_id]);
  };
}
