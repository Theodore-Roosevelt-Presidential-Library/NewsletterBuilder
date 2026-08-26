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
  { type: "header",  props: { src: "https://…/header.png", alt: "Theodore Roosevelt Presidential Library", href: "https://www.trlibrary.com" } },
  { type: "heading", props: { text: "The Library is Now Open!" } },
  { type: "text",    props: { html: "Body copy. Allowed tags: <b> <i> <u> <br> <ul>/<ol>/<li> and <a href=\"https://…\">links</a>. Anything else is stripped." } },
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

Block types: `header, hero, heading, text, button, image, columns, divider, spacer, footer`.
The `header` block is the newsletter's top banner: a 3:1 branded graphic generated in
Header Studio (photo + wordmark plaque). Legacy `logo` blocks in old files auto-migrate
to `header`. Use `hero`/`image` for story photos further down.

`text` blocks (and column text) support rich content: in the UI there's a WYSIWYG toolbar
(bold/italic/underline, links, bulleted & numbered lists); via the API just set `html`
with the whitelisted tags above.

The `footer` block props: `logoSrc` (white horizontal wordmark, default
`https://newsletter.labs.trlibrary.com/assets/trpl-wordmark-horizontal-white.png`),
`logoAlt, siteUrl, contactLabel, contactUrl` (default `https://www.trlibrary.com/contact`),
`org, address` (default to Constant Contact account merge tags — see below), `note`.

## Constant Contact merge tags & hard requirements

The export automatically inserts CC's required `[[trackingImage]]` right after `<body>` —
don't add it again. CC appends its own unsubscribe/compliance footer at send time.

Personalization tags work anywhere in text: `[[FIRSTNAME OR "Friend"]]`, `[[LASTNAME]]`,
`[[EMAILADDRESS]]`, `[[CITY]]`, `[[CUSTOM.<field_name>]]`, and account tags
`[[account.OrganizationName]]`, `[[account.AddressLine1]]`, `[[account.City]]`,
`[[account.usState]]`, `[[account.PostalCode]]`, `[[account.SiteURL]]`. The builder
preview shows the raw tags; the export keeps them for CC to fill at send time.

Hard limits (CC rejects otherwise): total HTML ≤ 400 KB; must not contain the character
sequences `[#`, `${`, or `<@`. The export modal checks all of these, and the builder's
embedded round-trip state is base64-encoded to stay clear of them.

Claude can also work entirely offline: generate the same email HTML by opening
`index.html` locally, or hand Matt a state JSON — the builder's **Open file…** accepts
raw JSON (`{title, preheader, blocks}`) as well as any HTML file the tool saved/exported
(state is embedded in an `<!--NEWSLETTER-BUILDER-DATA … -->` comment for round-trip editing).

## Images: drag-drop and hosting in Constant Contact

Matt can drag-drop / paste / file-pick images onto `header`, `hero`, `image`, and
`columns` blocks. Dropped images are resized (max 1800px) and embedded as **data URLs**
— they preview perfectly but are **not email-safe** (Gmail/Outlook strip them). Blocks
with embedded images show an "unhosted image" badge, and the export modal lists them.

**Claude should host these images.** With the Constant Contact connector available,
the workflow is:

1. `NB.listLocalImages()` → `[{id, type, field, filename, approxKB}]`
2. `NB.getState()` → read the data URL at that block's `props[field]`
3. Upload via the Constant Contact MCP tool `uploadMyLibraryFile`
   (`filename`, `url` = the data URL — it accepts base64 data URLs directly);
   the result includes `external_url`, a public CDN URL
4. `NB.updateField(id, field, external_url)` — badge clears automatically
5. Repeat until `NB.listLocalImages()` is empty, then export

The same connector trick works for Header Studio: `await HDR.exportDataURL()` →
`uploadMyLibraryFile` → paste `external_url` into the header block's `src`.

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

## Header Studio (`header.html`)

Generates branded email header graphics (the pattern from the Library's Canva
"Email Headers" template): a full-bleed photo in the 3:1 header shape with the official
TRPL wordmark on a solid plaque centered on top. The wordmark SVG is inlined
(`assets/trpl-wordmark.svg` is the source) and recolorable.

Brand colors (TRPL Brand Guidelines p.12) — plaque/backgrounds: Night Sky `#092A4D`,
Dark Forest `#1B4532`, Dark Gray `#25282A`, Black, Sand `#D1CCBD`, Deep Orange `#E7805D`,
Bright Forest `#8FC895`, White. Accent colors (`#F9D635`, `#87BB41`, `#F36079`, `#FC924E`,
`#99ADC5`) are for headline text only, never backgrounds. Wordmark is normally white;
use Dark Gray/Night Sky on light plaques.

Automation API: `window.HDR`

```js
await HDR.setImage("https://…/photo.jpg");     // must allow CORS or export will fail;
                                               // local file/drag-drop always works
await HDR.setOptions({ plaque:"#1B4532", mark:"#FFFFFF", scale:0.78, yoff:0,
                       zoom:1.2, panX:0, panY:-40, dim:15, outW:1800, outH:600 });
const png = await HDR.exportDataURL();         // PNG data URL
HDR.getOptions(); HDR.palette;                 // introspection
```

UI hooks: `data-testid` on `btn-download, btn-copy, drop, url-input, url-go, zoom, dim,
scale, yoff, size`, plus `btn-header-studio` (link inside the header block's inspector
panel in the builder — select a header block to see it) and `btn-back` (link back).
The generated PNG must be uploaded to Constant Contact's image library (or the DAM);
then paste its hosted URL into the newsletter builder's hero block.

## Publishing to Constant Contact

Export → copy HTML → Constant Contact → new email → **Code your own** → paste.
Constant Contact appends its own unsubscribe footer; the builder's footer block covers
org name/address/small print only.
