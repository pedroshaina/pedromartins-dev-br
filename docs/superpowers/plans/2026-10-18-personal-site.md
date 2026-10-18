# pedromartins.dev.br Personal Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A bilingual (EN / PT-BR) static portfolio and blog, built with Astro, served by nginx, deployed to Pedro's homelab through GitOps at `portfolio.pdrlabs.com.br`.

**Architecture:** Astro builds plain HTML from Markdown/YAML content in the repo. A multi-stage Docker image copies the build into `nginx-unprivileged`. The template's release workflow pushes the image to GHCR and pins it by digest in `homelab-apps-gitops`; Argo CD deploys. No JS framework, no backend.

**Tech Stack:** Astro (latest stable), TypeScript, plain CSS with custom properties, Fontsource (Oxanium, IBM Plex Sans, IBM Plex Mono), Shiki (Astro built-in), `@astrojs/rss`, `@astrojs/sitemap`, nginx-unprivileged, GitHub Actions, lychee (link check), Kustomize / Argo CD.

**Spec:** `docs/superpowers/specs/2026-10-18-personal-site-design.md` (read it first; the reference mockup is `docs/superpowers/specs/2026-10-18-personal-site-mockup.html`).

## Global Constraints

- Node 24, pnpm (pinned via `packageManager`), latest stable Astro; record exact versions in `package.json`.
- Plain CSS only: one `src/styles/tokens.css` with the palette and fonts as custom properties, plus Astro scoped `<style>`. No Tailwind, no UI framework, no client-side JS unless a task says so.
- Tokens (spec §4.2): background `#060b1d` (solid, no gradients), magenta `#ff2a6d`, cyan `#05d9e8`, body `#9aa1ba`, emphasis `#e8eaf3`, headings `#ffffff`, dim `#565d7a`, code block `#0a1128`.
- Fonts: Oxanium 500/600 (headings, name, top bar), IBM Plex Sans 400/500 (body), IBM Plex Mono 400 (labels, dates, code, `font-variant-ligatures: none`). Self-hosted through Fontsource; no request to any third-party origin.
- Locales: `en` at `/`, `pt-br` at `/pt-br/`. Same slug in both languages. Every published post and project exists in both, or the build fails.
- Copy, fixed by Pedro: top bar = `PM` · `Projects` · `Blog` · `EN | PT`; project links `GitHub ↗` and `Website ↗` next to the title; project CTA `Read about it on the blog →`; personal links under the intro = `GitHub` · `LinkedIn` · `Email` only.
- No tags, stats, badges, or boxes on the home page (anti-goal: clutter).
- Container contract (homelab): HTTP on 8080, `GET /health` and `GET /ready` → 200, JSON-line access logs on stdout, UID 101 non-root, read-only root filesystem with `/tmp` as `emptyDir`, `linux/amd64`.
- App name `portfolio`; GitHub repo `pedroshaina/pedromartins-dev-br`, **private**; release branch `master` (the template's).
- No commit trailers or any Claude attribution in commits, PRs or files.
- Anything that touches GitHub or the homelab repos (creating the repo, setting secrets, opening/merging PRs in `homelab-apps-gitops`, `homelab-platform-gitops`, `homelab`, applying OpenTofu) is confirmed with Pedro before it's done. Pedro merges homelab PRs.
- **Stop at the end of each phase**, summarise what was built, wait for Pedro's go-ahead. Bring any library or structural decision not settled here to Pedro with options and a recommendation.

## Review Focus

1. **Trailing-slash redirects behind the Gateway:** `/blog` must redirect to `/blog/` on the public hostname, never to `http://…:8080/blog/` (nginx `absolute_redirect off`). Verified in Task 3 and again live in Task 5.
2. **Drafts leaking:** a draft must not appear on the home page, blog index, project filter, RSS, sitemap, or in "Part N of M" counts in a production build. Verified in Task 7 and Task 10.
3. **Project link edge cases:** a project with 0 published posts shows no blog link; with 1, the link goes straight to the post; with 2+, to `/blog/project/<slug>/`. Verified in Task 8.
4. **Portuguese text:** accents (ç, ã, õ, é, ê) render in all three fonts, with no fallback-font glyphs, and dates are formatted per locale (`21 de set. de 2026` vs `Sep 21, 2026`). Verified in Task 6 and Task 9.
5. **Language switch on every page type:** home, blog index, project filter, post, and 404 all switch to the same page in the other language, with no 404 caused by the switch. Verified in Task 9.

---

## Phase 1: Skeleton and pipeline (ends deployed LAN-only)

### Task 1: Repository and Astro scaffold

**Files:**
- Create: `package.json`, `pnpm-lock.yaml`, `astro.config.mjs`, `tsconfig.json`, `.nvmrc`, `src/pages/index.astro`, `README.md` (replace the template's)
- Modify: `.gitignore` (add `node_modules/`, `dist/`, `.astro/`, `.superpowers/`, `.playwright-mcp/`)
- Delete: the template's `main.go`, `main_test.go`, `go.mod`

**Interfaces:**
- Produces: `pnpm build` → static site in `dist/`; `pnpm check` → `astro check`.

- [ ] **Step 1:** Confirm with Pedro, then create the private repo from the template: `gh repo create pedroshaina/pedromartins-dev-br --private --template pedroshaina/homelab-apps-ci-cd-template`.
- [ ] **Step 2:** In this folder (which already holds `docs/`): `git init`, add the remote, fetch, `git checkout master`. Existing untracked `docs/` and `.superpowers/` must survive; confirm with `git status`.
- [ ] **Step 3:** Scaffold Astro with the minimal template and TypeScript `strict`, using pnpm. In `astro.config.mjs` set `site` from `process.env.SITE_URL ?? 'https://portfolio.pdrlabs.com.br'`, `output: 'static'`, `build.format: 'directory'`, `trailingSlash: 'always'`.
- [ ] **Step 4:** Add scripts `dev`, `build`, `preview`, `check` (`astro check`). Remove the Go files.
- [ ] **Step 5:** Run `pnpm check && pnpm build`. Expected: 0 errors, `dist/index.html` exists.
- [ ] **Step 6:** Commit: `chore: scaffold Astro site from homelab app template`.

### Task 2: Tokens, fonts, and base layout

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/global.css`, `src/layouts/BaseLayout.astro`, `src/components/TopBar.astro`, `src/components/Footer.astro`, `src/config/site.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Produces: `BaseLayout` props `{ title: string; description: string }` with a default slot. `site` from `src/config/site.ts`: `{ name: 'Pedro Martins'; initials: 'PM'; links: { github: 'https://github.com/pedroshaina'; linkedin: string; email: string } }`. LinkedIn and email are placeholders, each marked `// TODO(Pedro)`.

- [ ] **Step 1:** Install `@fontsource/oxanium`, `@fontsource/ibm-plex-sans`, `@fontsource/ibm-plex-mono`. Import only the weights listed in Global Constraints (`@fontsource/oxanium/500.css`, …) from `global.css`.
- [ ] **Step 2:** Write `tokens.css` with the Global Constraints values as `--color-*` and `--font-heading`, `--font-body`, `--font-mono` custom properties. In `global.css`: body background `var(--color-bg)`, body font, base size 16px, line-height 1.7, `color-scheme: dark`.
- [ ] **Step 3:** `TopBar`: `PM` → `/`; `Projects` → `/#projects`; `Blog` → `/blog/`; the language switch is a static `EN | PT` placeholder until Task 6. Mono/Oxanium styling per the mockup: letter-spaced, dim inactive items, emphasis on nav links. `Footer`: `© <year> Pedro Martins` · GitHub · LinkedIn · Email from `site.links`.
- [ ] **Step 4:** `index.astro` uses `BaseLayout` with a centred name and intro placeholder, enough to see the fonts and colours.
- [ ] **Step 5:** `pnpm build`, then `pnpm preview` and open it. Expected: night blue page, Oxanium name, Plex body text. DevTools Network shows fonts served from `/_astro/` only, with no other origins.
- [ ] **Step 6:** Commit: `feat: design tokens, self-hosted fonts and base layout`.

### Task 3: nginx container

**Files:**
- Create: `Dockerfile`, `nginx/nginx.conf`, `.dockerignore`

**Interfaces:**
- Produces: image `portfolio` listening on 8080 that satisfies the container contract.

- [ ] **Step 1:** `Dockerfile`, two stages. Build: `node:24-alpine` pinned by digest, corepack pnpm, `pnpm install --frozen-lockfile`, `pnpm build`. Runtime: `nginxinc/nginx-unprivileged:<stable>-alpine` pinned by digest, copy `dist/` to `/usr/share/nginx/html` and `nginx/nginx.conf` to `/etc/nginx/nginx.conf`. Bypass the image's entrypoint scripts, which write to `/etc/nginx` and fail on a read-only filesystem: `ENTRYPOINT []`, `CMD ["nginx", "-g", "daemon off;"]`. Keep `USER 101`.
- [ ] **Step 2:** `nginx.conf` must contain:
  - `pid /tmp/nginx.pid;` and every `*_temp_path` under `/tmp`;
  - `log_format json escape=json '{…}'` with time, remote_addr, method, uri, status, bytes, request_time and user_agent, `access_log /dev/stdout json;`, `error_log /dev/stderr warn;`;
  - `listen 8080;`, `absolute_redirect off;`, `server_tokens off;`;
  - `location = /health` and `location = /ready`: `access_log off; return 200 "ok\n";`;
  - `location /_astro/`: `Cache-Control: public, max-age=31536000, immutable`;
  - default `location /`: `try_files $uri $uri/index.html =404;`, `Cache-Control: no-cache`;
  - `error_page 404 /404.html;` at the server level and `error_page 404 /pt-br/404.html;` inside `location /pt-br/`;
  - headers on every response (`always`): `Content-Security-Policy "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; script-src 'self'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'"`, `X-Content-Type-Options nosniff`, `Referrer-Policy strict-origin-when-cross-origin`;
  - `gzip on` for text types.
- [ ] **Step 3:** Build and run it the way the cluster will: `docker build -t portfolio . && docker run --rm -p 8080:8080 --read-only --tmpfs /tmp --user 101 portfolio`.
- [ ] **Step 4:** Verify by hand with curl:
  - `/health` and `/ready` return 200;
  - `/` returns 200 with the CSP header and `Cache-Control: no-cache`;
  - an `/_astro/*.css` file returns `immutable`;
  - `/nope/` returns 404;
  - `curl -sI localhost:8080/blog` (once `/blog/` exists; until then use any directory) returns a `Location` header that is a relative path, with no host or port (Review Focus 1);
  - container logs are JSON lines;
  - `docker stop` exits cleanly within a few seconds.
- [ ] **Step 5:** Commit: `feat: nginx-unprivileged image with health, JSON logs and headers`.

### Task 4: CI

**Files:**
- Modify: `.github/workflows/release.yaml` (only the two `CONFIG` blocks and the `test` job)

**Interfaces:**
- Consumes: `pnpm check`, `pnpm build`, `Dockerfile`.

- [ ] **Step 1:** CONFIG: `APP: portfolio`; image entry `{name: portfolio, context: ., file: Dockerfile, build-args: ""}`.
- [ ] **Step 2:** Replace the `test` job's steps with: checkout, `pnpm/action-setup` and `actions/setup-node` (Node from `.nvmrc`, pnpm cache), `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm build`, then `lycheeverse/lychee-action` in offline mode over `dist/` (internal links and fragments only, so external sites can't break CI). Pin every action by commit SHA with a version comment, as the template does.
- [ ] **Step 3:** Pedro sets `HOMELAB_APPS_CLIENT_ID` (variable) and `HOMELAB_APPS_PRIVATE_KEY` (secret) on the repo, per `homelab/docs/onboarding-an-app.md` §1. This is his step. Don't proceed to the release until he confirms.
- [ ] **Step 4:** Push a branch and open a PR. Expected: `lint` and `release` (test + build, no push) both green.
- [ ] **Step 5:** Commit is part of the PR: `ci: configure release workflow for portfolio`. Don't merge yet. Merging to `master` is a release and needs Task 5's folder first.

### Task 5: Deploy to the homelab (LAN only)

**Files (in `~/Dev/personal/homelab-apps-gitops`):**
- Create: `apps/portfolio/deployment.yaml`, `service.yaml`, `httproute.yaml`, `kustomization.yaml`

**Files (in `~/Dev/personal/homelab-platform-gitops`):**
- Modify: `components/teams/values.yaml` (add `- {name: portfolio}` under team `apps`)

- [ ] **Step 1:** Read `homelab-apps-gitops/CLUSTER-POLICIES.md` and use `apps/yabe/` as the style reference.
- [ ] **Step 2:** Deployment, following the onboarding guide's example with these values: `replicas: 1`; `runAsUser: 101`, `runAsGroup: 101`, `runAsNonRoot`, `seccompProfile: RuntimeDefault`; container port `http` 8080; readiness `/ready`, liveness `/health`; `readOnlyRootFilesystem: true`, `allowPrivilegeEscalation: false`, drop `ALL`; volume `tmp` (`emptyDir: {medium: Memory, sizeLimit: 16Mi}`) mounted at `/tmp`; requests `cpu: 10m, memory: 16Mi`, limit `memory: 64Mi`; image `ghcr.io/pedroshaina/portfolio` with no tag.
- [ ] **Step 3:** Service: ClusterIP, port 80 → `http`. HTTPRoute: `parentRefs: [{name: shared, namespace: gateway, sectionName: https-apps}]`, hostname `portfolio.pdrlabs.com.br`, a single backend rule.
- [ ] **Step 4:** `cd apps/portfolio && kustomize create --resources "$(ls *.yaml | paste -sd, -)" && kustomize build .`. Expected: three rendered manifests.
- [ ] **Step 5:** Open the apps-gitops PR (with Pedro's OK). Once Pedro has merged it, merge Task 4's PR. Expected: the release run is green and `apps/portfolio/kustomization.yaml` gains an `images:` entry pinned by digest.
- [ ] **Step 6:** Open the platform PR adding the onboarding line, LAN only (no `public`). Pedro merges it.
- [ ] **Step 7:** Verify on the LAN:
  - Argo CD app `portfolio` is Synced/Healthy;
  - `curl -sI https://portfolio.pdrlabs.com.br/` returns 200 with the CSP header;
  - a directory URL without a trailing slash redirects to a relative `Location` (Review Focus 1);
  - `kubectl -n portfolio logs deploy/portfolio` shows JSON lines.
- [ ] **Step 8: Phase 1 stop.** Summarise for Pedro and wait for his go-ahead.

---

## Phase 2: Content model and i18n

### Task 6: i18n core and language switch

**Files:**
- Create: `src/i18n/locales.ts`, `src/i18n/ui.ts`, `src/pages/pt-br/index.astro`
- Modify: `astro.config.mjs`, `src/layouts/BaseLayout.astro`, `src/components/TopBar.astro`, `src/components/Footer.astro`, `src/pages/index.astro`

**Interfaces:**
- Produces, in `src/i18n/locales.ts`:
  - `type Locale = 'en' | 'pt-br'`;
  - `locales: readonly Locale[]`;
  - `getLocale(url: URL): Locale`;
  - `localizedPath(path: string, locale: Locale): string`, which strips or adds the `/pt-br` prefix and keeps the rest of the path;
  - `formatDate(date: Date, locale: Locale): string`, using `Intl.DateTimeFormat` with `{ year: 'numeric', month: 'short', day: 'numeric' }`.
- Produces, in `src/i18n/ui.ts`: `ui: Record<Locale, UiStrings>` and `t(locale: Locale): UiStrings`. `UiStrings` is an explicit type, so a missing key in either language fails `astro check`. Keys used later: `nav.projects`, `nav.blog`, `home.intro`, `home.projectsLabel`, `home.blogLabel`, `home.allPosts`, `home.scrollHint`, `project.github` (`GitHub ↗`), `project.website` (`Website ↗`, PT `Site ↗`), `project.readOnBlog` (`Read about it on the blog →`, PT `Leia sobre no blog →`), `post.partOf` (`(n, m, project) => string`), `post.minRead`, `post.previous`, `post.next`, `notFound.title`, `notFound.body`. `home.intro` holds a marked placeholder for Pedro in both languages.
- Produces: page components take `locale: Locale` as a prop. Every route is a thin file under `src/pages/` and `src/pages/pt-br/` that renders a shared component with its locale.

- [ ] **Step 1:** `astro.config.mjs`: `i18n: { defaultLocale: 'en', locales: ['en', 'pt-br'], routing: { prefixDefaultLocale: false } }`.
- [ ] **Step 2:** Implement `locales.ts` and `ui.ts`. Move the home markup into `src/components/pages/HomePage.astro` (`{ locale: Locale }`). `src/pages/index.astro` and `src/pages/pt-br/index.astro` render it.
- [ ] **Step 3:** `BaseLayout` gets a `locale` prop and sets `<html lang>` (`en` / `pt-BR`), plus `<link rel="alternate" hreflang>` for both locales and `x-default` → EN. The TopBar's switch links to `localizedPath(Astro.url.pathname, other)`, with the current locale dim, and nav links are localised.
- [ ] **Step 4:** `pnpm check && pnpm build`. Expected: `dist/index.html` and `dist/pt-br/index.html`. Clicking EN/PT in `pnpm preview` swaps between them. Put a PT string with `ç ã õ é ê` in `home.intro`. Expected: it renders in IBM Plex Sans and Oxanium, with no fallback glyphs (Review Focus 4).
- [ ] **Step 5:** Commit: `feat: EN/PT-BR routing, UI strings and language switch`.

### Task 7: Content collections and rules

**Files:**
- Create: `src/content.config.ts`, `src/lib/content.ts`, `src/content/projects/k8s-homelab.yaml`, `src/content/projects/yabe.yaml`, `src/content/posts/sample-post/en.md`, `src/content/posts/sample-post/pt-br.md`, `src/content/posts/sample-post/diagram.png`

**Interfaces:**
- Produces, collections:
  - `posts`: glob `**/{en,pt-br}.md` under `src/content/posts`, so the id is `<slug>/<locale>`. Schema `{ title: string; description: string; pubDate: date; updatedDate?: date; project?: string; draft: boolean = false }`.
  - `projects`: one YAML file per project. Schema `{ order: number; repo?: url; website?: url; en: { title; summary }; 'pt-br': { title; summary } }`. Both languages are required by the schema.
- Produces, in `src/lib/content.ts`:
  - `type Post = { slug: string; locale: Locale; entry: CollectionEntry<'posts'> }`;
  - `getPosts(locale: Locale): Promise<Post[]>`: published only in production (drafts included in `astro dev`), newest first. On first call it runs `assertTranslations`;
  - `assertTranslations(entries): void`: throws `Error("Missing translations: <slug> (pt-br), …")` listing every non-draft slug that lacks one locale, and every `project` value that doesn't match a project id;
  - `getProjects(locale: Locale): Promise<Project[]>`, with `Project = { slug; title; summary; repo?; website?; order }`, sorted by `order`;
  - `getSeries(post: Post, posts: Post[]): { index: number; total: number; prev?: Post; next?: Post } | undefined`: the published posts of the same project in ascending `pubDate`, 1-based `index`;
  - `projectBlogHref(project: Project, posts: Post[], locale: Locale): string | undefined`: `undefined` for 0 posts, the post URL for 1, `localizedPath('/blog/project/<slug>/', locale)` for 2+ (Review Focus 3);
  - `postHref(post: Post): string`;
  - `readingTime(body: string): number`: minutes at 200 words per minute, minimum 1.

- [ ] **Step 1:** Write the schemas, then the two project files with summaries drawn from each repo's README (EN and PT; Pedro will rewrite them). Homelab: `repo: https://github.com/pedroshaina/k8s-homelab`, no `website`. yabe: `repo: https://github.com/pedroshaina/yabe`, `website: https://yabe.pdrlabs.com.br`.
- [ ] **Step 2:** Write the sample post in both languages with `draft: true` and `project: yabe`. It should exercise an h2, a TypeScript code block, inline code, a link and the co-located image.
- [ ] **Step 3:** Implement `src/lib/content.ts`.
- [ ] **Step 4:** Prove the translation rule:
  - temporarily set the sample's `draft: false` and delete `pt-br.md`. `pnpm build` must fail with `Missing translations: sample-post (pt-br)`;
  - restore `pt-br.md`. The build must pass;
  - set `draft: true` again and delete `pt-br.md`. The build must pass (drafts are exempt);
  - restore everything.
- [ ] **Step 5:** Prove drafts don't leak (Review Focus 2): with the sample as a draft, `pnpm build && grep -r "sample-post" dist/` finds nothing.
- [ ] **Step 6:** Commit: `feat: posts and projects collections with translation check`.
- [ ] **Step 7: Phase 2 stop.** Summarise for Pedro and wait for his go-ahead.

---

## Phase 3: Pages

### Task 8: Home page

**Files:**
- Create: `src/components/Avatar.astro`, `src/components/home/IntroScreen.astro`, `src/components/home/ProjectsSection.astro`, `src/components/home/BlogSection.astro`
- Modify: `src/components/pages/HomePage.astro`

**Interfaces:**
- Consumes: `getProjects`, `getPosts`, `projectBlogHref`, `postHref`, `formatDate`, `t`, `site`.
- Produces: `Avatar` props `{ size: number }`. It uses `import.meta.glob('/src/assets/avatar.{png,jpg,jpeg,webp,svg}', { eager: true })`. If the file exists, it renders it through `astro:assets` `<Image>` inside the ring. If not, it renders `site.initials` in Oxanium magenta. Either way it has the magenta ring and glow (`box-shadow: 0 0 18px rgba(255,42,109,.45)`). Swapping in the real avatar = adding that one file.

- [ ] **Step 1:** `IntroScreen`: roughly a full viewport (`min-height: 100svh` minus the top bar), centred content: `Avatar` (92px), name (Oxanium 500, ~28px desktop), `home.intro`, then personal links only (GitHub · LinkedIn · Email, magenta underline), and the dim `home.scrollHint`.
- [ ] **Step 2:** `ProjectsSection` (`id="projects"`): magenta mono label. Each project sits between thin `rgba(255,255,255,.08)` divider lines with about 22px vertical padding. Title (Oxanium, ~22px) with `GitHub ↗` / `Website ↗` inline after it, each rendered only if set, opening in a new tab with `rel="noopener"`. Then the summary, then the cyan `project.readOnBlog` link only when `projectBlogHref` returns a value.
- [ ] **Step 3:** `BlogSection`: label, the latest 3 posts as title + `formatDate`, and `home.allPosts` → `/blog/`.
- [ ] **Step 4:** Hover/focus: links and project titles turn cyan with `text-shadow: 0 0 10px rgba(5,217,232,.5)`. Visible `:focus-visible` outline. All transitions are disabled under `prefers-reduced-motion: reduce`.
- [ ] **Step 5:** Verify in `pnpm dev`:
  - it matches the mockup's layout;
  - at 375px width, sections stack and nothing scrolls horizontally;
  - Review Focus 3: with the sample as a non-draft, yabe's link points at the post. Add a temporary second yabe post: the link points at `/blog/project/yabe/`. Homelab, with no posts, shows no link. Revert the temporary changes;
  - dropping a test `src/assets/avatar.png` replaces the PM placeholder. Remove the test file.
- [ ] **Step 6:** Commit: `feat: home page with intro, projects and latest posts`.

### Task 9: Blog index, project filter, post page, 404

**Files:**
- Create: `src/components/pages/BlogIndexPage.astro`, `src/components/pages/PostPage.astro`, `src/components/pages/NotFoundPage.astro`, `src/components/PostList.astro`, `src/styles/prose.css`, `src/styles/shiki-night.json`, and thin routes `src/pages/{,pt-br/}blog/index.astro`, `src/pages/{,pt-br/}blog/[slug].astro`, `src/pages/{,pt-br/}blog/project/[project].astro`, `src/pages/{,pt-br/}404.astro`
- Modify: `astro.config.mjs` (`markdown.shikiConfig.theme`)

**Interfaces:**
- Consumes: everything from `src/lib/content.ts`, `t`, `localizedPath`.
- Produces: `PostList` props `{ posts: Post[]; locale: Locale; order: 'newest' | 'oldest' }`, rendering title, date and description as plain rows.

- [ ] **Step 1:** Blog index: page title, then `PostList` newest first. Project filter (`getStaticPaths` over projects that have 2+ posts): the project title as heading, then `PostList` oldest first.
- [ ] **Step 2:** Post page:
  - a reading column of about 680px max;
  - mono dim meta: `formatDate · N min`;
  - Oxanium title;
  - when `getSeries` returns a value, `post.partOf(index, total, projectTitle)`, linked to the project's blog href;
  - the rendered body styled by `prose.css`: Oxanium h2/h3, cyan inline code, `#0a1128` code blocks with 4px radius, images at full column width, required alt text (fail the build if missing, via a remark check or a schema-time check of the Markdown; builder chooses the mechanism);
  - previous/next within the series when there is one, otherwise chronological; then "All posts".
- [ ] **Step 3:** `shiki-night.json`: a minimal TextMate theme with background `#0a1128`, foreground `#9aa1ba`, keywords `#ff2a6d`, functions and strings `#05d9e8`, comments `#4a5172`. Wire it into `markdown.shikiConfig.theme`.
- [ ] **Step 4:** 404 pages per locale with `notFound.title` / `notFound.body` and a link home. Their language switch goes to the other locale's 404.
- [ ] **Step 5:** Verify:
  - Review Focus 5: on each page type in both locales, clicking the language switch lands on the same page in the other language, with no 404s;
  - Review Focus 4: PT dates read like `21 de set. de 2026`;
  - in the nginx container, `/blog/nope/` → EN 404 and `/pt-br/blog/nope/` → PT 404, both with status 404;
  - lychee offline over `dist/` passes.
- [ ] **Step 6:** Commit: `feat: blog index, project series, post page and 404s`.
- [ ] **Step 7:** Merge to `master` via PR, which releases it to the LAN deployment. Check it live.
- [ ] **Step 8: Phase 3 stop.** Summarise for Pedro and wait for his go-ahead.

---

## Phase 4: SEO, polish, go public

### Task 10: SEO, feeds and sitemap

**Files:**
- Create: `src/components/Seo.astro`, `src/pages/rss.xml.ts`, `src/pages/pt-br/rss.xml.ts`, `scripts/og-image.mjs`, `public/og-default.png`
- Modify: `astro.config.mjs` (add `@astrojs/sitemap`), `src/layouts/BaseLayout.astro`

**Interfaces:**
- Produces: `Seo` props `{ title: string; description: string; locale: Locale; type?: 'website' | 'article'; publishedTime?: Date }`, emitting canonical, `og:*` (`og:locale` `en_US` / `pt_BR`, `og:image` absolute URL of `/og-default.png`), and `twitter:card summary_large_image`.

- [ ] **Step 1:** `scripts/og-image.mjs` uses `sharp` (already an Astro dependency) to render a 1200×630 PNG from an inline SVG: night blue background, magenta ring with "PM", "Pedro Martins" and "Senior Software Engineer" in Oxanium (the TTF from the Fontsource package). Run it once and commit `public/og-default.png`.
- [ ] **Step 2:** RSS per locale with `@astrojs/rss` from `getPosts(locale)`: title, description, pubDate, link. Add `<link rel="alternate" type="application/rss+xml">` in `BaseLayout`.
- [ ] **Step 3:** `@astrojs/sitemap` with its `i18n` option (`defaultLocale: 'en'`, locales `{ en: 'en', 'pt-br': 'pt-BR' }`). Exclude the 404 pages.
- [ ] **Step 4:** Verify: `pnpm build`; `dist/rss.xml`, `dist/pt-br/rss.xml` and `dist/sitemap-index.xml` exist; a draft appears in none of them (Review Focus 2); the page source shows correct OG tags and hreflang pairs.
- [ ] **Step 5:** Commit: `feat: Open Graph tags, RSS per language and sitemap`.

### Task 11: Accessibility and polish

**Files:**
- Modify: `src/styles/tokens.css`, any component where the audit finds issues

- [ ] **Step 1:** Compute WCAG contrast against `#060b1d` for body `#9aa1ba`, dim `#565d7a` and magenta labels at their actual sizes. Lighten only what fails AA for text (4.5:1 for small text), keeping the hue. Record the old and new values in the commit message.
- [ ] **Step 2:** Check heading order, link text, `alt` on the avatar image, and that keyboard focus is visible on every link.
- [ ] **Step 3:** In Chrome DevTools, check the console on every page type for CSP violations, then run a Lighthouse pass (mobile) on home and a post. Fix anything under 95 in Accessibility or Performance, or report it to Pedro if fixing it would change the design.
- [ ] **Step 4:** Commit: `fix: accessibility and contrast pass`.

### Task 12: Go public

**Files (in `~/Dev/personal/homelab`):** `infra/cloudflare/main.tf`, `variables.tf`, `terraform.tfvars`, `tests/rate_limit.tftest.hcl`
**Files (in `~/Dev/personal/homelab-platform-gitops`):** `components/teams/values.yaml`

- [ ] **Step 1: Decision for Pedro.** The existing ruleset notes the free plan's limits, and the free plan may allow only one rate-limiting rule, which yabe already uses. Check the zone's entitlement, then bring Pedro the options:
  - (a) a second rule, if allowed;
  - (b) widen the existing rule's expression to cover both hosts (shared limit);
  - (c) no rate limit for the static site, relying on Cloudflare's cache and DDoS protection.

  Recommend one. Proceed only on his answer.
- [ ] **Step 2:** Implement his choice, with the OpenTofu test updated, via a PR in `homelab`. After his merge, `infra/tf cloudflare plan` shows only the expected change, then `apply`, with his OK.
- [ ] **Step 3:** Platform PR: `- {name: portfolio, public: true}`. Pedro merges it.
- [ ] **Step 4:** Verify from outside the LAN (phone on mobile data):
  - `https://portfolio.pdrlabs.com.br/` loads through Cloudflare (`cf-ray` header present);
  - `/pt-br/` and a post load;
  - a directory URL redirects correctly (Review Focus 1);
  - the OG preview renders in a link-preview checker.
- [ ] **Step 5: Phase 4 stop.** Summarise for Pedro. Next up, as a separate brainstorm, the custom-domain platform change (spec §9).
