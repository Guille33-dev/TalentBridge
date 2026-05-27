import bcrypt from 'bcryptjs';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ApplicationStatus, CompanyStatus, JobCategory, JobModality, JobStatus, UserRole } from '@prisma/client';
import { app } from '../src/app';
import { prisma } from '../src/config/prisma';

const runId = Date.now();
const testEmailDomain = '@talentbridge.test';
const studentEmail = `student.${runId}${testEmailDomain}`;
const adminEmail = `admin.${runId}${testEmailDomain}`;
const studentPassword = 'StudentTest123!';
const adminPassword = 'AdminTest123';
const companySlug = `tb-test-company-${runId}`;
const jobSlug = `tb-test-job-${runId}`;
const secondCompanySlug = `tb-test-company-secondary-${runId}`;
const secondJobSlug = `tb-test-job-secondary-${runId}`;
const companyUserEmail = `company.${runId}${testEmailDomain}`;
const companyUserPassword = 'CompanyTest123!';
const companyApplicantEmail = `company.applicant.${runId}${testEmailDomain}`;
const companyPortalSlug = `tb-test-company-portal-${runId}`;
const companyPortalJobSlug = `tb-test-company-job-${runId}`;

let studentToken = '';
let adminToken = '';
let companyToken = '';
let companyPortalId = '';
let companyPortalJobId = '';
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
      category: JobCategory.QA,
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
      category: JobCategory.DEVELOPMENT,
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

  it('filtra empresas por el nombre escrito en el buscador', async () => {
    const response = await request(app).get('/api/v1/companies').query({ search: `Filter Company ${runId}` }).expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({
      slug: secondCompanySlug,
      name: `TalentBridge Filter Company ${runId}`,
    });
  });

  it('filtra empresas por sector sin mezclarlo con el texto de busqueda', async () => {
    const response = await request(app).get('/api/v1/companies').query({ search: `${runId}`, category: 'Producto' }).expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({
      slug: secondCompanySlug,
      name: `TalentBridge Filter Company ${runId}`,
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

  it('filtra practicas por categoria', async () => {
    const response = await request(app).get('/api/v1/jobs').query({ category: 'QA', search: `${runId}` }).expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({
      slug: jobSlug,
      category: JobCategory.QA,
    });
  });

  it('interpreta el area escrita en el buscador de practicas como categoria', async () => {
    const response = await request(app).get('/api/v1/jobs').query({ search: 'desarrollo', company: secondCompanySlug }).expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({
      slug: secondJobSlug,
      category: JobCategory.DEVELOPMENT,
    });
  });

  it('interpreta remoto en ubicacion como modalidad remota', async () => {
    const response = await request(app).get('/api/v1/jobs').query({ location: 'remoto', search: `${runId}` }).expect(200);

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
    const response = await request(app).get('/api/v1/admin/companies').set('Authorization', `Bearer ${studentToken}`).expect(403);

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

    const response = await request(app).get('/api/v1/admin/companies').set('Authorization', `Bearer ${adminToken}`).expect(200);

    expect(Array.isArray(response.body.data)).toBe(true);
  });
});

describe.sequential('Flujo de empresa', () => {
  it('exige CIF/NIF y aceptacion legal en el registro de empresa', async () => {
    const missingTaxIdResponse = await request(app)
      .post('/api/v1/auth/register-company')
      .send({
        email: companyUserEmail,
        password: companyUserPassword,
        contactName: 'Company Owner',
        companyName: `TB Test Company Portal ${runId}`,
        companyLocation: 'Sevilla',
        companyIndustry: 'Testing',
        acceptTerms: true,
      })
      .expect(400);

    expect(missingTaxIdResponse.body.error.message).toBe('companyTaxId is required');

    const termsResponse = await request(app)
      .post('/api/v1/auth/register-company')
      .send({
        email: companyUserEmail,
        password: companyUserPassword,
        contactName: 'Company Owner',
        companyName: `TB Test Company Portal ${runId}`,
        companyLocation: 'Sevilla',
        companyIndustry: 'Testing',
        companyTaxId: `B-${runId}`,
        acceptTerms: false,
      })
      .expect(400);

    expect(termsResponse.body.error.message).toBe('Terms and privacy must be accepted');
  });

  it('registra una empresa pendiente de aprobacion', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register-company')
      .send({
        email: companyUserEmail,
        password: companyUserPassword,
        contactName: 'Company Owner',
        companyName: `TB Test Company Portal ${runId}`,
        companyLocation: 'Sevilla',
        companyIndustry: 'Testing',
        companyTaxId: `B-${runId}`,
        acceptTerms: true,
      })
      .expect(201);

    companyToken = response.body.data.token;
    companyPortalId = response.body.data.user.company.id;

    expect(response.body.data.user).toMatchObject({
      email: companyUserEmail,
      role: UserRole.COMPANY,
      company: {
        status: CompanyStatus.PENDING,
        taxId: `B-${runId}`.toUpperCase(),
      },
    });
  });

  it('devuelve el perfil propio de empresa', async () => {
    const response = await request(app).get('/api/v1/company/me').set('Authorization', `Bearer ${companyToken}`).expect(200);

    expect(response.body.data).toMatchObject({
      id: companyPortalId,
      status: CompanyStatus.PENDING,
    });
  });

  it('bloquea las funciones de estudiante para cuentas de empresa', async () => {
    await request(app).get('/api/v1/profile/me').set('Authorization', `Bearer ${companyToken}`).expect(403);
    await request(app).get('/api/v1/saved-jobs').set('Authorization', `Bearer ${companyToken}`).expect(403);
    await request(app).post('/api/v1/saved-jobs').set('Authorization', `Bearer ${companyToken}`).send({ jobId: jobSlug }).expect(403);
    await request(app).get('/api/v1/applications/me').set('Authorization', `Bearer ${companyToken}`).expect(403);
    await request(app).post('/api/v1/applications').set('Authorization', `Bearer ${companyToken}`).send({ jobId: jobSlug }).expect(403);
  });

  it('permite actualizar el perfil propio de empresa', async () => {
    const response = await request(app)
      .patch('/api/v1/company/me')
      .set('Authorization', `Bearer ${companyToken}`)
      .send({
        name: `TB Test Company Portal ${runId}`,
        description: 'Descripcion actualizada desde el panel de empresa.',
        tagline: 'Empresa de test para practicas',
        tags: ['Testing', 'Empresa'],
      })
      .expect(200);

    expect(response.body.data).toMatchObject({
      id: companyPortalId,
      description: 'Descripcion actualizada desde el panel de empresa.',
      tags: ['Testing', 'Empresa'],
    });
  });

  it('crea una practica propia pendiente de revision', async () => {
    const response = await request(app)
      .post('/api/v1/company/jobs')
      .set('Authorization', `Bearer ${companyToken}`)
      .send({
        title: `Practica Empresa Test ${runId}`,
        slug: companyPortalJobSlug,
        description: 'Practica creada por una empresa para validar el panel.',
        location: 'Remoto',
        modality: JobModality.REMOTE,
        category: JobCategory.DATA,
        duration: '3 meses',
        salaryLabel: '600 EUR/mes',
      })
      .expect(201);

    companyPortalJobId = response.body.data.id;

    expect(response.body.data).toMatchObject({
      slug: companyPortalJobSlug,
      status: JobStatus.PENDING_REVIEW,
      category: JobCategory.DATA,
    });
  });

  it('no permite que una empresa publique directamente una practica', async () => {
    const response = await request(app)
      .patch(`/api/v1/company/jobs/${companyPortalJobId}`)
      .set('Authorization', `Bearer ${companyToken}`)
      .send({ status: JobStatus.OPEN })
      .expect(400);

    expect(response.body.error.message).toBe('Las empresas no pueden publicar practicas directamente');
  });

  it('oculta la empresa pendiente y sus practicas en la parte publica', async () => {
    const companyResponse = await request(app).get(`/api/v1/companies/${companyPortalId}`).expect(404);
    const jobResponse = await request(app).get(`/api/v1/jobs/${companyPortalJobSlug}`).expect(404);

    expect(companyResponse.body.error.message).toBe('Company not found');
    expect(jobResponse.body.error.message).toBe('Job not found');
  });

  it('permite al admin aprobar empresa y publicar practica', async () => {
    await request(app)
      .patch(`/api/v1/admin/companies/${companyPortalId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: CompanyStatus.APPROVED })
      .expect(200);

    await request(app)
      .patch(`/api/v1/admin/jobs/${companyPortalJobId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: JobStatus.OPEN })
      .expect(200);

    const response = await request(app).get(`/api/v1/jobs/${companyPortalJobSlug}`).expect(200);

    expect(response.body.data).toMatchObject({
      slug: companyPortalJobSlug,
      status: JobStatus.OPEN,
      company: {
        status: CompanyStatus.APPROVED,
      },
    });
  });

  it('permite a la empresa revisar el perfil del candidato de una postulacion propia', async () => {
    const passwordHash = await bcrypt.hash('CompanyApplicantTest123', 12);
    const applicant = await prisma.user.create({
      data: {
        email: companyApplicantEmail,
        passwordHash,
        firstName: 'Candidata',
        lastName: 'Empresa',
        role: UserRole.STUDENT,
        profile: {
          create: {
            university: 'CEI Sevilla',
            major: 'Desarrollo de Aplicaciones Web',
            semester: '2º año',
            phone: '+34 600 111 222',
            location: 'Sevilla',
            availability: '6 meses',
            bio: 'Busco una practica para crecer en datos y producto digital.',
            skills: ['SQL', 'React', 'Trabajo en equipo'],
            avatarInitials: 'CE',
            profileCompletion: 100,
          },
        },
      },
    });

    const ownApplication = await prisma.application.create({
      data: {
        userId: applicant.id,
        jobId: companyPortalJobId,
        status: ApplicationStatus.SUBMITTED,
        coverLetter: 'Me interesa esta practica porque encaja con mi perfil.',
      },
    });

    const companyResponse = await request(app)
      .get('/api/v1/company/applications')
      .set('Authorization', `Bearer ${companyToken}`)
      .expect(200);

    const application = companyResponse.body.data.find((item: { id: string }) => item.id === ownApplication.id);

    expect(application).toMatchObject({
      id: ownApplication.id,
      coverLetter: 'Me interesa esta practica porque encaja con mi perfil.',
      user: {
        email: companyApplicantEmail,
        firstName: 'Candidata',
        lastName: 'Empresa',
        profile: {
          university: 'CEI Sevilla',
          major: 'Desarrollo de Aplicaciones Web',
          phone: '+34 600 111 222',
          skills: ['SQL', 'React', 'Trabajo en equipo'],
          profileCompletion: 100,
        },
      },
      job: {
        slug: companyPortalJobSlug,
      },
    });

    expect(companyResponse.body.data.some((item: { id: string }) => item.id === otherApplicationId)).toBe(false);

    const adminResponse = await request(app).get('/api/v1/admin/applications').set('Authorization', `Bearer ${adminToken}`).expect(200);
    const adminApplication = adminResponse.body.data.find((item: { id: string }) => item.id === ownApplication.id);

    expect(adminApplication.user.profile).toMatchObject({
      university: 'CEI Sevilla',
      availability: '6 meses',
      bio: 'Busco una practica para crecer en datos y producto digital.',
    });
  });

  it('permite al admin ocultar una empresa y sus practicas de la parte publica', async () => {
    await request(app)
      .patch(`/api/v1/admin/companies/${companyPortalId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: CompanyStatus.HIDDEN })
      .expect(200);

    const companyResponse = await request(app).get(`/api/v1/companies/${companyPortalId}`).expect(404);
    const jobResponse = await request(app).get(`/api/v1/jobs/${companyPortalJobSlug}`).expect(404);

    expect(companyResponse.body.error.message).toBe('Company not found');
    expect(jobResponse.body.error.message).toBe('Job not found');
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

  it('permite quitar una practica aunque ya no este guardada', async () => {
    await request(app).delete(`/api/v1/saved-jobs/${jobSlug}`).set('Authorization', `Bearer ${studentToken}`).expect(204);
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
