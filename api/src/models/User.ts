import prisma from "prisma/client";
import { z } from "zod";

import { restore, softDelete } from "@/libs/softDelete";

export const userSchema = z.object({
  id: z.string(),
  googleId: z.string().nullable(),
  facebookId: z.string().nullable(),
  discordId: z.string().nullable(),
  githubId: z.string().nullable(),
  email: z.string(),
  name: z.string(),
  createdAt: z.string(),
  deletedAt: z.string().nullable(),
});

export type UserDTO = z.infer<typeof userSchema>;

export default class User {
  id!: string;
  googleId?: string | null;
  facebookId?: string | null;
  discordId?: string | null;
  githubId?: string | null;
  email!: string;
  name!: string;
  createdAt?: Date;
  deletedAt?: Date | null;

  constructor(data: {
    id: string;
    googleId?: string | null;
    facebookId?: string | null;
    discordId?: string | null;
    githubId?: string | null;
    email: string;
    name: string;
    createdAt?: Date;
    deletedAt?: Date | null;
  }) {
    Object.assign(this, data);
  }

  toDTO(): UserDTO {
    return {
      id: this.id,
      googleId: this.googleId ?? null,
      facebookId: this.facebookId ?? null,
      discordId: this.discordId ?? null,
      githubId: this.githubId ?? null,
      email: this.email,
      name: this.name,
      createdAt: this.createdAt?.toISOString() ?? "",
      deletedAt: this.deletedAt ? this.deletedAt.toISOString() : null,
    };
  }

  static async createOrUpdate(data: {
    googleId?: string;
    facebookId?: string;
    discordId?: string;
    githubId?: string;
    email: string;
    name: string;
  }): Promise<User> {
    // Find existing user by email first
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      // Update existing user with new provider ID
      const updated = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          ...data,
          deletedAt: null,
        },
      });
      return new User(updated);
    }

    // Create new user
    const created = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        ...data,
      },
    });

    return new User(created);
  }

  static async getById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? new User(user) : null;
  }

  static async getByGoogleId(googleId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { googleId } });
    return user ? new User(user) : null;
  }

  static async getByProviderId(
    provider: string,
    providerId: string
  ): Promise<User | null> {
    const whereClause = { [`${provider}Id`]: providerId } as any;
    const user = await prisma.user.findUnique({ where: whereClause });
    return user ? new User(user) : null;
  }

  async softDelete(id: string) {
    return softDelete(prisma.user, { id });
  }

  async restore(id: string) {
    return restore(prisma.user, { id });
  }
}
