import bcrypt from 'bcryptjs';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ApplicationStatus, JobModality, JobStatus, UserRole } from '@prisma/client';
import { app } from '../src/app';
import { prisma } from '../src/config/prisma';

const runId = Date.now();
const testEmailDomain = '@talentbridge.test';
const studentEmail = `student.${runId}${testEmailDomain}`;
const adminEmail = `admin.${runId}${testEmailDomain}`;
const studentPassword = 'StudentTest123';
const adminPassword = 'AdminTest123';
const companySlug = `tb-test-company-${runId}`;
const jobSlug = `tb-test-job-${runId}`;
const secondCompanySlug = `tb-test-company-secondary-${runId}`;
const secondJobSlug = `tb-test-job-secondary-${runId}`;

let studentToken = '';
let adminToken = '';
let secondJobId = '';
let otherApplicationId = '';

async function cleanupTestData() {
  await prisma.company.deleteMany({
    where: {
      slug: {
        startsWith: 'tb-test-',
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      email: {
        endsWith: testEmailDomain,
      },
    },
  });
}

async function createTestAdmin() {
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash,
      firstName: 'Admin',
      lastName: 'Test',
      role: UserRole.ADMIN,
    },
  });
}

async function createPublicCatalogData() {
  const company = await prisma.company.create({
    data: {
      name: `TalentBridge Test Company ${runId}`,
      slug: companySlug,
      description: 'Empresa temporal creada para los tests automaticos.',
      location: 'Sevilla',
      industry: 'Tecnologia',
      tags: ['Testing'],
    },
  });

  await prisma.job.create({
    data: {
      companyId: company.id,
      slug: jobSlug,
      title: `Practicas QA Test ${runId}`,
      description: 'Oferta temporal creada para validar los endpoints publicos.',
      location: 'Sevilla',
      modality: JobModality.HYBRID,
      status: JobStatus.OPEN,
      tags: ['Testing'],
      featured: true,
    },
  });

  const secondCompany = await prisma.company.create({
    data: {
      name: `TalentBridge Filter Company ${runId}`,
      slug: secondCompanySlug,
      description: 'Segunda empresa temporal creada para validar paginacion.',
      location: 'Madrid',
      industry: 'Producto',
      tags: ['Testing', 'Producto'],
    },
  });

  const secondJob = await prisma.job.create({
    data: {
      companyId: secondCompany.id,
      slug: secondJobSlug,
      title: `Practicas Backend Test ${runId}`,
      description: 'Segunda oferta temporal creada para validar filtros y paginacion.',
      location: 'Madrid',
      modality: JobModality.REMOTE,
      status: JobStatus.OPEN,
      tags: ['Testing', 'Backend'],
    },
  });

  secondJobId = secondJob.id;
}

async function createOtherUserApplication() {
  const passwordHash = await bcrypt.hash('OtherStudentTest123', 12);
  const otherUser = await prisma.user.create({
    data: {
      email: `other.student.${runId}${testEmailDomain}`,
      passwordHash,
      firstName: 'Other',
      lastName: 'Student',
      role: UserRole.STUDENT,
      profile: {
        create: {
          avatarInitials: 'OS',
          profileCompletion: 0,
        },
      },
    },
  });

  const application = await prisma.application.create({
    data: {
      userId: otherUser.id,
      jobId: secondJobId,
      status: ApplicationStatus.SUBMITTED,
      coverLetter: 'Postulacion de otro usuario para validar permisos.',
    },
  });

  otherApplicationId = application.id;
}

beforeAll(async () => {
  await cleanupTestData();
  await createTestAdmin();
  await createPublicCatalogData();
  await createOtherUserApplication();
});

afterAll(async () => {
  await cleanupTestData();
  await prisma.$disconnect();
});

describe.sequential('API basica', () => {
  it('devuelve el healthcheck', async () => {
    const response = await request(app).get('/api/v1/health').expect(200);

    expect(response.body.status).toBe('ok');
    expect(response.body.service).toBe('talentbridge-api');
    expect(response.body.environment).toBe('test');
  });

  it('devuelve el listado publico de practicas', async () => {
    const response = await request(app).get('/api/v1/jobs').query({ search: `QA Test ${runId}` }).expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({
      slug: jobSlug,
      title: `Practicas QA Test ${runId}`,
      location: 'Sevilla',
      modality: JobModality.HYBRID,
    });
    expect(response.body.pagination.total).toBe(1);
  });

  it('devuelve el detalle publico de una practica', async () => {
    const response = await request(app).get(`/api/v1/jobs/${jobSlug}`).expect(200);

    expect(response.body.data).toMatchObject({
      slug: jobSlug,
      title: `Practicas QA Test ${runId}`,
      company: {
        slug: companySlug,
      },
    });
  });

  it('devuelve el listado publico de empresas', async () => {
    const response = await request(app).get('/api/v1/companies').query({ search: `Test Company ${runId}` }).expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({
      slug: companySlug,
      name: `TalentBridge Test Company ${runId}`,
      openPositions: 1,
    });
  });

  it('devuelve el detalle publico de una empresa', async () => {
    const response = await request(app).get(`/api/v1/companies/${companySlug}`).expect(200);

    expect(response.body.data).toMatchObject({
      slug: companySlug,
      name: `TalentBridge Test Company ${runId}`,
    });
    expect(response.body.data.jobs).toHaveLength(1);
    expect(response.body.data.jobs[0].slug).toBe(jobSlug);
  });

  it('filtra practicas por ubicacion', async () => {
    const response = await request(app).get('/api/v1/jobs').query({ location: 'Madrid', search: `${runId}` }).expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({
      slug: secondJobSlug,
      location: 'Madrid',
    });
  });

  it('filtra practicas por modalidad', async () => {
    const response = await request(app).get('/api/v1/jobs').query({ modality: 'remote', search: `${runId}` }).expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({
      slug: secondJobSlug,
      modality: JobModality.REMOTE,
    });
  });

  it('filtra practicas por empresa', async () => {
    const response = await request(app).get('/api/v1/jobs').query({ company: companySlug }).expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].slug).toBe(jobSlug);
  });

  it('pagina el listado publico de practicas', async () => {
    const response = await request(app).get('/api/v1/jobs').query({ search: `${runId}`, page: 2, limit: 1 }).expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.pagination).toMatchObject({
      page: 2,
      limit: 1,
      total: 2,
      totalPages: 2,
    });
  });

  it('devuelve 404 para una practica inexistente', async () => {
    const response = await request(app).get('/api/v1/jobs/practica-inexistente-test').expect(404);

    expect(response.body.error.message).toBe('Job not found');
  });

  it('pagina el listado publico de empresas', async () => {
    const response = await request(app).get('/api/v1/companies').query({ search: `${runId}`, page: 2, limit: 1 }).expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.pagination).toMatchObject({
      page: 2,
      limit: 1,
      total: 2,
      totalPages: 2,
    });
  });

  it('devuelve 404 para una empresa inexistente', async () => {
    const response = await request(app).get('/api/v1/companies/empresa-inexistente-test').expect(404);

    expect(response.body.error.message).toBe('Company not found');
  });
});

describe.sequential('Auth y permisos', () => {
  it('registra un estudiante nuevo', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: studentEmail,
        password: studentPassword,
        firstName: 'Student',
        lastName: 'Test',
      })
      .expect(201);

    expect(response.body.data.token).toEqual(expect.any(String));
    expect(response.body.data.user).toMatchObject({
      email: studentEmail,
      role: UserRole.STUDENT,
      profile: {
        profileCompletion: 0,
      },
    });
  });

  it('rechaza un login incorrecto', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: studentEmail,
        password: 'wrong-password',
      })
      .expect(401);

    expect(response.body.error.message).toBe('Invalid email or password');
  });

  it('inicia sesion con un estudiante registrado', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: studentEmail,
        password: studentPassword,
      })
      .expect(200);

    studentToken = response.body.data.token;

    expect(studentToken).toEqual(expect.any(String));
    expect(response.body.data.user.email).toBe(studentEmail);
  });

  it('bloquea /users/me sin token', async () => {
    const response = await request(app).get('/api/v1/users/me').expect(401);

    expect(response.body.error.message).toBe('Authentication required');
  });

  it('devuelve /users/me con token valido', async () => {
    const response = await request(app).get('/api/v1/users/me').set('Authorization', `Bearer ${studentToken}`).expect(200);

    expect(response.body.data).toMatchObject({
      email: studentEmail,
      role: UserRole.STUDENT,
    });
  });

  it('bloquea el panel admin para estudiantes', async () => {
    const response = await request(app).get('/api/v1/admin/summary').set('Authorization', `Bearer ${studentToken}`).expect(403);

    expect(response.body.error.message).toBe('Insufficient permissions');
  });

  it('permite el panel admin para administradores', async () => {
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: adminEmail,
        password: adminPassword,
      })
      .expect(200);

    adminToken = loginResponse.body.data.token;

    const response = await request(app).get('/api/v1/admin/summary').set('Authorization', `Bearer ${adminToken}`).expect(200);

    expect(response.body.data).toMatchObject({
      companies: expect.any(Number),
      applications: expect.any(Number),
      students: expect.any(Number),
    });
    expect(response.body.data.jobs.total).toEqual(expect.any(Number));
  });
});

describe.sequential('Flujo de estudiante', () => {
  let applicationId = '';

  it('bloquea el perfil sin token', async () => {
    const response = await request(app).get('/api/v1/profile/me').expect(401);

    expect(response.body.error.message).toBe('Authentication required');
  });

  it('devuelve el perfil inicial del estudiante', async () => {
    const response = await request(app).get('/api/v1/profile/me').set('Authorization', `Bearer ${studentToken}`).expect(200);

    expect(response.body.data).toMatchObject({
      email: studentEmail,
      firstName: 'Student',
      lastName: 'Test',
      role: UserRole.STUDENT,
      profile: {
        university: null,
        major: null,
        semester: null,
        profileCompletion: 0,
      },
    });
  });

  it('actualiza el perfil del estudiante', async () => {
    const response = await request(app)
      .patch('/api/v1/profile/me')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        firstName: 'Student Updated',
        lastName: 'Tester',
        university: 'CEI Sevilla',
        major: 'Desarrollo de Aplicaciones Web',
        semester: '2',
        phone: '+34900111222',
        location: 'Sevilla',
        availability: 'Mananas',
        bio: 'Perfil de test actualizado.',
        skills: ['React', 'Node.js', 'Testing'],
      })
      .expect(200);

    expect(response.body.data).toMatchObject({
      firstName: 'Student Updated',
      lastName: 'Tester',
      profile: {
        university: 'CEI Sevilla',
        major: 'Desarrollo de Aplicaciones Web',
        semester: '2',
        phone: '+34900111222',
        location: 'Sevilla',
        availability: 'Mananas',
        bio: 'Perfil de test actualizado.',
        skills: ['React', 'Node.js', 'Testing'],
        profileCompletion: 100,
      },
    });
  });

  it('rechaza una actualizacion de perfil con skills invalidas', async () => {
    const response = await request(app)
      .patch('/api/v1/profile/me')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        skills: 'React',
      })
      .expect(400);

    expect(response.body.error.message).toBe('skills must be an array of strings');
  });

  it('bloquea practicas guardadas sin token', async () => {
    const response = await request(app).get('/api/v1/saved-jobs').expect(401);

    expect(response.body.error.message).toBe('Authentication required');
  });

  it('lista practicas guardadas inicialmente vacias', async () => {
    const response = await request(app).get('/api/v1/saved-jobs').set('Authorization', `Bearer ${studentToken}`).expect(200);

    expect(response.body.data).toEqual([]);
  });

  it('guarda una practica', async () => {
    const response = await request(app)
      .post('/api/v1/saved-jobs')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ jobId: jobSlug })
      .expect(201);

    expect(response.body.data.job).toMatchObject({
      slug: jobSlug,
      title: `Practicas QA Test ${runId}`,
    });
  });

  it('muestra la practica guardada en la lista', async () => {
    const response = await request(app).get('/api/v1/saved-jobs').set('Authorization', `Bearer ${studentToken}`).expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].job.slug).toBe(jobSlug);
  });

  it('rechaza guardar una practica duplicada', async () => {
    const response = await request(app)
      .post('/api/v1/saved-jobs')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ jobId: jobSlug })
      .expect(409);

    expect(response.body.error.message).toBe('Esta practica ya esta guardada');
  });

  it('rechaza guardar una practica inexistente', async () => {
    const response = await request(app)
      .post('/api/v1/saved-jobs')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ jobId: 'practica-inexistente-test' })
      .expect(404);

    expect(response.body.error.message).toBe('Job not found');
  });

  it('quita una practica guardada', async () => {
    await request(app).delete(`/api/v1/saved-jobs/${jobSlug}`).set('Authorization', `Bearer ${studentToken}`).expect(204);

    const response = await request(app).get('/api/v1/saved-jobs').set('Authorization', `Bearer ${studentToken}`).expect(200);
    expect(response.body.data).toEqual([]);
  });

  it('bloquea postulaciones sin token', async () => {
    const response = await request(app).get('/api/v1/applications/me').expect(401);

    expect(response.body.error.message).toBe('Authentication required');
  });

  it('lista postulaciones inicialmente vacias', async () => {
    const response = await request(app).get('/api/v1/applications/me').set('Authorization', `Bearer ${studentToken}`).expect(200);

    expect(response.body.data).toEqual([]);
  });

  it('crea una postulacion', async () => {
    const response = await request(app)
      .post('/api/v1/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        jobId: jobSlug,
        coverLetter: 'Me interesa esta practica de test.',
      })
      .expect(201);

    applicationId = response.body.data.id;

    expect(response.body.data).toMatchObject({
      status: ApplicationStatus.SUBMITTED,
      coverLetter: 'Me interesa esta practica de test.',
      job: {
        slug: jobSlug,
      },
    });
  });

  it('muestra la postulacion en la lista del estudiante', async () => {
    const response = await request(app).get('/api/v1/applications/me').set('Authorization', `Bearer ${studentToken}`).expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({
      id: applicationId,
      status: ApplicationStatus.SUBMITTED,
      job: {
        slug: jobSlug,
      },
    });
  });

  it('rechaza una postulacion duplicada', async () => {
    const response = await request(app)
      .post('/api/v1/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ jobId: jobSlug })
      .expect(409);

    expect(response.body.error.message).toBe('Ya te has postulado a esta practica');
  });

  it('rechaza una postulacion a una practica inexistente', async () => {
    const response = await request(app)
      .post('/api/v1/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ jobId: 'practica-inexistente-test' })
      .expect(404);

    expect(response.body.error.message).toBe('Job not found');
  });

  it('impide retirar una postulacion de otro usuario', async () => {
    const response = await request(app)
      .patch(`/api/v1/applications/${otherApplicationId}/withdraw`)
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(404);

    expect(response.body.error.message).toBe('Application not found');
  });

  it('retira una postulacion propia', async () => {
    const response = await request(app)
      .patch(`/api/v1/applications/${applicationId}/withdraw`)
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);

    expect(response.body.data).toMatchObject({
      id: applicationId,
      status: ApplicationStatus.WITHDRAWN,
      nextStep: null,
    });
  });

  it('rechaza retirar dos veces la misma postulacion', async () => {
    const response = await request(app)
      .patch(`/api/v1/applications/${applicationId}/withdraw`)
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(409);

    expect(response.body.error.message).toBe('Application already withdrawn');
  });

  it('permite volver a postular tras retirar una candidatura', async () => {
    const response = await request(app)
      .post('/api/v1/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        jobId: jobSlug,
        coverLetter: 'Vuelvo a postular tras retirar la candidatura.',
      })
      .expect(201);

    expect(response.body.data).toMatchObject({
      id: applicationId,
      status: ApplicationStatus.SUBMITTED,
      coverLetter: 'Vuelvo a postular tras retirar la candidatura.',
    });
  });
});
