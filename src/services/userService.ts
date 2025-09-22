import { User } from "@/models/User";

export async function getUserById(userId: string) {
  return User.getById(userId);
}

export async function getUserByGoogleId(googleId: string) {
  return User.getByGoogleId(googleId);
}

export async function createOrUpdateUser({
  googleId,
  facebookId,
  appleId,
  githubId,
  email,
  name,
}: {
  googleId?: string;
  facebookId?: string;
  appleId?: string;
  githubId?: string;
  email: string;
  name: string;
}) {
  return User.createOrUpdate({
    googleId,
    facebookId,
    appleId,
    githubId,
    email,
    name,
  });
}

export async function softDeleteUser(userId: string) {
  const user = await User.getById(userId);
  if (!user) return false;
  return user.softDelete(userId);
}
