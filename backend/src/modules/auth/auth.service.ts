import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CompanyStatus, Prisma, UserRole } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { HttpError } from '../../shared/errors/httpError';

type RegisterBody = {
  email?: unknown;
  password?: unknown;
  firstName?: unknown;
  lastName?: unknown;
};

type RegisterCompanyBody = {
  email?: unknown;
  password?: unknown;
  contactName?: unknown;
  companyName?: unknown;
  companyLocation?: unknown;
  companyIndustry?: unknown;
  companyTaxId?: unknown;
  acceptTerms?: unknown;
};

type LoginBody = {
  email?: unknown;
  password?: unknown;
};

const PASSWORD_MIN_LENGTH = 8;
const TOKEN_EXPIRES_IN = '7d';
const NEW_COMPANY_DESCRIPTION = 'Perfil pendiente de completar por la empresa.';

const userInclude = {
  profile: true,
  company: true,
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

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function getContactNames(contactName: string) {
  const [firstName, ...remainingNames] = contactName.split(/\s+/);

  return {
    firstName,
    lastName: remainingNames.join(' '),
  };
}

function serializeUser(user: Prisma.UserGetPayload<{ include: typeof userInclude }>) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    profile: user.profile,
    company: user.company,
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

export async function registerCompany(body: RegisterCompanyBody) {
  const email = normalizeEmail(body.email);
  const password = validatePassword(body.password);
  const contactName = getRequiredString(body.contactName, 'contactName');
  const { firstName, lastName } = getContactNames(contactName);
  const companyName = getRequiredString(body.companyName, 'companyName');
  const companyLocation = getRequiredString(body.companyLocation, 'companyLocation');
  const companyIndustry = getRequiredString(body.companyIndustry, 'companyIndustry');
  const companyTaxId = getRequiredString(body.companyTaxId, 'companyTaxId').toUpperCase();

  if (body.acceptTerms !== true) {
    throw new HttpError(400, 'Terms and privacy must be accepted');
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw new HttpError(409, 'Email already registered');
  }

  const baseSlug = slugify(companyName);
  const existingCompany = await prisma.company.findFirst({
    where: {
      OR: [{ slug: baseSlug }, { taxId: companyTaxId }],
    },
    select: { slug: true, taxId: true },
  });

  if (existingCompany) {
    throw new HttpError(409, existingCompany.taxId === companyTaxId ? 'Company tax ID already registered' : 'Company slug already exists');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      role: UserRole.COMPANY,
      company: {
        create: {
          name: companyName,
          slug: baseSlug,
          description: NEW_COMPANY_DESCRIPTION,
          location: companyLocation,
          industry: companyIndustry,
          taxId: companyTaxId,
          status: CompanyStatus.PENDING,
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
