import { JobStatus, Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { HttpError } from '../../shared/errors/httpError';

type SaveJobBody = {
  jobId?: unknown;
};

const savedJobInclude = {
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
} satisfies Prisma.SavedJobInclude;

function getRequiredString(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new HttpError(400, `${field} is required`);
  }

  return value.trim();
}

function serializeSavedJob(savedJob: Prisma.SavedJobGetPayload<{ include: typeof savedJobInclude }>) {
  return {
    id: savedJob.id,
    createdAt: savedJob.createdAt,
    job: savedJob.job,
  };
}

async function findOpenJob(idOrSlug: string) {
  const job = await prisma.job.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      status: JobStatus.OPEN,
    },
    select: { id: true },
  });

  if (!job) {
    throw new HttpError(404, 'Job not found');
  }

  return job;
}

export async function listMySavedJobs(userId: string) {
  const savedJobs = await prisma.savedJob.findMany({
    where: { userId },
    include: savedJobInclude,
    orderBy: { createdAt: 'desc' },
  });

  return savedJobs.map(serializeSavedJob);
}

export async function saveJob(userId: string, body: SaveJobBody) {
  const jobId = getRequiredString(body.jobId, 'jobId');
  const job = await findOpenJob(jobId);

  try {
    const savedJob = await prisma.savedJob.create({
      data: {
        userId,
        jobId: job.id,
      },
      include: savedJobInclude,
    });

    return serializeSavedJob(savedJob);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new HttpError(409, 'Esta practica ya esta guardada');
    }

    throw error;
  }
}

export async function unsaveJob(userId: string, jobId: string) {
  const job = await findOpenJob(jobId);

  const savedJob = await prisma.savedJob.findUnique({
    where: {
      userId_jobId: {
        userId,
        jobId: job.id,
      },
    },
    select: { id: true },
  });

  if (!savedJob) {
    return;
  }

  await prisma.savedJob.delete({
    where: { id: savedJob.id },
  });
}
