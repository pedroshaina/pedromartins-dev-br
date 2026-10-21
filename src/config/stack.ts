import type { Locale } from '../i18n/locales';

export type StackCategory = {
  label: Record<Locale, string>;
  items: string[];
};

// The home page's Stack screen. Technology names are the same in every language.
export const stack: StackCategory[] = [
  { label: { en: 'Languages', 'pt-br': 'Linguagens' }, items: ['TypeScript', 'Java', 'SQL'] },
  {
    label: { en: 'Backend frameworks', 'pt-br': 'Frameworks de backend' },
    items: ['Node.js (Fastify, Express)', 'Spring Boot'],
  },
  { label: { en: 'Frontend', 'pt-br': 'Frontend' }, items: ['React', 'Next.js'] },
  { label: { en: 'Database', 'pt-br': 'Banco de dados' }, items: ['PostgreSQL', 'MySQL'] },
  {
    label: { en: 'Queues & events', 'pt-br': 'Filas e eventos' },
    items: ['RabbitMQ', 'Apache Kafka', 'AWS SNS + SQS', 'GCP Cloud Pub/Sub'],
  },
  { label: { en: 'Cloud providers', 'pt-br': 'Provedores de nuvem' }, items: ['AWS', 'GCP'] },
  {
    label: { en: 'Infrastructure & platform', 'pt-br': 'Infraestrutura e plataforma' },
    items: ['Kubernetes (Talos Linux)', 'Docker', 'Argo CD', 'OpenTofu/Terraform'],
  },
  {
    label: { en: 'Observability', 'pt-br': 'Observabilidade' },
    items: ['Prometheus', 'Grafana', 'Loki', 'Alloy', 'Pino', 'Splunk'],
  },
  {
    label: { en: 'Testing', 'pt-br': 'Testes' },
    items: ['Vitest', 'Jest', 'Playwright', 'Testcontainers', 'JUnit', 'Spock', 'Spring Boot Test'],
  },
];
