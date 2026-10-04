import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private async generateTokens(user: { id: string; username: string; role: any }) {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const secret = this.configService.getOrThrow<string>('JWT_SECRET');
    const accessExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN') ?? '15m';
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret,
        expiresIn: accessExpiresIn as any,
      }),
      this.jwtService.signAsync(payload, {
        secret,
        expiresIn: refreshExpiresIn as any,
      }),
    ]);

    // Store hashed refresh token in database
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async login(credentials: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: credentials.username },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const passwordMatches = await bcrypt.compare(
      credentials.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const secret = this.configService.getOrThrow<string>('JWT_SECRET');
      const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive || !user.refreshTokenHash) {
        throw new UnauthorizedException('Access Denied');
      }

      const refreshTokenMatches = await bcrypt.compare(
        refreshToken,
        user.refreshTokenHash,
      );

      if (!refreshTokenMatches) {
        throw new UnauthorizedException('Access Denied');
      }

      const tokens = await this.generateTokens(user);

      return {
        ...tokens,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role,
        },
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
    return { success: true };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
