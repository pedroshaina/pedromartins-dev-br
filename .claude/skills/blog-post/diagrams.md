# Diagrams

Hand-written SVG next to the post, referenced as `![alt](./name.svg)`; the Portuguese copy is
`name.pt-br.svg`. The site is dark-only, and an `<img>` can't use the page's CSS, so the colours
are written in.

A diagram earns its place when it shows a mechanism the prose struggles with: a request's path, an
order of operations, what writes to what. Not a list of tools.

## Rules

- `viewBox` 720 wide; the image scales to the column, so at phone width text shrinks to about
  half. Body text 15px, headings 17px, mono 13–14px; never smaller. Prefer vertical flows.
- Background rect `#0a1128`, `rx="8"`. Boxes `fill="none"`, `stroke-width="1.5"`, `rx="6"`.
- Colours: cyan `#05d9e8` (main flow, the cluster), magenta `#ff2a6d` (the thing the post is
  about, outside or bootstrap steps), dim `#70789a` (context), text `#9aa1ba`, headings `#ffffff`.
- `role="img"` and a `<title>` that says what the diagram shows; the Markdown alt text says the
  same thing.
- Keep labels off arrows and borders; leave about 8px between a label and any line. Portuguese
  runs about 20% longer: split labels over two lines rather than shrinking them.
- No private details: blueprint or generic names, no internal IPs or hosts.
- Every box and arrow matches the code. If there's no code to check against, draw it from the
  draft and list it among the unverified claims.

## Skeleton

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 400" role="img" aria-labelledby="t">
  <title id="t">What the diagram shows, in one sentence</title>
  <style>
    text { font-family: 'IBM Plex Sans', system-ui, sans-serif; fill: #9aa1ba; font-size: 15px; }
    .h { fill: #ffffff; font-weight: 600; font-size: 17px; }
    .m { font-family: 'IBM Plex Mono', ui-monospace, monospace; font-size: 13px; }
    .c { fill: #05d9e8; }
    .g { fill: #ff2a6d; }
  </style>
  <defs>
    <marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0 10 5 0 10z" fill="#05d9e8"/>
    </marker>
  </defs>
  <rect width="720" height="400" rx="8" fill="#0a1128"/>

  <rect x="40" y="20" width="400" height="60" rx="6" fill="none" stroke="#05d9e8" stroke-width="1.5"/>
  <text x="60" y="46" class="h">Box title</text>
  <text x="60" y="68">one line of detail</text>
  <path d="M240 80v30" stroke="#05d9e8" stroke-width="1.5" marker-end="url(#a)"/>
</svg>
```

## Translating

Copy the file to `name.pt-br.svg` and replace each label with an exact-match find and replace that
fails when a string isn't found exactly once, so nothing is missed silently. Then look at it on
the Portuguese page, desktop and 390 px.
