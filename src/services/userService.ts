import User from "@/models/User";

async function getUserById(userId: string) {
  return User.getById(userId);
}

async function getUserByGoogleId(googleId: string) {
  return User.getByGoogleId(googleId);
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
  return User.createOrUpdate({
    googleId,
    facebookId,
    discordId,
    githubId,
    email,
    name,
  });
}

async function softDeleteUser(userId: string) {
  const user = await User.getById(userId);
  if (!user) return false;
  return user.softDelete(userId);
}

const userService = {
  getUserById,
  getUserByGoogleId,
  createOrUpdateUser,
  softDeleteUser,
};

export default userService;
