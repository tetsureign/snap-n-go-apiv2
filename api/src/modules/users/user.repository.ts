import { User } from "@/generated/prisma/client";

import prisma from "$/prisma/client";

type UpsertUserInput = {
  googleId?: string;
  facebookId?: string;
  discordId?: string;
  githubId?: string;
  email: string;
  name: string;
};

async function createOrUpdate(data: UpsertUserInput): Promise<User> {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    return prisma.user.update({
      where: { id: existingUser.id },
      data: {
        ...data,
        deletedAt: null,
      },
    });
  }

  return prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      ...data,
    },
  });
}

async function findById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

async function findByGoogleId(googleId: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { googleId } });
}

async function softDeleteById(id: string): Promise<boolean> {
  const result = await prisma.user.updateMany({
    where: {
      id,
      deletedAt: null,
    },
    data: { deletedAt: new Date() },
  });

  return result.count > 0;
}

const userRepository = {
  createOrUpdate,
  findById,
  findByGoogleId,
  softDeleteById,
};

export default userRepository;
