import type { Locale } from './locales';

export type UiStrings = {
  nav: {
    projects: string;
    blog: string;
    /** aria-label of the language switch */
    language: string;
  };
  home: {
    description: string;
    intro: string;
    projectsLabel: string;
    blogLabel: string;
    allPosts: string;
    scrollHint: string;
  };
  project: {
    github: string;
    website: string;
    readOnBlog: string;
  };
  post: {
    partOf: (n: number, m: number, project: string) => string;
    minRead: string;
    previous: string;
    next: string;
  };
  notFound: {
    title: string;
    body: string;
  };
};

export const ui: Record<Locale, UiStrings> = {
  en: {
    nav: { projects: 'Projects', blog: 'Blog', language: 'Language' },
    home: {
      description: 'Pedro Martins, senior software engineer: projects and writing.',
      // TODO(Pedro): the real intro sentence.
      intro:
        'Senior software engineer, 12+ years across industries. I build backend systems that keep working when things go wrong.',
      projectsLabel: 'Projects',
      blogLabel: 'Blog',
      allPosts: 'All posts',
      scrollHint: 'Scroll ↓',
    },
    project: {
      github: 'GitHub ↗',
      website: 'Website ↗',
      readOnBlog: 'Read about it on the blog →',
    },
    post: {
      partOf: (n, m, project) => `Part ${n} of ${m} on ${project}`,
      minRead: 'min',
      previous: 'Previous',
      next: 'Next',
    },
    notFound: {
      title: 'Page not found',
      body: 'There is nothing at this address.',
    },
  },
  'pt-br': {
    nav: { projects: 'Projetos', blog: 'Blog', language: 'Idioma' },
    home: {
      description: 'Pedro Martins, engenheiro de software sênior: projetos e textos.',
      // TODO(Pedro): a frase de apresentação de verdade.
      intro:
        'Engenheiro de software sênior com mais de 12 anos de experiência em diferentes indústrias. Meu foco é construir sistemas de backend e soluções que não param quando algo dá errado.',
      projectsLabel: 'Projetos',
      blogLabel: 'Blog',
      allPosts: 'Todos os posts',
      scrollHint: 'Role ↓',
    },
    project: {
      github: 'GitHub ↗',
      website: 'Site ↗',
      readOnBlog: 'Leia sobre no blog →',
    },
    post: {
      partOf: (n, m, project) => `Parte ${n} de ${m} sobre ${project}`,
      minRead: 'min',
      previous: 'Anterior',
      next: 'Próximo',
    },
    notFound: {
      title: 'Página não encontrada',
      body: 'Não há nada neste endereço.',
    },
  },
};

export function t(locale: Locale): UiStrings {
  return ui[locale];
}
