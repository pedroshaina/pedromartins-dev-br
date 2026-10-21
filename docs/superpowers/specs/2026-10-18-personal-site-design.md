# pedromartins.dev.br: Design Spec

- **Date:** 2026-10-18
- **Status:** Approved 2026-10-18
- **Scope:** the personal site itself. Serving it at `pedromartins.dev.br` needs a homelab platform
  change (custom domains), which is a **separate, later project** (see §9).

Marked *(builder's call)* = decided during brainstorming as a sensible default, not something Pedro
chose; change it if there's a good reason. Everything else was decided by Pedro.

## 1. Intent

A personal site where **recruiters and tech leads** judge Pedro as an engineer. It isn't a
freelance storefront: Pedro doesn't usually take freelance work, so there is no services page,
"hire me" pitch or CV-style job list. A visitor should quickly see the depth of his work and how he
thinks, through a short professional summary, a few projects, and a blog where those projects are
written up.

The site is also an exhibit: it runs on Pedro's homelab Kubernetes platform and deploys through the
same GitOps flow as his other apps.

**Success:** a tech lead lands on the page, understands in seconds who Pedro is, and goes on to
read a project write-up. Pedro can publish a post (in both languages) by merging a PR.

## 2. Goals, non-goals, anti-goals

**Goals**

- Present Pedro professionally: a short paragraph about his experience (e.g. "Senior software
  engineer with over 12 years of experience across different industries…"), not a list of jobs.
- Present projects, each linking to its GitHub repo, its live website (when there is one), and its
  write-up on the blog.
- A simple blog with posts written in Markdown, in the site's own repository.
- English and Brazilian Portuguese, for every page **and every post**.
- Run on the homelab via GitOps, like yabe.

**Non-goals (for now)**

- **visttor.** Left off until it has at least UI mockups; then it's added as a third project.
- A CMS or blog backend, comments, newsletter, search, analytics, cookies (and so no cookie
  banner). Cloudflare's dashboard gives basic traffic numbers.
- A light theme. The site is dark only; the look depends on it.
- Serving at `pedromartins.dev.br` (separate project, §9).

**Anti-goals: things that would make it a failure even if it works**

- **Clutter.** Pedro rejected several designs because too many things competed for attention.
  One thing at a time, lots of empty space, no tags, stats, badges or boxes around everything.
- **Looking like a generic AI-generated or template site.** This is why the fonts are not Inter /
  JetBrains Mono / Share Tech Mono, and why the cyberpunk is restrained rather than glitchy.
- Loud effects. Glow and colour are accents, mostly on hover.

## 3. How it's built and run

| Decision | Choice | Who |
|---|---|---|
| Framework | **Astro**, static output | Pedro |
| Content | Markdown files in the repo (Astro content collections, frontmatter validated by zod); publishing = merging a PR | Pedro |
| Runtime | **nginx** serving the built files, from the official `nginx-unprivileged` image; no Node at runtime | Pedro |
| Hosting | Pedro's homelab, deployed through its GitOps flow | Pedro |
| Repo | Created from `pedroshaina/homelab-apps-ci-cd-template` (brings the release pipeline); the Go placeholder is replaced by the Astro project. **Private** on GitHub for now (the cluster pulls private GHCR images with its own credentials; Actions minutes come from the free allowance) | Pedro (repo) / builder's call (template) |
| Personal links | GitHub, LinkedIn and Email URLs live in one config file; the builder uses `github.com/pedroshaina` and leaves LinkedIn/Email as marked placeholders for Pedro | builder's call |
| Fonts | Self-hosted via Fontsource packages (no requests to Google), only the weights used, `latin` + `latin-ext` subsets (Portuguese accents) | builder's call |
| Client-side JS | As close to none as possible; nothing needs a framework island | builder's call |
| Styling | Plain CSS: one tokens file of custom properties + Astro scoped styles; no Tailwind | Pedro |
| Content on disk | Folder per post: `src/content/posts/<slug>/en.md` + `pt-br.md`, images alongside | Pedro |

### 3.1 Homelab deployment contract

The homelab's onboarding guide (`~/Dev/personal/homelab/docs/onboarding-an-app.md`) and
`homelab-apps-gitops/CLUSTER-POLICIES.md` are the source of truth. In short, the container must:

- serve HTTP on **8080**, with `GET /health` and `GET /ready` returning 200 (nginx locations);
- shut down cleanly (nginx treats SIGTERM as a fast shutdown and SIGQUIT as graceful; the image
  sets `STOPSIGNAL SIGQUIT`. The builder confirms what the cluster's runtime actually sends and
  that in-flight requests finish; for a static site, a fast shutdown after the endpoint is removed
  is acceptable);
- log **JSON lines** to stdout (a `log_format` in the nginx config);
- run as non-root with `readOnlyRootFilesystem: true` under Pod Security `restricted`: nginx needs
  writable `/tmp` (pid, temp paths) → `emptyDir` volumes; the image's user is UID **101**, not the
  template's 65532;
- be built for `linux/amd64`.

The app's folder in `homelab-apps-gitops` (`apps/<name>/`): Deployment, Service (ClusterIP),
HTTPRoute on `gateway/shared`, `kustomization.yaml` created with `kustomize create`. The release
workflow pins the image by digest; Argo CD deploys.

- **App name:** `portfolio` (Pedro chose the hostname; the platform derives it from the app name). It becomes the namespace, the Argo CD app and
  the interim hostname **`portfolio.pdrlabs.com.br`**.
- **Public:** yes. Following the onboarding guide's step 5: Cloudflare rate-limit rule first (in
  `homelab/infra/cloudflare`), then `public: true` on the onboarding line.
- These homelab changes (apps-gitops folder, onboarding line, rate limit) are part of this project;
  they are ordinary onboarding, not the platform change in §9.

### 3.2 nginx behaviour *(builder's call)*

- Cache: hashed assets (`/_astro/*`) `immutable`, one year; HTML `no-cache`.
- Astro's `404.html` for unknown paths (one per language: `/pt-br/...` misses get the PT-BR 404).
- Security headers: a strict CSP (self only; no third-party origins exist), `X-Content-Type-Options`,
  `Referrer-Policy`. HSTS is left to Cloudflare.
- No automatic language redirect from `Accept-Language`; `/` is always English.

## 4. The look

Reference mockups (HTML fragments rendered by the brainstorming companion, so they look plain if
opened directly; the CSS values are in their `<style>` blocks):

- `docs/superpowers/specs/2026-10-18-personal-site-mockup.html`: the approved home page and post.
  Its fonts were later changed; see §4.2.
- `docs/superpowers/specs/2026-10-18-personal-site-fonts.html`: the font comparison; option 1 was
  chosen.

### 4.1 Feel

Calm cyberpunk, inspired by **Ghostrunner** (and, more loosely, Cyberpunk 2077). Simple and
eye-pleasing: dark night blue, neon used sparingly, one thing to look at per screen.

### 4.2 Tokens

| Token | Value | Use |
|---|---|---|
| Background | `#060b1d` night blue, **solid, no gradients** | everything |
| Magenta | `#ff2a6d` | avatar ring and glow, section labels, code keywords, link underlines |
| Cyan | `#05d9e8` | "Read about it on the blog" links, inline code, hover state |
| Text | `#9aa1ba` body, `#e8eaf3` emphasis, `#ffffff` headings | |
| Dim | `#565d7a` | dates, meta, inactive language |
| Code block | `#0a1128` | |
| **Headings, name, top bar** | **Oxanium** (500/600) | Pedro |
| **Body** | **IBM Plex Sans** (400/500) | Pedro |
| **Labels, dates, code** | **IBM Plex Mono** (400), ligatures off | Pedro |

Contrast: the dim colour on the background is below WCAG AA for small text. The builder adjusts the
dim/body tokens as little as needed to meet AA for text; decorative uses can stay.

### 4.3 Effects

- The avatar's magenta glow is the one strong neon element on the page.
- Links light up (cyan, soft text glow) on hover/focus; project titles don't react to hover. Nothing animates on its
  own, with two exceptions Pedro asked for (2026-10-20): the home page's "Scroll" hint bounces
  gently and pauses while hovered or focused, and the avatar's neon pixels pulse slowly (3 s).
  Both stay still under `prefers-reduced-motion`.

### 4.4 Avatar

A **cartoon avatar** of Pedro as a cyberpunk character, not a likeness *(made 2026-10-20)*: 8-bit
pixel art on a 32×32 grid, black hair swept up at the front with faded sides running into a full
beard, a round face, a dark jacket with a magenta collar, a cyan rim light, and over-ear headphones
with a cyan light on one cup and magenta on the other. The neon pixels pulse (§4.3).

It lives in `src/assets/avatar.svg`. An SVG avatar is inlined into the page so the site's
reduced-motion rule reaches its animation (inside an `<img>` it would keep moving); a raster file
(`avatar.png`, `.jpg`, `.webp`) still works and is shown as an image. With no file at all, the
"PM" placeholder in a magenta ring is shown.

## 5. Pages

### 5.1 Every page

**Top bar** (site navigation only): `PM` on the left → home. On the right: **Blog** (→ blog index;
hidden on every page under `/blog/`) and the **EN | PT** language switch, which keeps you on the
same page in the other language. Personal links never go in the top bar. *(Revised 2026-10-20:
Projects link removed.)*

**Footer:** quiet one line: © year, GitHub · LinkedIn · Email.

### 5.2 Home: one section per screen, snapping

*(Revised 2026-10-20.)* Three full screens; scrolling snaps a whole screen at a time. Everything is
centred on the page. Section titles are Oxanium, normal case, between two short magenta lines
("— Stack —").

1. **Intro**: avatar above **Pedro Shainã Martins** (Oxanium 600, 64 px on desktop), the intro
   (one or more paragraphs, centred, up to about 60 characters a line), then **only Pedro's personal
   links: GitHub · LinkedIn · Email**. A "Scroll ↓" hint at the bottom links to the next screen.
2. **Stack**: technologies grouped by category, as plain text (category name, then the items
   separated by commas) in a centred three-column grid. The list lives in `src/config/stack.ts`.
3. **Projects**: two equal columns (an odd last project leaves the right cell empty), each project
   with a thin line under it. Per project:
   - title, with **"GitHub ↗"** and **"Website ↗"** links right next to it, each shown only if the
     project has it (homelab: GitHub only, the public `k8s-homelab` repo; yabe: both);
   - one or two sentences;
   - **"Read about it on the blog"**: if the project has one post, it goes straight to it;
     with several, to the blog filtered to that project, oldest first *(builder's call)*;
     hidden if the project has no published posts yet.

   The footer shares this last screen. There is no blog screen; the blog is reached from the top
   bar and from each project's link.

No tags, stats, boxes, or tech badges anywhere on the home page.

### 5.3 Blog index

Same calm style, no snapping. The page title (with one magenta line before it) sits in a left
column, the posts on the right: all posts, newest first, each with its title (Oxanium), date and
description. A per-project filtered view at a stable URL, linked from §5.2: the project's name, a
one-line description and "All posts" on the left; its posts oldest first, each labelled "Part N".

### 5.4 Post

Narrow reading column: date · reading time (mono, dim), title, and, if the post belongs to a
project, **"Part N of M on <project>"** linking back to the project's filtered list. Markdown
body with Oxanium sub-headings, subtle code blocks (`#0a1128`, syntax colours from the palette via
a custom Shiki theme), cyan inline code. At the bottom: previous / next (within the project's
series when the post has one, otherwise chronological *(builder's call)*) and "All posts".

### 5.5 Responsive

Must work well at phone width: the home keeps its screens, but each lays out in one column, and
a screen taller than the phone scrolls before the next snap. Blog pages stack the title above the
posts.

## 6. Content model

Two collections *(structure: builder's call)*:

- **projects**: per project and language: title, summary (1–2 sentences), optional `repo` URL,
  optional `website` URL, display order.
- **posts**: per post and language: title, description, publish date, optional updated date,
  optional `project` reference, `draft` flag. Body in Markdown (MDX only if a need appears).

Rules:

- **Every post and project exists in both languages** (same slug). **The build fails** if a
  translation is missing, so a half-translated post can't ship. Drafts are excluded from production
  builds (and exempt from the rule while draft).
- The intro sentence and the about paragraph are bilingual text Pedro writes; the builder ships
  clearly marked placeholders.
- Reading time is computed.
- Initial content: the two projects (k8s homelab, yabe) with placeholder summaries drawn from their
  READMEs, and **one sample post marked draft** that exercises headings, code, inline code, a link
  and an image. Pedro writes the real posts.

## 7. i18n and SEO

- English at `/`, Brazilian Portuguese at `/pt-br/` (Astro i18n routing). `lang` attribute and
  `hreflang` alternates on every page.
- **RSS feed per language**, **sitemap**, and **Open Graph / Twitter tags** per page and post, with
  one shared default preview image in the site's style *(per-post generated images: not now)*.
- UI strings (nav, labels, "Read about it on the blog", "Part N of M on…", dates) translated;
  dates formatted per locale.

## 8. Quality

*(builder's call on tools; these are the bar)*

- CI on every PR (the template's `test` job): `astro check`, the build (which includes the
  translation check), and a link check over the built site. **No test framework and no container
  smoke-test script** (Pedro, 2026-10-18): the nginx container is verified by hand per phase.
- Accessibility: AA contrast for text, visible focus, semantic headings, alt text required for
  post images; checked once by hand plus a Lighthouse pass, not automated.
- Lighthouse-level performance is expected from a static site with self-hosted fonts and no JS;
  don't regress it.

## 9. Later: custom domain (separate project)

The homelab platform is built around one zone, `pdrlabs.com.br`: the wildcard certificate, the
Gateway listener, the `public-apps` chart (`<app>.pdrlabs.com.br`, ADR-0015), external-dns-public's
filters, the Cloudflare tokens and the rate-limit rules. Serving the apex `pedromartins.dev.br`
(DNS already on Cloudflare; `www` redirecting to the apex) needs a platform change with its own ADR,
brainstormed separately **after** this site is live at `portfolio.pdrlabs.com.br`. Nothing in
this project should hard-code the hostname beyond configuration (Astro `site`, the HTTPRoute), so
the switch is a config change on the site's side. It's also a good blog post.

## 10. Working style

Per Pedro's standing instructions: the plan splits this into phases, each a reviewable chunk that
leaves the project working; stop after each phase with a summary and wait for his go-ahead; bring
major decisions (libraries, structure, trade-offs) to him with options and a recommendation before
acting.

## 11. Open, not blocking

- The real intro, about paragraph, project summaries and posts: Pedro writes them.
- visttor joins as a project once it has UI mockups.
