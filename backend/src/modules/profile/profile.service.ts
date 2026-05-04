import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { HttpError } from '../../shared/errors/httpError';

type UpdateProfileBody = {
  firstName?: unknown;
  lastName?: unknown;
  university?: unknown;
  major?: unknown;
  semester?: unknown;
  phone?: unknown;
  location?: unknown;
  availability?: unknown;
  bio?: unknown;
  skills?: unknown;
};

function getOptionalString(value: unknown) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== 'string') {
    throw new HttpError(400, 'Invalid string value');
  }

  const trimmed = value.trim();
  return trimmed || null;
}

function getOptionalStringArray(value: unknown) {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new HttpError(400, 'skills must be an array of strings');
  }

  return value.map((item) => item.trim()).filter(Boolean);
}

function buildProfileCompletion(profile: {
  university?: string | null;
  major?: string | null;
  semester?: string | null;
  phone?: string | null;
  location?: string | null;
  availability?: string | null;
  bio?: string | null;
  skills?: string[];
}) {
  const checks = [
    profile.university,
    profile.major,
    profile.semester,
    profile.phone,
    profile.location,
    profile.availability,
    profile.bio,
    profile.skills?.length ? 'skills' : null,
  ];

  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function serializeProfile(user: Prisma.UserGetPayload<{ include: { profile: true } }>) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    profile: user.profile,
  };
}

export async function getMyProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  return serializeProfile(user);
}

export async function updateMyProfile(userId: string, body: UpdateProfileBody) {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!existingUser) {
    throw new HttpError(404, 'User not found');
  }

  const firstName = getOptionalString(body.firstName);
  const lastName = getOptionalString(body.lastName);
  const university = getOptionalString(body.university);
  const major = getOptionalString(body.major);
  const semester = getOptionalString(body.semester);
  const phone = getOptionalString(body.phone);
  const location = getOptionalString(body.location);
  const availability = getOptionalString(body.availability);
  const bio = getOptionalString(body.bio);
  const skills = getOptionalStringArray(body.skills);

  const profileData = {
    university: university === undefined ? existingUser.profile?.university : university,
    major: major === undefined ? existingUser.profile?.major : major,
    semester: semester === undefined ? existingUser.profile?.semester : semester,
    phone: phone === undefined ? existingUser.profile?.phone : phone,
    location: location === undefined ? existingUser.profile?.location : location,
    availability: availability === undefined ? existingUser.profile?.availability : availability,
    bio: bio === undefined ? existingUser.profile?.bio : bio,
    skills: skills === undefined ? existingUser.profile?.skills || [] : skills,
  };

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(firstName !== undefined ? { firstName: firstName || existingUser.firstName } : {}),
      ...(lastName !== undefined ? { lastName: lastName || existingUser.lastName } : {}),
      profile: {
        upsert: {
          create: {
            ...profileData,
            avatarInitials: `${(firstName || existingUser.firstName).charAt(0)}${(lastName || existingUser.lastName).charAt(0)}`.toUpperCase(),
            profileCompletion: buildProfileCompletion(profileData),
          },
          update: {
            ...(university !== undefined ? { university } : {}),
            ...(major !== undefined ? { major } : {}),
            ...(semester !== undefined ? { semester } : {}),
            ...(phone !== undefined ? { phone } : {}),
            ...(location !== undefined ? { location } : {}),
            ...(availability !== undefined ? { availability } : {}),
            ...(bio !== undefined ? { bio } : {}),
            ...(skills !== undefined ? { skills } : {}),
            profileCompletion: buildProfileCompletion(profileData),
            avatarInitials: `${(firstName || existingUser.firstName).charAt(0)}${(lastName || existingUser.lastName).charAt(0)}`.toUpperCase(),
          },
        },
      },
    },
    include: { profile: true },
  });

  return serializeProfile(updatedUser);
}
