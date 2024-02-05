import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { EmailSignUpDto } from './dto/email.dto';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendSignUpMail({ name, email, token }: EmailSignUpDto) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Chào mừng bạn đến với Eve-ly !',
      template: './signup.hbs',
      context: {
        name,
        token,
      },
    });
  }
}
