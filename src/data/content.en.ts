// The English version of everything the page says: the same shape as content.ts, translated.
import type { Job, Project } from './content';

export { contact } from './content';

export const person = {
  name: 'Renzo',
  intro:
    "Developer in Paysandú, Uruguay. I work at Mozart Fintech, and in my spare time I build tools: from taking apart a video game's files to glass that refracts in the browser.",
  description:
    'Renzo, developer in Paysandú, Uruguay. Projects in TypeScript and Rust, and glass-midas, liquid glass for the web.',
};

export const jobs: Job[] = [
  {
    company: 'Mozart Fintech',
    role: 'AI Engineer',
    start: 'October 2025',
    summary:
      'I build voice agents with LiveKit over SIP telephony, with turn and answering-machine detection; features on OpenAI and Anthropic models, with RAG, tool calling and MCP; and the AWS infrastructure behind them, from Lambda and ECS to EKS, with SST, OpenTofu and Pulumi. From the Next.js front end to the deploy, a bit of everything.',
  },
];

export const projects: Project[] = [
  {
    name: 'glass-midas',
    what: "A liquid glass style system for the web. It refracts what's behind it with real optics, in SVG or WebGL, and adapts to what each browser can draw. This site is built with it.",
    stack: ['TypeScript', 'WebGL', 'SVG', 'Astro'],
    url: 'https://github.com/BladeHoly/glass-midas',
    site: 'https://bladeholy.github.io/glass-midas/',
    status: 'público',
  },
  {
    name: 'qpck-tools',
    what: "Unpacks and repacks God Eater Resurrection's .qpck containers so the game can be modded. A library for the format and a command-line tool.",
    stack: ['Rust'],
    status: 'pronto público',
  },
  {
    name: 'IMAP to Gmail migrator',
    what: 'Copies mail from an IMAP server to Gmail without ever touching the source. If it stops halfway, it picks up where it left off without duplicating messages.',
    stack: ['Node.js', 'React', 'Gmail API'],
    status: 'pronto público',
  },
  {
    name: 'Juampi Deals',
    what: 'A video game deal finder for Argentina and Uruguay: search for a game and see what it costs in each store.',
    stack: ['TypeScript', 'React', 'Cloudflare Workers', 'D1'],
    status: 'privado',
  },
  {
    name: 'Compound interest calculator',
    what: 'Works out how an investment grows with regular contributions and compound interest.',
    stack: ['HTML', 'CSS', 'JavaScript'],
    url: 'https://github.com/BladeHoly/Calculadora-Interes-Compuesto',
    status: 'público',
  },
];

export const stack = [
  {
    area: 'Languages',
    items: ['TypeScript', 'JavaScript', 'Python', 'Rust', 'Go', 'C++', 'C#', 'HTML', 'CSS'],
  },
  {
    area: 'AI and voice',
    items: [
      'OpenAI and Anthropic models',
      'RAG and embeddings',
      'MCP and tool calling',
      'LiveKit Agents',
      'WebRTC',
      'SIP and Twilio',
      'Deepgram',
      'ElevenLabs',
      'Turn and answering-machine detection',
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
      'ElysiaJS and Eden',
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
      'ECS and Fargate',
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
    area: 'Infrastructure',
    items: [
      'Docker and Docker Compose',
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
  { area: 'Tools', items: ['Git', 'GitHub', 'pnpm', 'mise'] },
];

export const statusLabel: Record<Project['status'], { text: string; tone?: 'success' | 'info' }> = {
  público: { text: 'Open source', tone: 'success' },
  'pronto público': { text: 'Open source soon', tone: 'info' },
  privado: { text: 'Private code' },
};
