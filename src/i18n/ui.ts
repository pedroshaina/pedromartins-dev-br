import type { Locale } from './locales';

export type UiStrings = {
  nav: {
    blog: string;
    /** aria-label of the language switch */
    language: string;
  };
  home: {
    description: string;
    /** One string per paragraph. */
    intro: string[];
    stackLabel: string;
    projectsLabel: string;
    allPosts: string;
    scrollHint: string;
  };
  project: {
    github: string;
    website: string;
    readOnBlog: string;
  };
  blog: {
    description: string;
    projectDescription: (project: string) => string;
  };
  post: {
    partOf: (n: number, m: number, project: string) => string;
    /** A post's place in its project's list. */
    part: (n: number) => string;
    minRead: string;
    previous: string;
    next: string;
  };
  rss: {
    title: string;
  };
  notFound: {
    title: string;
    body: string;
    home: string;
  };
};

export const ui: Record<Locale, UiStrings> = {
  en: {
    nav: { blog: 'Blog', language: 'Language' },
    home: {
      description: 'Pedro Shainã Martins, senior software engineer: projects and writing.',
      // TODO(Pedro): the real intro sentence.
      intro: [
        'Senior software engineer, 12+ years across different industries',
        'Experienced in different languages and technologies, I build systems end-to-end that keep working when things go wrong.',
        'Bitcoin enthusiast & Coffee drinker'
      ],
      stackLabel: 'Stack',
      projectsLabel: 'Projects',
      allPosts: 'All posts',
      scrollHint: 'Scroll',
    },
    project: {
      github: 'GitHub ↗',
      website: 'Website ↗',
      readOnBlog: 'Read about it on the blog',
    },
    blog: {
      description: 'Posts by Pedro Shainã Martins on the projects he builds.',
      projectDescription: (project) => `Posts about ${project}, oldest first.`,
    },
    post: {
      partOf: (n, m, project) => `Part ${n} of ${m} on ${project}`,
      part: (n) => `Part ${n}`,
      minRead: 'min',
      previous: 'Previous',
      next: 'Next',
    },
    rss: { title: 'Pedro Shainã Martins · Blog' },
    notFound: {
      title: 'Page not found',
      body: 'There is nothing at this address.',
      home: 'Back to the home page',
    },
  },
  'pt-br': {
    nav: { blog: 'Blog', language: 'Idioma' },
    home: {
      description: 'Pedro Shainã Martins, engenheiro de software sênior: projetos e blog.',
      // TODO(Pedro): a frase de apresentação de verdade.
      intro: [
        'Engenheiro de software sênior com mais de 12 anos de experiência em diferentes indústrias',
        'Atuando em várias linguagens diferentes, eu construo soluções completas que continuam funcionando quando algo dá errado.',
        'Entusiasta em Bitcoin e apreciador de Café.'
      ],
      stackLabel: 'Tecnologias',
      projectsLabel: 'Projetos',
      allPosts: 'Todos os posts',
      scrollHint: 'Role para baixo',
    },
    project: {
      github: 'GitHub ↗',
      website: 'Site ↗',
      readOnBlog: 'Leia sobre no blog',
    },
    blog: {
      description: 'Textos de Pedro Shainã Martins sobre os projetos que ele constrói.',
      projectDescription: (project) => `Posts sobre ${project}, do mais antigo ao mais recente.`,
    },
    post: {
      partOf: (n, m, project) => `Parte ${n} de ${m} sobre ${project}`,
      part: (n) => `Parte ${n}`,
      minRead: 'min',
      previous: 'Anterior',
      next: 'Próximo',
    },
    rss: { title: 'Pedro Shainã Martins · Blog (português)' },
    notFound: {
      title: 'Página não encontrada',
      body: 'Não há nada neste endereço.',
      home: 'Voltar para a página inicial',
    },
  },
};

export function t(locale: Locale): UiStrings {
  return ui[locale];
}
