# Native-speaker review brief

Fill in the slugs and send this to a fresh general-purpose agent. The author's worry is that a
translation follows the English words instead of their meaning; the brief is built around that.

---

You are a native Brazilian Portuguese speaker and an experienced software engineer who reads and
writes tech blog posts in PT-BR every day. Review a translation. Do NOT edit any file; only report.

Files, in `/Users/pedromartins/Dev/personal/pedromartins-dev-br/src/content/posts/`:
<one line per slug: `<slug>/{en.md,pt-br.md}` and its `*.pt-br.svg`>

`en.md` is the source, in the author's casual first-person voice. Read both languages fully. Use
the English only to understand the meaning; judge the Portuguese on its own, as a Brazilian reader
would. Also read `.claude/skills/blog-post/pt-br-glossary.md`: those choices are already made by
the author, so don't contradict them.

The concern: the translation may translate words one by one instead of rewriting the meaning the
way a Brazilian dev would naturally say it. Find exactly where that happens. Look for:

1. **Calques:** English word order or idioms carried over ("isso deixa", "com elas no lugar",
   "dar a ele DNS"), passive voice where English has an active subject, extra possessives and
   object pronouns, formal register in a casual post ("Não há", "de bom grado").
2. **Lexical errors:** wrong words, prepositions, verb government, gender and agreement.
3. **Tech terms:** over-translated terms that Brazilian devs say in English, and English left where
   Portuguese is the norm.
4. **Flow:** long or tangled sentences, repetition, weak transitions, especially in openings,
   transitions and endings, where the author's voice shows most.
5. **Everything:** title, description, headings, alt text, code comments and the text inside the
   `.pt-br.svg` diagrams.

Don't change meaning, facts, code, links or structure. Keep the casual first person.

For each file, a list ordered by importance, each finding as:
- **Atual:** the exact current text
- **Problema:** one line: calque, register, lexical, terminology or flow
- **Sugestão:** your rewrite

Then a 2–4 sentence verdict (is the concern justified, how badly), and a glossary table of the
recurring terms with your recommended PT-BR choice. Write the review in Portuguese.
