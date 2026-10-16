import { useState, createContext, useContext } from 'react';
import Dashboard from './components/Dashboard';
import EmployeeProfile from './components/EmployeeProfile';
import Requests from './components/Requests';
import Recruitment from './components/Recruitment';
import Policies from './components/Policies';
import Evaluations from './components/Evaluations';
import Reports from './components/Reports';
import AdminPanel from './components/AdminPanel';
import Help from './components/Help';
import NotificationCenter from './components/NotificationCenter';

// ============ TYPES ============
export interface CompanyData {
  name: string;
  legalName: string;
  taxId: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  founded: string;
  industry: string;
  employees: number;
  logo?: string;
}

export interface Plaza {
  id: string;
  name: string;
  description: string;
  level: string;
  minSalary: number;
  maxSalary: number;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  manager: string;
  plazas: Plaza[];
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  departmentId: string;
  position: string;
  plazaId: string;
  phone: string;
  startDate: string;
  skills: string[];
  certifications: string[];
  avatar?: string;
  status: 'Activo' | 'Inactivo' | 'Vacaciones' | 'Licencia';
}

export interface Training {
  id: string;
  employeeId: string;
  course: string;
  provider: string;
  date: string;
  hours: number;
  status: 'Completado' | 'En Progreso' | 'Pendiente';
}

export interface Request {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pendiente' | 'Aprobado' | 'Rechazado';
  createdAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  plazaId?: string;
  departmentId?: string;
  skills: string[];
  status: 'En Revisión' | 'Entrevista' | 'Contratado' | 'Descartado';
  appliedDate: string;
  source: string;
  hiredEmployeeId?: string;
}

export interface Policy {
  id: string;
  title: string;
  category: string;
  content: string;
  articles: { title: string; content: string }[];
  confirmed: boolean;
}

export interface Evaluation {
  id: string;
  employeeId: string;
  employeeName: string;
  evaluator: string;
  type: 'Desempeño' | '360°' | 'Objetivos' | 'Competencias';
  period: string;
  date: string;
  score: number;
  strengths: string[];
  improvements: string[];
  goals: string[];
  status: 'Programada' | 'En Proceso' | 'Completada';
  comments: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  date: string;
  read: boolean;
  module: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  type: 'cumpleanos' | 'aniversario' | 'capacitacion' | 'reunion' | 'vencimiento';
  description: string;
}

interface AppState {
  companyData: CompanyData;
  employees: Employee[];
  requests: Request[];
  candidates: Candidate[];
  policies: Policy[];
  trainings: Training[];
  departments: Department[];
  evaluations: Evaluation[];
  notifications: Notification[];
  events: Event[];
  currentEmployee: Employee;
}

interface AppContextType {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  addNotification: (n: Omit<Notification, 'id' | 'date' | 'read'>) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};

// ============ INITIAL DATA ============
const initialData: AppState = {
  companyData: {
    name: 'Talent360 Corp',
    legalName: 'Talent360 Corporation de El Salvador S.A. de C.V.',
    taxId: '0614-150390-123-4',
    address: 'Boulevard de los Héroes #123, Colonia Escalón',
    city: 'San Salvador',
    country: 'El Salvador',
    phone: '+503 2200 0000',
    email: 'contacto@talent360corp.com.sv',
    website: 'www.talent360corp.com.sv',
    founded: '2015-03-15',
    industry: 'Tecnología y Servicios Profesionales',
    employees: 150,
  },
  currentEmployee: {
    id: 'EMP001',
    name: 'Carlos Alfredo Castillo Flores',
    email: 'carlos.castillo@empresa.com',
    department: 'Tecnología',
    departmentId: 'DEP001',
    position: 'Ingeniero de Software Senior',
    plazaId: 'PLZ002',
    phone: '+503 7123 4567',
    startDate: '2022-03-15',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Gestión de Proyectos'],
    certifications: ['AWS Solutions Architect', 'Scrum Master Certified', 'ITIL v4 Foundation'],
    status: 'Activo',
  },
  departments: [
    {
      id: 'DEP001', name: 'Tecnología',
      description: 'Desarrollo de software, infraestructura TI y soporte técnico.',
      manager: 'Carlos Alfredo Castillo Flores',
      plazas: [
        { id: 'PLZ001', name: 'Desarrollador Junior', description: 'Programador entry-level para desarrollo web y móvil.', level: 'Junior', minSalary: 600, maxSalary: 900 },
        { id: 'PLZ002', name: 'Ingeniero de Software Senior', description: 'Desarrollador con experiencia en arquitecturas complejas.', level: 'Senior', minSalary: 1500, maxSalary: 2500 },
        { id: 'PLZ003', name: 'DevOps Engineer', description: 'Especialista en infraestructura, CI/CD y nube.', level: 'Senior', minSalary: 1800, maxSalary: 2800 },
        { id: 'PLZ004', name: 'Frontend Developer', description: 'Desarrollador de interfaces de usuario con React/Vue.', level: 'Mid', minSalary: 1000, maxSalary: 1600 },
        { id: 'PLZ005', name: 'Backend Developer', description: 'Desarrollador de APIs y servicios backend.', level: 'Mid', minSalary: 1100, maxSalary: 1700 },
      ],
    },
    {
      id: 'DEP002', name: 'Recursos Humanos',
      description: 'Gestión del talento, nómina, reclutamiento y desarrollo organizacional.',
      manager: 'María González López',
      plazas: [
        { id: 'PLZ006', name: 'Coordinador de RRHH', description: 'Lidera procesos de gestión de personal y cultura organizacional.', level: 'Mid', minSalary: 1200, maxSalary: 1800 },
        { id: 'PLZ007', name: 'Especialista en Reclutamiento', description: 'Gestiona procesos de selección y atracción de talento.', level: 'Junior', minSalary: 700, maxSalary: 1100 },
        { id: 'PLZ008', name: 'Analista de Nómina', description: 'Procesa y administra la nómina de empleados.', level: 'Junior', minSalary: 650, maxSalary: 950 },
      ],
    },
    {
      id: 'DEP003', name: 'Finanzas',
      description: 'Contabilidad, análisis financiero, tesorería y auditoría.',
      manager: 'José Eduardo Portillo',
      plazas: [
        { id: 'PLZ009', name: 'Analista Financiero', description: 'Realiza análisis financiero y proyecciones.', level: 'Mid', minSalary: 1100, maxSalary: 1700 },
        { id: 'PLZ010', name: 'Contador General', description: 'Supervisa la contabilidad general y estados financieros.', level: 'Senior', minSalary: 1400, maxSalary: 2200 },
        { id: 'PLZ011', name: 'Auxiliar Contable', description: 'Apoyo en registros contables y conciliaciones.', level: 'Junior', minSalary: 550, maxSalary: 800 },
      ],
    },
    {
      id: 'DEP004', name: 'Marketing',
      description: 'Estrategia de marca, marketing digital, comunicaciones y eventos.',
      manager: 'Ana Lucía Ramírez Torres',
      plazas: [
        { id: 'PLZ012', name: 'Gerente de Marketing Digital', description: 'Lidera estrategias de marketing digital y campañas.', level: 'Senior', minSalary: 1600, maxSalary: 2400 },
        { id: 'PLZ013', name: 'Diseñador Gráfico', description: 'Crea piezas gráficas para campañas y branding.', level: 'Mid', minSalary: 900, maxSalary: 1400 },
        { id: 'PLZ014', name: 'Community Manager', description: 'Gestiona redes sociales y comunicación digital.', level: 'Junior', minSalary: 600, maxSalary: 900 },
      ],
    },
    {
      id: 'DEP005', name: 'Ventas',
      description: 'Gestión comercial, cuentas clave y desarrollo de negocio.',
      manager: 'Por definir',
      plazas: [
        { id: 'PLZ015', name: 'Ejecutivo de Ventas', description: 'Gestiona cartera de clientes y prospección.', level: 'Junior', minSalary: 500, maxSalary: 900 },
        { id: 'PLZ016', name: 'Gerente de Cuentas Clave', description: 'Administra cuentas estratégicas de alto volumen.', level: 'Senior', minSalary: 1500, maxSalary: 2500 },
      ],
    },
  ],
  employees: [
    { id: 'EMP001', name: 'Carlos Alfredo Castillo Flores', email: 'carlos.castillo@empresa.com', department: 'Tecnología', departmentId: 'DEP001', position: 'Ingeniero de Software Senior', plazaId: 'PLZ002', phone: '+503 7123 4567', startDate: '2022-03-15', skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'], certifications: ['AWS Solutions Architect', 'Scrum Master'], status: 'Activo' },
    { id: 'EMP002', name: 'María González López', email: 'maria.gonzalez@empresa.com', department: 'Recursos Humanos', departmentId: 'DEP002', position: 'Coordinadora de RRHH', plazaId: 'PLZ006', phone: '+503 7234 5678', startDate: '2021-06-01', skills: ['Gestión de Personal', 'Nómina', 'Capacitación'], certifications: ['SHRM-CP', 'Diplomado en Derecho Laboral'], status: 'Activo' },
    { id: 'EMP003', name: 'Roberto Hernández Díaz', email: 'roberto.hernandez@empresa.com', department: 'Finanzas', departmentId: 'DEP003', position: 'Analista Financiero', plazaId: 'PLZ009', phone: '+503 7345 6789', startDate: '2023-01-10', skills: ['Excel Avanzado', 'SAP', 'Análisis Financiero', 'Power BI'], certifications: ['CFA Level 1', 'Excel Expert'], status: 'Activo' },
    { id: 'EMP004', name: 'Ana Lucía Ramírez Torres', email: 'ana.ramirez@empresa.com', department: 'Marketing', departmentId: 'DEP004', position: 'Gerente de Marketing Digital', plazaId: 'PLZ012', phone: '+503 7456 7890', startDate: '2020-09-20', skills: ['SEO', 'Google Ads', 'Content Marketing', 'Analytics'], certifications: ['Google Ads Certified', 'HubSpot Inbound'], status: 'Vacaciones' },
    { id: 'EMP005', name: 'Fernando Morales Sánchez', email: 'fernando.morales@empresa.com', department: 'Tecnología', departmentId: 'DEP001', position: 'DevOps Engineer', plazaId: 'PLZ003', phone: '+503 7567 8901', startDate: '2022-11-05', skills: ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Terraform'], certifications: ['AWS DevOps Pro', 'CKA'], status: 'Activo' },
    { id: 'EMP006', name: 'Patricia Mejía Rivas', email: 'patricia.mejia@empresa.com', department: 'Recursos Humanos', departmentId: 'DEP002', position: 'Especialista en Reclutamiento', plazaId: 'PLZ007', phone: '+503 7678 9012', startDate: '2023-04-12', skills: ['Reclutamiento TI', 'Entrevistas', 'LinkedIn Recruiter'], certifications: ['Técnicas de Reclutamiento 3.0'], status: 'Activo' },
    { id: 'EMP007', name: 'José Eduardo Portillo', email: 'jose.portillo@empresa.com', department: 'Finanzas', departmentId: 'DEP003', position: 'Contador General', plazaId: 'PLZ010', phone: '+503 7789 0123', startDate: '2019-08-01', skills: ['NIIF', 'Auditoría', 'SAP FI', 'Excel'], certifications: ['CPA Certificado', 'Diplomado NIIF'], status: 'Activo' },
    { id: 'EMP008', name: 'Sofía Castillo Medina', email: 'sofia.castillo@empresa.com', department: 'Marketing', departmentId: 'DEP004', position: 'Diseñador Gráfico', plazaId: 'PLZ013', phone: '+503 7012 3456', startDate: '2026-06-01', skills: ['Figma', 'User Research', 'Prototyping'], certifications: [], status: 'Activo' },
  ],
  requests: [
    { id: 'REQ001', employeeId: 'EMP001', employeeName: 'Carlos Alfredo Castillo Flores', type: 'Vacaciones', startDate: '2026-07-15', endDate: '2026-07-22', reason: 'Vacaciones de verano', status: 'Aprobado', createdAt: '2026-06-01' },
    { id: 'REQ002', employeeId: 'EMP001', employeeName: 'Carlos Alfredo Castillo Flores', type: 'Permiso Médico', startDate: '2026-05-10', endDate: '2026-05-10', reason: 'Cita médica especializada', status: 'Aprobado', createdAt: '2026-05-05' },
    { id: 'REQ003', employeeId: 'EMP002', employeeName: 'María González López', type: 'Permiso Personal', startDate: '2026-06-20', endDate: '2026-06-20', reason: 'Trámite personal ineludible', status: 'Pendiente', createdAt: '2026-06-15' },
    { id: 'REQ004', employeeId: 'EMP003', employeeName: 'Roberto Hernández Díaz', type: 'Licencia Especial', startDate: '2026-08-01', endDate: '2026-08-15', reason: 'Curso de especialización profesional', status: 'Pendiente', createdAt: '2026-06-18' },
    { id: 'REQ005', employeeId: 'EMP004', employeeName: 'Ana Lucía Ramírez Torres', type: 'Vacaciones', startDate: '2026-04-01', endDate: '2026-04-07', reason: 'Viaje familiar', status: 'Rechazado', createdAt: '2026-03-20' },
    { id: 'REQ006', employeeId: 'EMP005', employeeName: 'Fernando Morales Sánchez', type: 'Permiso Médico', startDate: '2026-06-25', endDate: '2026-06-26', reason: 'Revisión médica anual', status: 'Aprobado', createdAt: '2026-06-20' },
    { id: 'REQ007', employeeId: 'EMP006', employeeName: 'Patricia Mejía Rivas', type: 'Vacaciones', startDate: '2026-07-01', endDate: '2026-07-05', reason: 'Descanso programado', status: 'Pendiente', createdAt: '2026-06-22' },
  ],
  candidates: [
    { id: 'CAN001', name: 'Laura Martínez Ruiz', email: 'laura.martinez@email.com', phone: '+503 7890 1234', position: 'Frontend Developer', plazaId: 'PLZ004', departmentId: 'DEP001', skills: ['React', 'TypeScript', 'CSS'], status: 'Entrevista', appliedDate: '2026-06-10', source: 'LinkedIn' },
    { id: 'CAN002', name: 'Diego Vargas Peña', email: 'diego.vargas@email.com', phone: '+503 7901 2345', position: 'Analista Financiero', plazaId: 'PLZ009', departmentId: 'DEP003', skills: ['Python', 'SQL', 'Machine Learning'], status: 'En Revisión', appliedDate: '2026-06-12', source: 'Portal Web' },
    { id: 'CAN003', name: 'Sofía Castillo Medina', email: 'sofia.castillo@email.com', phone: '+503 7012 3456', position: 'Diseñador Gráfico', plazaId: 'PLZ013', departmentId: 'DEP004', skills: ['Figma', 'User Research', 'Prototyping'], status: 'Contratado', appliedDate: '2026-05-20', source: 'Referido', hiredEmployeeId: 'EMP008' },
    { id: 'CAN004', name: 'Andrés López Guzmán', email: 'andres.lopez@email.com', phone: '+503 7123 4568', position: 'Backend Developer', plazaId: 'PLZ005', departmentId: 'DEP001', skills: ['Java', 'Spring Boot', 'Microservices'], status: 'Descartado', appliedDate: '2026-05-15', source: 'Indeed' },
    { id: 'CAN005', name: 'Carmen Elena Flores', email: 'carmen.flores@email.com', phone: '+503 7234 5679', position: 'Ejecutivo de Ventas', plazaId: 'PLZ015', departmentId: 'DEP005', skills: ['Scrum', 'Jira', 'Gestión de Proyectos'], status: 'Entrevista', appliedDate: '2026-06-14', source: 'LinkedIn' },
    { id: 'CAN006', name: 'Miguel Ángel Rodríguez', email: 'miguel.rodriguez@email.com', phone: '+503 7345 6780', position: 'Auxiliar Contable', plazaId: 'PLZ011', departmentId: 'DEP003', skills: ['Excel', 'Contabilidad', 'SAP'], status: 'En Revisión', appliedDate: '2026-06-18', source: 'Portal Web' },
  ],
  policies: [
    {
      id: 'POL001', title: 'Reglamento Interno de Trabajo', category: 'Normativo',
      content: 'El presente reglamento establece las normas generales de convivencia laboral, horarios, obligaciones y derechos de los colaboradores.',
      articles: [
        { title: 'Art. 1 - Objeto', content: 'El presente reglamento tiene por objeto establecer las disposiciones aplicables a las relaciones de trabajo entre la empresa y sus colaboradores.' },
        { title: 'Art. 2 - Jornada Laboral', content: 'La jornada laboral ordinaria será de lunes a viernes de 8:00 a 17:00 horas, con una hora de descanso para alimentos.' },
        { title: 'Art. 3 - Puntualidad', content: 'Todo colaborador deberá registrarse al inicio y fin de su jornada. Se permitirán hasta 3 retardos de 10 minutos por mes.' },
        { title: 'Art. 4 - Código de Vestimenta', content: 'Se establece vestimenta business casual de lunes a jueves y casual los viernes.' },
        { title: 'Art. 5 - Uso de Recursos', content: 'Los recursos tecnológicos proporcionados por la empresa son para uso profesional.' },
      ],
      confirmed: true,
    },
    {
      id: 'POL002', title: 'Código de Ética y Conducta', category: 'Ética',
      content: 'Define los valores, principios y lineamientos de conducta esperados de todos los colaboradores.',
      articles: [
        { title: 'Art. 1 - Valores Corporativos', content: 'Integridad, Respeto, Innovación, Colaboración y Responsabilidad son los valores fundamentales.' },
        { title: 'Art. 2 - Confidencialidad', content: 'Toda información interna, datos de clientes y secretos industriales son confidenciales.' },
        { title: 'Art. 3 - Conflicto de Interés', content: 'Los colaboradores deben evitar situaciones que generen conflicto de intereses.' },
        { title: 'Art. 4 - Anti-corrupción', content: 'Queda estrictamente prohibido ofrecer o recibir sobornos o pagos indebidos.' },
      ],
      confirmed: true,
    },
    {
      id: 'POL003', title: 'Política de Permisos y Vacaciones', category: 'Prestaciones',
      content: 'Establece los lineamientos para la solicitud y aprobación de permisos, vacaciones y licencias.',
      articles: [
        { title: 'Art. 1 - Días de Vacaciones', content: 'Todo colaborador tiene derecho a 15 días hábiles de vacaciones al primer año.' },
        { title: 'Art. 2 - Solicitud de Vacaciones', content: 'Las vacaciones deben solicitarse con mínimo 15 días de anticipación.' },
        { title: 'Art. 3 - Permisos Personales', content: 'Se otorgan hasta 3 días de permiso personal remunerado al año.' },
        { title: 'Art. 4 - Permisos Médicos', content: 'Los permisos médicos requieren justificante oficial. La empresa cubre el 100% del salario.' },
      ],
      confirmed: false,
    },
  ],
  trainings: [
    { id: 'TR001', employeeId: 'EMP001', course: 'Liderazgo y Gestión de Equipos', provider: 'LinkedIn Learning', date: '2026-04-15', hours: 12, status: 'Completado' },
    { id: 'TR002', employeeId: 'EMP001', course: 'Arquitectura de Microservicios', provider: 'Udemy', date: '2026-02-20', hours: 24, status: 'Completado' },
    { id: 'TR003', employeeId: 'EMP001', course: 'Scrum Advanced Certification', provider: 'Scrum.org', date: '2025-11-10', hours: 16, status: 'Completado' },
    { id: 'TR004', employeeId: 'EMP001', course: 'Inteligencia Artificial Aplicada', provider: 'Coursera', date: '2026-07-01', hours: 30, status: 'En Progreso' },
    { id: 'TR005', employeeId: 'EMP002', course: 'Derecho Laboral Avanzado', provider: 'ITCA', date: '2026-03-10', hours: 20, status: 'Completado' },
    { id: 'TR006', employeeId: 'EMP003', course: 'Power BI Dashboard Pro', provider: 'Microsoft Learn', date: '2026-05-05', hours: 15, status: 'Completado' },
    { id: 'TR007', employeeId: 'EMP005', course: 'Kubernetes Advanced', provider: 'Linux Foundation', date: '2026-08-15', hours: 40, status: 'Pendiente' },
    { id: 'TR008', employeeId: 'EMP008', course: 'Onboarding Corporativo', provider: 'RRHH Interno', date: '2026-06-01', hours: 8, status: 'Completado' },
  ],
  evaluations: [
    { id: 'EVAL001', employeeId: 'EMP001', employeeName: 'Carlos Alfredo Castillo Flores', evaluator: 'María González López', type: 'Desempeño', period: 'Q1-2026', date: '2026-04-01', score: 92, strengths: ['Liderazgo técnico', 'Resolución de problemas', 'Comunicación'], improvements: ['Delegación de tareas', 'Gestión del tiempo'], goals: ['Implementar nuevo sistema de CI/CD', 'Mentorizar a 2 desarrolladores junior'], status: 'Completada', comments: 'Excelente desempeño durante el trimestre.' },
    { id: 'EVAL002', employeeId: 'EMP002', employeeName: 'María González López', evaluator: 'Dirección General', type: '360°', period: 'Q1-2026', date: '2026-04-05', score: 88, strengths: ['Gestión de personal', 'Empatía', 'Organización'], improvements: ['Automatización de procesos'], goals: ['Implementar nuevo sistema de evaluación'], status: 'Completada', comments: 'Muy buen desempeño integral.' },
    { id: 'EVAL003', employeeId: 'EMP003', employeeName: 'Roberto Hernández Díaz', evaluator: 'José Eduardo Portillo', type: 'Objetivos', period: 'Q2-2026', date: '2026-07-01', score: 0, strengths: [], improvements: [], goals: ['Completar certificación CFA Level 2'], status: 'En Proceso', comments: '' },
    { id: 'EVAL004', employeeId: 'EMP005', employeeName: 'Fernando Morales Sánchez', evaluator: 'Carlos Alfredo Castillo Flores', type: 'Competencias', period: 'Q2-2026', date: '2026-07-15', score: 0, strengths: [], improvements: [], goals: ['Migrar infraestructura a Kubernetes'], status: 'Programada', comments: '' },
  ],
  notifications: [
    { id: 'N001', title: 'Nueva solicitud pendiente', message: 'María González López ha solicitado un permiso personal.', type: 'warning', date: '2026-06-15', read: false, module: 'Solicitudes' },
    { id: 'N002', title: 'Candidato en entrevista', message: 'Laura Martínez Ruiz pasó a etapa de entrevista.', type: 'info', date: '2026-06-14', read: false, module: 'Reclutamiento' },
    { id: 'N003', title: 'Capacitación completada', message: 'Roberto Hernández completó Power BI Dashboard Pro.', type: 'success', date: '2026-06-10', read: true, module: 'Expediente' },
    { id: 'N004', title: 'Política por confirmar', message: 'Tienes una política pendiente de lectura y conformidad.', type: 'warning', date: '2026-06-05', read: false, module: 'Políticas' },
  ],
  events: [
    { id: 'EV001', title: 'Cumpleaños - María González', date: '2026-07-15', type: 'cumpleanos', description: 'Celebración de cumpleaños' },
    { id: 'EV002', title: 'Aniversario - Carlos Castillo', date: '2026-03-15', type: 'aniversario', description: '4 años en la empresa' },
    { id: 'EV003', title: 'Capacitación - IA Aplicada', date: '2026-07-01', type: 'capacitacion', description: 'Inicio curso IA para Carlos Castillo' },
    { id: 'EV004', title: 'Reunión de Evaluación Q2', date: '2026-07-15', type: 'reunion', description: 'Evaluación de Fernando Morales' },
  ],
};

function App() {
  const [state, setState] = useState<AppState>(initialData);
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);

  const addNotification = (n: Omit<Notification, 'id' | 'date' | 'read'>) => {
    const newNotif: Notification = {
      ...n,
      id: `N${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      read: false,
    };
    setState(prev => ({ ...prev, notifications: [newNotif, ...prev.notifications] }));
  };

  const unreadCount = state.notifications.filter(n => !n.read).length;

  const modules = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt' },
    { id: 'profile', label: 'Expediente Digital', icon: 'fa-user-circle' },
    { id: 'requests', label: 'Solicitudes', icon: 'fa-file-alt' },
    { id: 'recruitment', label: 'Reclutamiento', icon: 'fa-users' },
    { id: 'evaluations', label: 'Evaluaciones', icon: 'fa-star-half-alt' },
    { id: 'reports', label: 'Reportes', icon: 'fa-chart-bar' },
    { id: 'policies', label: 'Políticas', icon: 'fa-book' },
    { id: 'admin', label: 'Administración', icon: 'fa-cogs' },
    { id: 'help', label: 'Ayuda', icon: 'fa-question-circle' },
  ];

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard': return <Dashboard />;
      case 'profile': return <EmployeeProfile />;
      case 'requests': return <Requests />;
      case 'recruitment': return <Recruitment />;
      case 'evaluations': return <Evaluations />;
      case 'reports': return <Reports />;
      case 'policies': return <Policies />;
      case 'admin': return <AdminPanel />;
      case 'help': return <Help />;
      default: return <Dashboard />;
    }
  };

  return (
    <AppContext.Provider value={{ state, setState, addNotification }}>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm">
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-md">
                <i className="fas fa-trophy text-white text-lg"></i>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">Talent360</h1>
                <p className="text-xs text-slate-500">{state.companyData.name}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {modules.map((mod) => (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod.id)}
                className={`sidebar-item w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium ${
                  activeModule === mod.id
                    ? 'active'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-blue-700'
                }`}
              >
                <i className={`fas ${mod.icon} w-5 text-center`}></i>
                <span>{mod.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white font-semibold text-sm">CC</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">Carlos Castillo</p>
                <p className="text-xs text-slate-500">Administrador</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-slate-800">
                {modules.find(m => m.id === activeModule)?.label}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="powered-animation text-sm font-semibold text-blue-600">
                ⚡ Powered by ITCPO
              </span>
              <div className="w-px h-8 bg-slate-200"></div>
              {/* Notifications */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <i className="fas fa-bell text-lg"></i>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <div className="w-px h-8 bg-slate-200"></div>
              <span className="text-xs text-slate-400">v3.0.26</span>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {renderModule()}
          </main>

          {/* Footer */}
          <footer className="h-10 bg-white border-t border-slate-100 flex items-center justify-between px-6">
            <span className="text-xs text-slate-400">
              © 2026 Carlos Alfredo Castillo Flores - ITCPO - Todos los derechos reservados
            </span>
            <span className="text-xs text-slate-400">Talent360 Hub v3.0</span>
          </footer>
        </div>
      </div>

      {/* Notification Center */}
      {showNotifications && (
        <NotificationCenter onClose={() => setShowNotifications(false)} />
      )}
    </AppContext.Provider>
  );
}

export default App;
