import prisma from "prisma/client";
import { softDelete, restore } from "@/utils/softDelete";

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
