const bcrypt = require('bcryptjs');
const { PrismaClient, JobModality, UserRole } = require('@prisma/client');

const prisma = new PrismaClient();

const companies = [
  {
    slug: 'techvision-inc',
    name: 'TechVision Inc',
    logo: 'https://images.unsplash.com/photo-1718220216044-006f43e3a9b1?w=200&h=200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1665360755361-d8cd03c82b28?w=1400&h=400&fit=crop',
    tagline: 'Liderando el futuro de la IA y el aprendizaje automatico',
    description: 'Empresa lider en innovacion tecnologica y desarrollo de IA.',
    culture:
      'Cultura de innovacion, colaboracion y aprendizaje continuo con horarios flexibles y mentoria personalizada.',
    location: 'Madrid',
    size: '500-1000 empleados',
    website: 'https://www.techvision.com',
    industry: 'Inteligencia Artificial',
    foundedYear: 2015,
    tags: ['Tecnologia', 'Remoto', 'Flexible'],
    benefits: [
      'Apoyo economico competitivo',
      'Mentoria personalizada',
      'Horarios flexibles',
      'Trabajo remoto o hibrido',
      'Capacitacion y certificaciones',
      'Oportunidad de contratacion',
    ],
    gallery: [
      'https://images.unsplash.com/photo-1718220216044-006f43e3a9b1?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1665360755361-d8cd03c82b28?w=600&h=400&fit=crop',
    ],
  },
  {
    slug: 'growthlabs',
    name: 'GrowthLabs',
    logo: 'https://images.unsplash.com/photo-1665360755361-d8cd03c82b28?w=200&h=200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&h=400&fit=crop',
    tagline: 'Startup en crecimiento con ambiente innovador',
    description: 'Startup enfocada en crecimiento digital, producto y marketing.',
    culture: 'Equipos pequenos, autonomia alta y aprendizaje muy practico.',
    location: 'Valencia',
    size: '50-100 empleados',
    website: 'https://www.growthlabs.example',
    industry: 'Marketing y producto digital',
    foundedYear: 2020,
    tags: ['Startup', 'Marketing', 'Hibrido'],
    benefits: ['Horario flexible', 'Mentoria', 'Ambiente dinamico'],
    gallery: [],
  },
  {
    slug: 'cloudscale',
    name: 'CloudScale',
    logo: 'https://images.unsplash.com/photo-1496180470114-6ef490f3ff22?w=200&h=200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1400&h=400&fit=crop',
    tagline: 'Soluciones empresariales en la nube',
    description: 'Consultora especializada en cloud, DevOps y operaciones de infraestructura.',
    culture: 'Aprendizaje tecnico intensivo, colaboracion remota y cultura de mejora continua.',
    location: 'Malaga',
    size: '100-250 empleados',
    website: 'https://www.cloudscale.example',
    industry: 'Cloud',
    foundedYear: 2018,
    tags: ['Cloud', 'Desarrollo', 'Remoto'],
    benefits: ['Certificaciones cloud', 'Trabajo remoto', 'Mentoria tecnica'],
    gallery: [],
  },
  {
    slug: 'designstudio',
    name: 'DesignStudio',
    logo: 'https://images.unsplash.com/photo-1510832758362-af875829efcf?w=200&h=200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1400&h=400&fit=crop',
    tagline: 'Experiencias digitales con foco en diseno',
    description: 'Agencia creativa especializada en branding, producto y experiencias digitales.',
    culture: 'Ambiente creativo, feedback constante y proyectos con clientes reales.',
    location: 'Barcelona',
    size: '25-50 empleados',
    website: 'https://www.designstudio.example',
    industry: 'Diseno digital',
    foundedYear: 2019,
    tags: ['Diseno', 'Creativo', 'Presencial'],
    benefits: ['Portfolio real', 'Mentoria UX', 'Equipo creativo'],
    gallery: [],
  },
];

const jobs = [
  {
    slug: 'practica-product-management-techvision',
    companySlug: 'techvision-inc',
    title: 'Practica en Product Management',
    description:
      'Participa en la definicion y mejora de productos digitales basados en IA junto a equipos multidisciplinares.',
    overview:
      'Buscamos un estudiante apasionado por la tecnologia y el producto para colaborar en proyectos reales de IA.',
    location: 'Remoto',
    modality: JobModality.REMOTE,
    duration: '6 meses',
    salaryLabel: '800 EUR/mes',
    schedule: 'Lunes a viernes, 20 horas semanales',
    startDate: 'Septiembre 2026',
    applicationDeadline: new Date('2026-08-15T23:59:59.000Z'),
    openings: 2,
    applicantsCount: 24,
    featured: true,
    tags: ['Producto', 'Remoto', 'Ingenieria'],
    responsibilities: [
      'Colaborar en roadmaps de producto',
      'Realizar investigacion de usuarios',
      'Apoyar en user stories y wireframes',
      'Analizar metricas de producto',
    ],
    requirements: [
      'Estudiante de ingenieria, informatica o similar',
      'Interes por tecnologia y producto',
      'Comunicacion clara y trabajo en equipo',
    ],
    benefits: ['Mentoria personalizada', 'Horario flexible', 'Trabajo remoto'],
    skills: ['Pensamiento analitico', 'Comunicacion', 'Figma basico'],
  },
  {
    slug: 'desarrollador-full-stack-junior-growthlabs',
    companySlug: 'growthlabs',
    title: 'Desarrollador Full Stack Junior',
    description: 'Construye funcionalidades web con React, Node.js y buenas practicas de producto.',
    overview: 'Practica tecnica para estudiantes que quieren crecer en desarrollo web fullstack.',
    location: 'Madrid',
    modality: JobModality.HYBRID,
    duration: '4 meses',
    salaryLabel: '700 EUR/mes',
    schedule: '20 horas semanales',
    startDate: 'Octubre 2026',
    applicationDeadline: new Date('2026-09-15T23:59:59.000Z'),
    openings: 1,
    applicantsCount: 18,
    featured: false,
    tags: ['Desarrollo', 'JavaScript', 'React'],
    responsibilities: ['Crear componentes React', 'Apoyar endpoints backend', 'Participar en code reviews'],
    requirements: ['Conocimientos basicos de JavaScript', 'Git basico', 'Ganas de aprender'],
    benefits: ['Mentoria tecnica', 'Proyectos reales', 'Posibilidad de continuidad'],
    skills: ['React', 'Node.js', 'SQL'],
  },
  {
    slug: 'disenador-ux-ui-practicas-designstudio',
    companySlug: 'designstudio',
    title: 'Disenador UX/UI en Practicas',
    description: 'Apoya procesos de investigacion, wireframes y diseno visual para productos digitales.',
    overview: 'Practica orientada a estudiantes con sensibilidad visual y curiosidad por producto.',
    location: 'Barcelona',
    modality: JobModality.ONSITE,
    duration: '6 meses',
    salaryLabel: '750 EUR/mes',
    schedule: 'Media jornada',
    startDate: 'Septiembre 2026',
    applicationDeadline: new Date('2026-08-30T23:59:59.000Z'),
    openings: 1,
    applicantsCount: 31,
    featured: true,
    tags: ['Diseno', 'UX', 'Figma'],
    responsibilities: ['Crear wireframes', 'Preparar prototipos', 'Apoyar research con usuarios'],
    requirements: ['Portfolio academico o personal', 'Figma basico', 'Interes por UX'],
    benefits: ['Portfolio real', 'Feedback semanal', 'Contacto con clientes'],
    skills: ['Figma', 'UX Research', 'Prototipado'],
  },
  {
    slug: 'practica-devops-cloudscale',
    companySlug: 'cloudscale',
    title: 'Practica en DevOps',
    description: 'Aprende fundamentos de automatizacion, despliegue e infraestructura cloud.',
    overview: 'Practica tecnica para estudiantes interesados en cloud, Linux y automatizacion.',
    location: 'Remoto',
    modality: JobModality.REMOTE,
    duration: '5 meses',
    salaryLabel: '750 EUR/mes',
    schedule: '20 horas semanales',
    startDate: 'Noviembre 2026',
    applicationDeadline: new Date('2026-10-10T23:59:59.000Z'),
    openings: 2,
    applicantsCount: 15,
    featured: false,
    tags: ['DevOps', 'AWS', 'Linux'],
    responsibilities: ['Apoyar pipelines CI/CD', 'Documentar procesos', 'Monitorizar servicios'],
    requirements: ['Linux basico', 'Interes por cloud', 'Git basico'],
    benefits: ['Certificaciones', 'Mentoria senior', 'Trabajo remoto'],
    skills: ['Linux', 'CI/CD', 'Cloud'],
  },
];

async function main() {
  const adminPasswordHash = await bcrypt.hash('Admin12345', 12);

  await prisma.user.upsert({
    where: { email: 'admin@talentbridge.local' },
    update: {
      firstName: 'Admin',
      lastName: 'TalentBridge',
      role: UserRole.ADMIN,
    },
    create: {
      email: 'admin@talentbridge.local',
      passwordHash: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'TalentBridge',
      role: UserRole.ADMIN,
    },
  });

  const companyBySlug = {};

  for (const company of companies) {
    companyBySlug[company.slug] = await prisma.company.upsert({
      where: { slug: company.slug },
      update: company,
      create: company,
    });
  }

  for (const job of jobs) {
    const { companySlug, ...jobData } = job;
    const company = companyBySlug[companySlug];

    await prisma.job.upsert({
      where: { slug: job.slug },
      update: {
        ...jobData,
        companyId: company.id,
      },
      create: {
        ...jobData,
        companyId: company.id,
      },
    });
  }

  console.log(`Seed completed: ${companies.length} companies, ${jobs.length} jobs and 1 admin user.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
