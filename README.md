# pedromartins.dev.br

My personal site, live at [pedromartins.dev.br](https://pedromartins.dev.br): a portfolio and blog
in English and Brazilian Portuguese.

Built with [Astro](https://astro.build). I chose Astro because it's made for content-first static
sites: pages ship as plain HTML with no JavaScript unless they need it, so they load fast, and good
SEO comes by default. nginx serves the result from a container on my
[Kubernetes homelab](https://github.com/pedroshaina/k8s-homelab).

## Stack

Astro, TypeScript, plain CSS with custom properties, Shiki for code highlighting, nginx
(unprivileged image, read-only root filesystem), GitHub Actions, Argo CD.

## Project layout

```
src/
  pages/[...locale]/   one route per page; builds every language (English at /, others under /<locale>/)
  components/          page bodies and their pieces, grouped by area: home, blog, layout, common
  layouts/             BaseLayout: <head>, SEO tags, top bar and footer
  content/             posts and projects (Markdown and YAML)
  i18n/                the language list and every UI string
  config/              site details and the home page's stack list
  lib/                 content queries, build-time checks, RSS
  styles/              design tokens, global styles, post typography, code theme
nginx.conf             server config: security headers, caching, per-language 404s, health checks
```

Route files only list the pages to build. Each one renders a component from `components/`, so the
same component serves every language.

### Adding content

- **A post:** `src/content/posts/<slug>/en.md` and `pt-br.md`, both required. Set `draft: true` to
  hide it from production builds; `pnpm dev` still shows drafts.
- **A project:** `src/content/projects/<slug>.yaml`, with a title and summary per language.
- **A language:** add it to `locales` in `src/i18n/locales.ts`, then translate. Type-checking fails
  until every UI string, stack label and project has the new language.

The build fails if a published post is missing a translation, names a project that doesn't exist,
or has an image without alt text.

## Develop

Requires Node 24 and pnpm (`corepack enable` picks up the version pinned in `package.json`).

```bash
pnpm install
pnpm dev       # http://localhost:4321
pnpm check     # types and content schemas
pnpm build     # static site in dist/
pnpm preview   # serve dist/
```

## Deployment

Pull requests run type checks, the build, an offline link check and the image build. A merge to
`master` pushes the image to GHCR and pins its digest in my GitOps repository, and Argo CD rolls it
out on the cluster.

## License

The code is under the [MIT License](LICENSE).
