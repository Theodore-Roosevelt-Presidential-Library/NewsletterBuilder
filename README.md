# TRPL Newsletter Builder

A simple, clean email newsletter builder for the Theodore Roosevelt Presidential Library.
Mirrors the Library's classic MailChimp newsletter design and exports HTML ready to paste
into Constant Contact's "Code your own" editor. Runs entirely in the browser — no backend.

**Live:** https://newsletter.labs.trlibrary.com

## Using it

1. Click **Template** for the standard Library layout, or add blocks from the left panel.
2. Click any block to edit its content in the right panel. Use ↑ ↓ to reorder, ⧉ to duplicate, ✕ to delete.
3. Images: upload to Constant Contact's library (or the DAM) first, then paste the URL.
4. **Get HTML for Constant Contact** → copy → Constant Contact → new email → *Code your own* → paste.
5. **Save HTML file** downloads the email with the design data embedded — reopen it later
   with **Open file…** to keep editing. Work also autosaves in your browser.

### Header Studio

`header.html` (linked from the builder toolbar) generates branded email headers:
drop in a photo, it composites the TRPL wordmark plaque on top in brand colors —
the same look as the Canva "Email Headers" template. Drag to reposition, pick plaque
and wordmark colors, download the PNG, upload it to Constant Contact's library, and
paste the URL into a hero block.

Claude can build newsletters and headers here too — see [CLAUDE.md](CLAUDE.md).

## Hosting (GitHub Pages)

- Repo Settings → Pages → deploy from `main` branch, root folder.
- `CNAME` is set to `newsletter.labs.trlibrary.com`; add a DNS CNAME record pointing
  `newsletter.labs` → `<username>.github.io`, then enable "Enforce HTTPS".
