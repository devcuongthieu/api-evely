import { Module } from '@nestjs/common';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CinemaController } from './cinema.controller';
import { CinemaService } from './cinema.service';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [CinemaController],
  providers: [CinemaService],
})
export class CinemaModule {}
