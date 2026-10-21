// Everything the page says, in one place.

export const contact = {
  email: 'renzohpg@gmail.com',
  github: 'https://github.com/BladeHoly',
  linkedin: 'https://www.linkedin.com/in/renzo-pandolfo-genoud-a062283a0',
};

export interface Job {
  company: string;
  /** Leave empty until it's confirmed; the page then shows only the company. */
  role: string;
  start: string;
  end?: string;
  summary: string;
}

export const jobs: Job[] = [
  {
    company: 'Mozart Fintech',
    role: 'AI Engineer',
    start: 'octubre de 2025',
    summary:
      'Construyo agentes de voz con LiveKit sobre telefonía SIP, con detección de turnos y de contestadores; funciones con los modelos de OpenAI y Anthropic, con RAG, tool calling y MCP; y la infraestructura en AWS que los sostiene, de Lambda y ECS a EKS, con SST, OpenTofu y Pulumi. Del front en Next.js al deploy, un poco de todo.',
  },
];

export interface Project {
  name: string;
  what: string;
  stack: string[];
  /** Public repository; private projects have none. */
  url?: string;
  status: 'público' | 'privado' | 'pronto público';
}

export const projects: Project[] = [
  {
    name: 'glass-midas',
    what: 'Un sistema de estilos de vidrio líquido para la web. Refracta lo que hay detrás con óptica real, en SVG o WebGL, y se adapta a lo que cada navegador puede dibujar. Este sitio está hecho con él.',
    stack: ['TypeScript', 'WebGL', 'SVG', 'Astro'],
    url: 'https://github.com/BladeHoly/glass-midas',
    status: 'público',
  },
  {
    name: 'qpck-tools',
    what: 'Desempaqueta y reempaqueta los contenedores .qpck de God Eater Resurrection para poder moddear el juego. Una librería con el formato y una herramienta de línea de comandos.',
    stack: ['Rust'],
    status: 'pronto público',
  },
  {
    name: 'Migrador IMAP a Gmail',
    what: 'Copia el correo de un servidor IMAP a Gmail sin tocar nunca el origen. Si se corta a la mitad, retoma desde donde quedó sin duplicar mensajes.',
    stack: ['Node.js', 'React', 'Gmail API'],
    status: 'pronto público',
  },
  {
    name: 'Juampi Deals',
    what: 'Un comparador de ofertas de videojuegos para Argentina y Uruguay: busca un juego y ves cuánto cuesta en cada tienda.',
    stack: ['TypeScript', 'React', 'Cloudflare Workers', 'D1'],
    status: 'privado',
  },
  {
    name: 'Calculadora de interés compuesto',
    what: 'Calcula cuánto crece una inversión con aportes periódicos e interés compuesto.',
    stack: ['HTML', 'CSS', 'JavaScript'],
    url: 'https://github.com/BladeHoly/Calculadora-Interes-Compuesto',
    status: 'público',
  },
];

export const stack = [
  { area: 'Lenguajes', items: ['TypeScript', 'JavaScript', 'Python', 'Rust', 'HTML', 'CSS'] },
  {
    area: 'IA y voz',
    items: [
      'Modelos de OpenAI y Anthropic',
      'RAG y embeddings',
      'MCP y tool calling',
      'LiveKit Agents',
      'WebRTC',
      'SIP y Twilio',
      'Deepgram',
      'ElevenLabs',
      'Detección de turnos y de contestadores',
    ],
  },
  {
    area: 'Frontend',
    items: ['Next.js', 'React', 'Astro', 'Tailwind', 'shadcn/ui', 'Radix', 'TanStack', 'WebGL'],
  },
  {
    area: 'Backend',
    items: [
      'Node.js',
      'Bun',
      'ElysiaJS y Eden',
      'Fastify',
      'FastAPI',
      'Zod',
      'Drizzle',
      'Prisma',
      'ElectroDB',
      'PostgreSQL (Aurora)',
      'DynamoDB',
      'Cloudflare Workers',
    ],
  },
  {
    area: 'AWS',
    items: [
      'Lambda',
      'API Gateway',
      'EC2',
      'ECS y Fargate',
      'EKS',
      'S3',
      'CloudFront',
      'Route 53',
      'SQS',
      'SNS',
      'EventBridge',
      'Step Functions',
      'Cognito',
      'Bedrock',
      'Amplify',
      'IAM',
      'KMS',
      'Secrets Manager',
      'SSM',
      'CloudWatch',
    ],
  },
  {
    area: 'Infraestructura',
    items: [
      'Docker y Docker Compose',
      'SST',
      'OpenTofu',
      'Pulumi',
      'AWS CDK',
      'GitHub Actions',
      'Cloudflare',
      'Vercel',
      'Grafana',
    ],
  },
  { area: 'Testing', items: ['Vitest', 'Jest', 'Pytest', 'Playwright'] },
  { area: 'Herramientas', items: ['Git', 'GitHub', 'pnpm'] },
];
