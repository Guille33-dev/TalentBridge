import { ApplicationStatus, JobStatus, Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { HttpError } from '../../shared/errors/httpError';

type CreateApplicationBody = {
  jobId?: unknown;
  coverLetter?: unknown;
};

const applicationInclude = {
  job: {
    include: {
      company: {
        select: {
          id: true,
          slug: true,
          name: true,
          logo: true,
          industry: true,
        },
      },
    },
  },
} satisfies Prisma.ApplicationInclude;

function getRequiredString(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new HttpError(400, `${field} is required`);
  }

  return value.trim();
}

function getOptionalString(value: unknown) {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') {
    throw new HttpError(400, 'coverLetter must be a string');
  }

  const trimmed = value.trim();
  return trimmed || undefined;
}

function serializeApplication(application: Prisma.ApplicationGetPayload<{ include: typeof applicationInclude }>) {
  return {
    id: application.id,
    status: application.status,
    coverLetter: application.coverLetter,
    nextStep: application.nextStep,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
    job: application.job,
  };
}

export async function listMyApplications(userId: string) {
  const applications = await prisma.application.findMany({
    where: { userId },
    include: applicationInclude,
    orderBy: { createdAt: 'desc' },
  });

  return applications.map(serializeApplication);
}

export async function createApplication(userId: string, body: CreateApplicationBody) {
  const jobId = getRequiredString(body.jobId, 'jobId');
  const coverLetter = getOptionalString(body.coverLetter);

  const job = await prisma.job.findFirst({
    where: {
      OR: [{ id: jobId }, { slug: jobId }],
      status: JobStatus.OPEN,
    },
    select: { id: true },
  });

  if (!job) {
    throw new HttpError(404, 'Job not found');
  }

  try {
    const application = await prisma.$transaction(async (transaction) => {
      const created = await transaction.application.create({
        data: {
          userId,
          jobId: job.id,
      coverLetter,
      nextStep: 'Postulacion enviada. La empresa revisara tu perfil.',
        },
        include: applicationInclude,
      });

      await transaction.job.update({
        where: { id: job.id },
        data: {
          applicantsCount: {
            increment: 1,
          },
        },
      });

      return created;
    });

    return serializeApplication(application);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new HttpError(409, 'Ya te has postulado a esta practica');
    }

    throw error;
  }
}

export async function withdrawApplication(userId: string, applicationId: string) {
  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      userId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!application) {
    throw new HttpError(404, 'Application not found');
  }

  if (application.status === ApplicationStatus.WITHDRAWN) {
    throw new HttpError(409, 'Application already withdrawn');
  }

  const updated = await prisma.application.update({
    where: { id: application.id },
    data: {
      status: ApplicationStatus.WITHDRAWN,
      nextStep: null,
    },
    include: applicationInclude,
  });

  return serializeApplication(updated);
}
