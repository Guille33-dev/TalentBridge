import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Prisma, UserRole } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { HttpError } from '../../shared/errors/httpError';

type RegisterBody = {
  email?: unknown;
  password?: unknown;
  firstName?: unknown;
  lastName?: unknown;
};

type LoginBody = {
  email?: unknown;
  password?: unknown;
};

const PASSWORD_MIN_LENGTH = 8;
const TOKEN_EXPIRES_IN = '7d';

const userInclude = {
  profile: true,
} satisfies Prisma.UserInclude;

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return secret;
}

function getRequiredString(value: unknown, field: string) {
  if (typeof value !== 'string') {
    throw new HttpError(400, `${field} is required`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new HttpError(400, `${field} is required`);
  }

  return trimmed;
}

function normalizeEmail(value: unknown) {
  const email = getRequiredString(value, 'email').toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, 'Invalid email');
  }

  return email;
}

function validatePassword(value: unknown) {
  const password = getRequiredString(value, 'password');

  if (password.length < PASSWORD_MIN_LENGTH) {
    throw new HttpError(400, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
  }

  return password;
}

function buildInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function serializeUser(user: Prisma.UserGetPayload<{ include: typeof userInclude }>) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    profile: user.profile,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function createToken(user: { id: string; role: UserRole }) {
  return jwt.sign({ role: user.role }, getJwtSecret(), {
    subject: user.id,
    expiresIn: TOKEN_EXPIRES_IN,
  });
}

export async function registerStudent(body: RegisterBody) {
  const email = normalizeEmail(body.email);
  const password = validatePassword(body.password);
  const firstName = getRequiredString(body.firstName, 'firstName');
  const lastName = getRequiredString(body.lastName, 'lastName');

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw new HttpError(409, 'Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      role: UserRole.STUDENT,
      profile: {
        create: {
          avatarInitials: buildInitials(firstName, lastName),
          profileCompletion: 0,
        },
      },
    },
    include: userInclude,
  });

  return {
    data: {
      token: createToken(user),
      user: serializeUser(user),
    },
  };
}

export async function login(body: LoginBody) {
  const email = normalizeEmail(body.email);
  const password = getRequiredString(body.password, 'password');

  const user = await prisma.user.findUnique({
    where: { email },
    include: userInclude,
  });

  if (!user) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    throw new HttpError(401, 'Invalid email or password');
  }

  return {
    data: {
      token: createToken(user),
      user: serializeUser(user),
    },
  };
}
