import { NotFoundError } from "@/shared/errors/appError";
import userRepository from "@/modules/users/user.repository";

async function getUserById(userId: string) {
  return userRepository.findById(userId);
}

async function getUserByGoogleId(googleId: string) {
  return userRepository.findByGoogleId(googleId);
}

async function createOrUpdateUser({
  googleId,
  facebookId,
  discordId,
  githubId,
  email,
  name,
}: {
  googleId?: string;
  facebookId?: string;
  discordId?: string;
  githubId?: string;
  email: string;
  name: string;
}) {
  return userRepository.createOrUpdate({
    googleId,
    facebookId,
    discordId,
    githubId,
    email,
    name,
  });
}

async function softDeleteUser(userId: string) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found or already deleted");
  }

  return userRepository.softDeleteById(userId);
}

const userService = {
  getUserById,
  getUserByGoogleId,
  createOrUpdateUser,
  softDeleteUser,
};

export default userService;
