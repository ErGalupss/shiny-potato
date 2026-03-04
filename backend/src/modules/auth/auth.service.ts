import 'reflect-metadata';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {
    this.logger.log('AuthService initialized');
    if (!this.prisma) {
      this.logger.error('PrismaService is undefined in constructor!');
    } else {
      this.logger.log('PrismaService injected successfully');
    }
  }

  async validateUser(email: string, pass: string): Promise<any> {
    this.logger.log(`Validating user: ${email}`);
    
    if (!this.prisma) {
      this.logger.error('PrismaService is undefined in validateUser!');
      throw new Error('PrismaService is not available');
    }

    if (!this.prisma.user) {
      this.logger.error('PrismaService.user is undefined! Is Prisma Client generated correctly?');
      // Try to log keys of prisma service
      this.logger.error(`PrismaService keys: ${Object.keys(this.prisma)}`);
      throw new Error('PrismaService.user is not available');
    }

    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (user && user.password === pass) { // In real app, use bcrypt
        const { password, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      this.logger.error(`Error in validateUser: ${error.message}`, error.stack);
      throw error;
    }
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
