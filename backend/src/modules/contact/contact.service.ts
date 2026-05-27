import { prisma } from '../../config/prisma';
import { HttpError } from '../../shared/errors/httpError';

type ContactMessageBody = {
  name?: unknown;
  email?: unknown;
  topic?: unknown;
  subject?: unknown;
  message?: unknown;
  privacyAccepted?: unknown;
};

function getRequiredString(value: unknown, field: string, maxLength: number) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new HttpError(400, `${field} is required`);
  }

  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new HttpError(400, `${field} is too long`);
  }

  return trimmed;
}

function getEmail(value: unknown) {
  const email = getRequiredString(value, 'email', 160).toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    throw new HttpError(400, 'email must be valid');
  }

  return email;
}

export async function createContactMessage(body: ContactMessageBody) {
  if (body.privacyAccepted !== true) {
    throw new HttpError(400, 'privacyAccepted is required');
  }

  return prisma.contactMessage.create({
    data: {
      name: getRequiredString(body.name, 'name', 120),
      email: getEmail(body.email),
      topic: getRequiredString(body.topic, 'topic', 60),
      subject: getRequiredString(body.subject, 'subject', 160),
      message: getRequiredString(body.message, 'message', 3000),
    },
  });
}
