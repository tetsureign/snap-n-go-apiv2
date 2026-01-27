import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '../generated/client/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createOrUpdate(data: {
    googleId?: string;
    facebookId?: string;
    discordId?: string;
    githubId?: string;
    email: string;
    name: string;
  }): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          ...data,
          deletedAt: null,
        },
      });
    }

    return this.prisma.user.create({
      data: {
        ...data,
      },
    });
  }

  async findOne(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { googleId } });
  }

  async softDelete(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: null },
    });
  }
}
