import { prisma } from '../../config/prisma';
import { HttpError } from '../../shared/errors/httpError';

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      company: true,
    },
  });

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}
