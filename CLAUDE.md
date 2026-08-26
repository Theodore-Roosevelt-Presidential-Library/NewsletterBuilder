# TRPL Newsletter Builder — guide for Claude

A single-page newsletter builder for the Theodore Roosevelt Presidential Library, hosted at
**https://newsletter.labs.trlibrary.com** (GitHub Pages, `index.html` is the entire app).

It mirrors the Library's MailChimp design system: 660px white card on #f4f4f4, DM Sans
31px bold centered headings, Helvetica Neue 16px body, square black uppercase buttons,
2px #D1D1D1 dividers. Export produces Constant Contact-ready email HTML.

## How Claude should build a newsletter

Open the site in Chrome (Claude-in-Chrome tools), then use the JavaScript automation API —
**do not** try to drag and drop; there is no drag and drop. Everything is scriptable via
`window.NB`:

```js
NB.setTitle("July Newsletter");
NB.setPreheader("News from the Theodore Roosevelt Presidential Library");
NB.loadTemplate();                          // standard TR Library layout, or build from scratch:
NB.setState({ title: "...", preheader: "...", blocks: [
  { type: "logo",    props: { src: "https://…/logo.png", href: "https://www.trlibrary.com" } },
  { type: "hero",    props: { src: "https://…/hero.jpg", alt: "…" } },
  { type: "heading", props: { text: "The Library is Now Open!" } },
  { type: "text",    props: { html: "Body copy. Allowed inline tags: <b> <i> <u> <br> and <a href=\"https://…\">links</a>." } },
  { type: "button",  props: { label: "GET TICKETS", href: "https://…" } },
  { type: "divider" },
  { type: "columns", props: { cols: [
      { src: "https://…", heading: "Left",  text: "…", label: "MORE", href: "https://…" },
      { src: "https://…", heading: "Right", text: "…", label: "MORE", href: "https://…" } ] } },
  { type: "footer" }
]});
const html = NB.exportHTML();               // full Constant Contact-ready email HTML
```

Full API: `NB.getState()`, `NB.setState(s)`, `NB.addBlock(type, props?, index?)`,
`NB.updateBlock(id, props)`, `NB.updateField(id, "cols.0.heading", v)`,
`NB.moveBlock(id, index)`, `NB.removeBlock(id)`, `NB.exportHTML()`,
`NB.importHTML(htmlString)`, `NB.loadTemplate()`, `NB.setTitle(t)`, `NB.setPreheader(t)`.

Block types: `logo, hero, heading, text, button, image, columns, divider, spacer, footer`.

Claude can also work entirely offline: generate the same email HTML by opening
`index.html` locally, or hand Matt a state JSON — the builder's **Open file…** accepts
raw JSON (`{title, preheader, blocks}`) as well as any HTML file the tool saved/exported
(state is embedded in an `<!--NEWSLETTER-BUILDER-DATA … -->` comment for round-trip editing).

## UI hooks (if driving the visible UI instead)

Toolbar buttons carry `data-testid`: `btn-new, btn-template, btn-load, btn-save,
btn-mobile, btn-export, btn-copy-export`, palette buttons `add-<type>`, title input
`newsletter-title`, export textarea `export-html`. Blocks in the preview carry
`data-block-id` / `data-block-type`; each has ↑ ↓ ⧉ ✕ controls. Selecting a block opens
its fields in the right-hand inspector (`data-field` attributes).

## House style (from the TRPL story guide)

- Friendly, welcoming, plain vivid language — a knowledgeable park ranger, not a professor.
- Lead with story, not institution. Short paragraphs, one idea per section, one clear CTA.
- Button labels: short, uppercase (rendered uppercase automatically): GET TICKETS, READ MORE.
- Historical claims and TR quotes must be verbatim and verified; if unsure, flag for
  verification against trlibrary.com/gpt rather than guessing.
- Images: paste hosted URLs (Constant Contact library or DAM). Hero ≥1320px wide,
  inset images ≥1224px, column images ≥564px.

## Publishing to Constant Contact

Export → copy HTML → Constant Contact → new email → **Code your own** → paste.
Constant Contact appends its own unsubscribe footer; the builder's footer block covers
org name/address/small print only.
