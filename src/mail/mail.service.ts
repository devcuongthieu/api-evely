import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { EmailForgotPasswordDto, EmailSignUpDto } from './dto/email.dto';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendSignUpMail({ name, email, token }: EmailSignUpDto) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Chào mừng bạn đã đến với Eve-ly!',
      template: 'confirm-signup.hbs',
      context: {
        name,
        token,
      },
    });
  }

  async sendForgotPasswordMail({ name, email, token }: EmailForgotPasswordDto) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Đặt lại mật khẩu của bạn',
      template: 'forgot-password.hbs',
      context: {
        name,
        token,
      },
    });
  }
}
