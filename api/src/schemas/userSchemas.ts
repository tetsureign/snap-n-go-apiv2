import { User } from "@/generated/prisma/client";
import { z } from "zod";

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

export function toUserDTO(user: User): UserDTO {
  return {
    id: user.id,
    googleId: user.googleId ?? null,
    facebookId: user.facebookId ?? null,
    discordId: user.discordId ?? null,
    githubId: user.githubId ?? null,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
    deletedAt: user.deletedAt ? user.deletedAt.toISOString() : null,
  };
}
