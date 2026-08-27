/* TRPL Newsletter Builder — regression smoke test.
   Run: npm i jsdom && node tests/smoke.js  (from the repo root) */
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");

let ok = true;
const check = (n, v) => { console.log((v ? "PASS" : "FAIL") + " " + n); if (!v) ok = false; };

function load(file) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  return new JSDOM(html, { runScripts: "dangerously", url: "https://newsletter.labs.trlibrary.com/" });
}

/* ---------- builder ---------- */
const dom = load("index.html");
setTimeout(() => {
  const NB = dom.window.NB, d = dom.window.document, W = dom.window;

  check("NB API present", !!NB && typeof NB.exportHTML === "function");
  check("agent hint visible", d.getElementById("agent-hint").textContent.includes("AI agents"));
  check("NB.help exists", typeof NB.help === "function");

  NB.loadTemplate();
  NB.setTitle("Smoke Test");
  NB.setPreheader("Preview line");
  const out = NB.exportHTML();
  const body = out.split("NEWSLETTER-BUILDER-DATA")[0];

  check("doctype + 660 card", out.startsWith("<!DOCTYPE html>") && out.includes('width="660"'));
  check("brand fonts linked", out.includes("Oswald") && out.includes("Alegreya") && out.includes("Source+Sans+3"));
  check("trackingImage after body", /<body[^>]*>\s*\[\[trackingImage\]\]/.test(body));
  check("footer: logo, contact, merge tags", body.includes("trpl-wordmark-horizontal-white.png")
    && body.includes("trlibrary.com/contact") && body.includes("[[account.OrganizationName]]"));
  check("footer: CC compliance links", body.includes('href="[[unsubscribe]]"')
    && body.includes('href="[[updateLink]]"') && body.includes('href="[[ViewAsWebPage]]"'));
  check("no CC-forbidden sequences", !out.includes("[#") && !out.includes("${") && !out.includes("<@"));

  // round trip
  const n = NB.getState().blocks.length;
  NB.setState({ title: "x", blocks: [] });
  check("b64 round-trip", NB.importHTML(out) && NB.getState().title === "Smoke Test"
    && NB.getState().blocks.length === n && NB.getState().preheader === "Preview line");

  // legacy logo migration
  NB.setState({ title: "old", blocks: [{ type: "logo", props: { src: "https://x/l.png" } }] });
  check("legacy logo -> header", NB.getState().blocks[0].type === "header");

  // rich text sanitizer
  NB.setState({ title: "t", blocks: [{ type: "text", props: { html:
    'A <strong>b</strong> <a href="https://trlibrary.com">l</a> <a href="javascript:x">bad</a><ul><li>i</li></ul><script>x</script>' } }] });
  const rt = NB.exportHTML().split("NEWSLETTER-BUILDER-DATA")[0];
  check("sanitizer: keeps b/a/ul, strips js/script", rt.includes("<b>b</b>")
    && rt.includes('href="https://trlibrary.com"') && !rt.includes("javascript:")
    && rt.includes("<ul style=") && !rt.includes("<script"));

  // local images
  const px = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  NB.loadTemplate();
  const hid = NB.getState().blocks[0].id;
  NB.updateField(hid, "src", px);
  check("listLocalImages + badge", NB.listLocalImages().length === 1
    && d.querySelectorAll(".localbadge").length === 1);
  NB.updateField(hid, "src", "https://files.constantcontact.com/x.png");
  check("hosted URL clears badge", NB.listLocalImages().length === 0);

  // link tool (no native prompt)
  check("no window.prompt in page", !fs.readFileSync(path.join(root, "index.html"), "utf8").includes("window.prompt"));
  NB.setState({ title: "t", blocks: [{ type: "text", props: { html: "Visit the Library today" } }] });
  const tb = NB.getState().blocks[0];
  d.querySelector(`[data-block-id="${tb.id}"]`).dispatchEvent(new W.MouseEvent("click", { bubbles: true }));
  const ed = d.querySelector("#inspector [data-richfield='html']");
  const range = d.createRange();
  const i0 = ed.firstChild.nodeValue.indexOf("Library");
  range.setStart(ed.firstChild, i0); range.setEnd(ed.firstChild, i0 + 7);
  const sel = W.getSelection(); sel.removeAllRanges(); sel.addRange(range);
  [...d.querySelectorAll("#inspector .rtbar button")].find(b => b.dataset.cmd === "link")
    .dispatchEvent(new W.MouseEvent("click", { bubbles: true }));
  d.querySelector("[data-testid='rt-link-url-html']").value = "https://www.trlibrary.com/visit";
  d.querySelector("[data-testid='rt-link-apply-html']").dispatchEvent(new W.MouseEvent("click", { bubbles: true }));
  check("inline link tool applies", NB.getState().blocks[0].props.html
    === 'Visit the <a href="https://www.trlibrary.com/visit">Library</a> today');

  /* ---------- header studio ---------- */
  const dom2 = load("header.html");
  setTimeout(() => {
    const H = dom2.window.HDR, d2 = dom2.window.document;
    check("HDR API present", !!H && typeof H.exportDataURL === "function" && typeof H.help === "function");
    check("HDR agent hint", d2.getElementById("agent-hint").textContent.includes("AI agents"));
    check("swatches", d2.querySelectorAll("#plaque-swatches .sw").length === 9
      && d2.querySelectorAll("#mark-swatches .sw").length === 6);
    check("llms.txt exists & mentions NB + HDR", (() => {
      const t = fs.readFileSync(path.join(root, "llms.txt"), "utf8");
      return t.includes("window.NB") && t.includes("window.HDR") && t.includes("[[trackingImage]]");
    })());
    console.log(ok ? "\nALL PASS" : "\nFAILURES");
    process.exit(ok ? 0 : 1);
  }, 300);
}, 300);
