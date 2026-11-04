---
name: blog-post
description: Use when the user runs /blog-post with a draft file, or asks to turn a draft, notes or a long write-up into a blog post or series for this site (pedromartins.dev.br), in English and Brazilian Portuguese.
argument-hint: <path to the draft file>
---

# Blog post from a draft

Turn the author's draft (`$ARGUMENTS`) into a series of 3–5 posts on this site, in English and
Brazilian Portuguese, with diagrams, without losing the author's voice.

**Core principle:** it is the author's post. Keep their sentences, follow the order they made
their decisions in, prove every technical claim against real code, and stop for their review
between phases.

## The site, already known

- A post is a folder: `src/content/posts/<slug>/en.md` + `pt-br.md`, its images next to them.
- Frontmatter: `title`, `description`, `pubDate`, `project` (optional), `draft`. Posts sharing a
  `project` form a series ("Part N of M", prev/next, `/blog/project/<project>/`), ordered by
  `pubDate`. The project must exist in `src/content/projects/<project>.yaml`; adding one there
  shows a card on the live home page even while posts are drafts, so ask first.
- Reading time is `ceil(words / 200)`: 3–5 min is 600–1,000 words of body, code included.
- The build fails on an image without alt text, and, **for non-draft posts only**, on a missing
  language or unknown project. Drafts hide those failures (see the publish check below).
- Posts are © the author (`src/content/posts/LICENSE`); the site is dark-only. Diagram style:
  `diagrams.md`.

## Workflow

Stop at every **STOP**: summarize what you did and wait for the go-ahead.

1. **Read.** The draft; the published posts, if any, for tone (otherwise the draft's own voice is
   the reference); and the source code of whatever the draft describes (`~/Dev/personal/`, or the
   public GitHub repo read-only). Note every claim the code contradicts and every private detail
   (private repo names, internal hosts, IPs, secrets, xpubs, addresses, txids).
2. **Ask, in one message, with a recommendation each:**
   - **Split:** titles and what each post covers. If the draft can't reach 600 words per post for
     3 posts without inventing content, say so and offer fewer posts (even one) or ask the author
     for more material. Never pad.
   - **Slugs, dates, branch:** propose kebab-case slugs, `pubDate`s one day apart (same in both
     languages), and a `<topic>-series` branch.
   - **Source code:** if it's missing or private, ask for access. Without it, no snippets, and
     each claim is reported as unverified.
   - **Doubtful content:** facts the code contradicts are corrected and listed. Opinions,
     comparisons and design choices that look wrong (or insecure) are questions, never silent
     fixes.
   - **Private details:** propose a replacement for each (generic wording such as "a private Git
     repo", or the public blueprint's names), or dropping the passage.
   - Who reviews the Portuguese; publishing (`draft: true` on a branch is the default); the
     series `project` (a new project YAML needs approved en/pt-br summaries).

   **STOP.**
3. **English.** Branch off `master`. Per post:
   - **Voice:** keep the author's sentences; fix grammar, typos and facts. Add only intros,
     "up next" lines, short bridges and examples. Track every sentence you changed in meaning and
     everything you added.
   - **Timeline:** tell decisions in the order they were made. Nothing shows a choice before the
     section that makes it: no final-architecture diagram up front (put it at the end as a recap),
     no code using a tool the post hasn't chosen yet.
   - **Examples:** snippets copied from real files and trimmed, never invented. Prefer the public
     repo; if a snippet only exists in a private repo, use the public equivalent or generic names
     and say so.
   - **Diagrams:** SVG per `diagrams.md`, only where they explain a mechanism. Photos and
     screenshots only come from the author: ask for them.
   - Run the checks below. Commit. **STOP** with: the post table (title, words, minutes), what
     you changed in the author's text and why, what you added, the facts you corrected against
     the code, and open questions.
4. **Portuguese.** Only after the English is approved, and from the files as they are on disk
   (the author edits by hand). Translate the meaning, not the words, in the register of
   `pt-br-glossary.md`. Same frontmatter values (`pubDate`, `project`, `draft`); internal links to
   `/pt-br/blog/<slug>/`; translate headings, alt text and code comments, never code. Make a
   `<name>.pt-br.svg` copy of every diagram with translated labels and `<title>`, point `pt-br.md`
   at it, and check that the longer labels still fit. Terms the glossary doesn't cover: use what
   Brazilian devs say (usually the English term) and list them for the author to decide. Checks.
   Commit.
5. **Native review.** Spawn a fresh general-purpose agent with `reviewer-prompt.md`. It reports;
   it does not edit. Summarize its verdict and main patterns for the author, list the calls that
   are theirs (how informal, which terms stay in English), and **STOP**. Apply what they decide,
   to the posts and the diagrams, add new term decisions to `pt-br-glossary.md` (committed with the posts), run the checks,
   and show the diff (`git diff --word-diff`) before committing.
6. **Finish.** Push and open the PR only when asked. The PR body states only checks you actually
   ran, at the widths you actually looked at. Never add Claude attribution.

## Checks (every phase)

- `pnpm format:check`, `pnpm check`, `pnpm build`.
- **Publish check** (once `pt-br.md` exists; before that it fails on the missing language by
  design): drafts skip the translation check, so temporarily set `draft: false` in the new posts,
  `pnpm build`, then restore `draft: true` and confirm with `grep`.
- Word count per post: `awk 'c>=2{print} /^---$/{c++}' <file> | wc -w`.
- Look at every diagram on the running site (Playwright; `pnpm dev` detaches, stop it with
  `pnpm astro dev stop`): each language, desktop and 390 px. Labels must not cross arrows or
  borders. Screenshots go under `.playwright-mcp/`; delete it afterwards.
- `grep` the posts and SVGs for the private details noted in step 1.

## When the author edits by hand

Re-read a file before editing it, and edit only the lines you were asked to. Don't run
`prettier --write` or commit while they say they are still editing; when a check fails on their
edit, show what it would change before fixing it. If they still see old diagram text after a
change, the browser cached the image: suggest a hard reload.

## Common mistakes

| Mistake | Instead |
|---|---|
| Rewriting the author's prose in your own style | Keep their sentences; list every change |
| Overview diagram or final config at the start | Recap at the end; each choice after its reasoning |
| Snippet from memory or from a private repo | Copy from the public source; verify names and ports |
| Portuguese that follows English word order and idioms | Rewrite the meaning as a Brazilian dev would say it |
| English-only diagrams in the Portuguese post | `.pt-br.svg` copies, linked from `pt-br.md` |
| "Build passes" while the posts are drafts | Run the publish check |
| Applying the reviewer's register choices yourself | Bring them to the author |
