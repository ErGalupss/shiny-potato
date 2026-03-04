import 'reflect-metadata';
import { Controller, Post, Body, UnauthorizedException, Inject, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    @Inject(AuthService) private readonly authService: AuthService
  ) {
    this.logger.log('AuthController initialized');
    if (!this.authService) {
      this.logger.error('AuthService is NOT injected!');
    }
  }

  @Post('login')
  async login(@Body() body: any) {
    this.logger.log(`Login attempt for: ${body.email}`);
    if (!this.authService) {
      throw new Error('AuthService is not available');
    }
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }
}
