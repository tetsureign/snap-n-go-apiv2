import prisma from "prisma/client";
import { z } from "zod/v4";

import { restore, softDelete } from "@/utils/softDelete";

export const userSchema = z.object({
  id: z.string(),
  googleId: z.string(),
  email: z.string(),
  name: z.string(),
  createdAt: z.string(),
  deletedAt: z.string().nullable(),
});

export type UserDTO = z.infer<typeof userSchema>;

export class User {
  id!: string;
  googleId!: string;
  email!: string;
  name!: string;
  createdAt?: Date;
  deletedAt?: Date | null;

  constructor(data: {
    id: string;
    googleId: string;
    email: string;
    name: string;
    createdAt?: Date;
    deletedAt?: Date | null;
  }) {
    Object.assign(this, data);
  }

  static async createOrUpdate(data: {
    googleId: string;
    email: string;
    name: string;
  }): Promise<User> {
    const upserted = await prisma.user.upsert({
      where: { googleId: data.googleId },
      update: {
        email: data.email,
        name: data.name,
        deletedAt: null,
      },
      create: {
        id: crypto.randomUUID(),
        googleId: data.googleId,
        email: data.email,
        name: data.name,
      },
    });

    return new User(upserted);
  }

  static async getById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? new User(user) : null;
  }

  static async getByGoogleId(googleId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { googleId } });
    return user ? new User(user) : null;
  }

  async softDelete(id: string) {
    return softDelete(prisma.user, { id });
  }

  async restore(id: string) {
    return restore(prisma.user, { id });
  }
}
