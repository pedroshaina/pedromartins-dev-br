# pedromartins.dev.br

Pedro Martins' personal site: a bilingual (English / Brazilian Portuguese) portfolio and blog.
Built with [Astro](https://astro.build) as plain static HTML and served by nginx on the homelab
Kubernetes platform, released through the GitOps pipeline from
`homelab-apps-ci-cd-template`.

## Develop

Requires Node 24 and pnpm (version pinned in `package.json`, `corepack enable` picks it up).

```bash
pnpm install
pnpm dev       # http://localhost:4321
pnpm check     # astro check (types, content schemas)
pnpm build     # static site in dist/
pnpm preview   # serve dist/
```

## Release

Merge to `master`. The release workflow builds the image, pushes it to GHCR and pins it by digest
in `homelab-apps-gitops` (`apps/portfolio/`); Argo CD deploys it. See the template's notes in
homelab `docs/onboarding-an-app.md` for rollback and pausing.

Design and plan: `docs/superpowers/specs/` and `docs/superpowers/plans/`.
