import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { APP_PIPE } from '@nestjs/core';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { CinemaModule } from './cinema/cinema.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ScreenModule } from './screen/screen.module';
import { SeatModule } from './seat/seat.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    MailModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CinemaModule,
    CloudinaryModule,
    ScreenModule,
    SeatModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    { provide: APP_PIPE, useClass: ValidationPipe },
  ],
})
export class AppModule {}
