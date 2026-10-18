---
title: A sample post
description: Exercises every piece of the post layout. Not for publishing.
pubDate: 2026-09-21
project: yabe
draft: true
---

This is a sample post. It exists to check the layout: headings, code, `inline code`, a
[link to yabe](https://yabe.pdrlabs.com.br) and an image.

## Finding where the chains diverge

The indexer walks back from its own tip, asking the node for the hash at each height, until the
two agree.

```ts
// walk back until our hash matches the node's
async function findForkPoint(stored: Block, node: Node): Promise<number> {
  let h = stored.height;
  while (stored.hash !== (await node.getBlockHash(h))) {
    h -= 1;
  }
  return h;
}
```

![Two chains diverging at a fork point](./diagram.png)

Because each block is written in its own transaction, a crash leaves the database consistent.
