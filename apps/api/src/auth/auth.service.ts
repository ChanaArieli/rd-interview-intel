import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthResponseDto, UserProfileDto } from '@rd-intel/shared';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  /**
   * Dev-only login: find-or-create a user by email and return a signed JWT.
   * This is the identity transport that later swaps for the real Google OAuth flow.
   */
  async devLogin(email: string, name?: string): Promise<AuthResponseDto> {
    let user = await this.prisma.user.findUnique({ where: { email } });

    // Admin email gets admin privileges
    const isAdminEmail = email === 'admin@rdintel.com';

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name: name ?? null,
          isAdmin: isAdminEmail
          // credits defaults to 1 per domain rules (starter credit)
        }
      });
    } else if (isAdminEmail && !user.isAdmin) {
      // Upgrade existing user to admin if they're the admin email
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { isAdmin: true }
      });
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      isAdmin: user.isAdmin
    });

    return { accessToken, user: this.toProfile(user) };
  }

  private toProfile(user: User): UserProfileDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      roleCategory: user.roleCategory,
      seniority: user.seniority,
      credits: user.credits,
      hasCompletedOnboarding: user.hasCompletedOnboarding,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}
