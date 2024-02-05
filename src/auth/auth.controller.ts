import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  ResendVerifyAccountDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
  VerifyAccountDto,
} from './dto/auth.dto';
import { AuthGuard } from 'src/guard/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/sign-up')
  async signUp(@Body() data: SignUpDto) {
    return await this.authService.signUp(data);
  }

  @Post('/sign-in')
  async signIn(@Body() data: SignInDto) {
    return await this.authService.signIn(data);
  }

  @Post('/forgot-password')
  async forgotPassword(@Body() data: ForgotPasswordDto) {
    const { email } = data;

    return await this.authService.forgotPassword(email);
  }

  @Post('/reset-password')
  async resetPassword(@Body() data: ResetPasswordDto) {
    const { token, password } = data;

    return await this.authService.resetPassword(token, password);
  }

  @Post('/verify-account')
  async verifyAccount(@Body() data: VerifyAccountDto) {
    const { token } = data;

    return await this.authService.verifyAccount(token);
  }

  @Post('/resent-verify-account')
  async resentVerifyAccount(@Body() data: ResendVerifyAccountDto) {
    const { email } = data;

    return await this.authService.resendVerifyToken(email);
  }

  @Post('/verify-otp')
  async verifyOtp(@Body() data: VerifyAccountDto) {
    const { token } = data;

    return await this.authService.validateResetPasswordOtp(token);
  }

  @Post('/resend-otp')
  async resendOtp(@Body() data: ResendVerifyAccountDto) {
    const { email } = data;

    return await this.authService.resendOtp(email);
  }

  @UseGuards(AuthGuard)
  @Post('/change-password')
  async changePassword(@Body() data: ChangePasswordDto) {
    const { password, new_password, id } = data;

    return await this.authService.changePassword(id, password, new_password);
  }

  // @UseGuards(RefreshTokenGuard)
  // @Post('/refresh-token')
  // async refreshToken(@Request() req) {
  //   console.log(req);
  //   // return this.authService.refreshToken(req.user)
  // }
}
