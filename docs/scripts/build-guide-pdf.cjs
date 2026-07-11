/**
 * Build branded A4 PDF from docs/xpeacock-platform-user-guide.md
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const MD_PATH = path.join(ROOT, 'docs/xpeacock-platform-user-guide.md');
const OUT_PDF = path.join(ROOT, 'docs/xpeacock-platform-user-guide.pdf');
const OUT_HTML = path.join(ROOT, 'docs/xpeacock-platform-user-guide.html');
const LOGO = path.join(ROOT, 'public/brand/logo-wordmark.png');

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function mdToHtml(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;
  let inList = false;
  let inTable = false;
  let inCode = false;
  let codeBuf = [];

  const closeList = () => {
    if (inList) {
      out.push('</ul>');
      inList = false;
    }
  };
  const closeTable = () => {
    if (inTable) {
      out.push('</tbody></table>');
      inTable = false;
    }
  };

  const inline = (text) => {
    let t = escapeHtml(text);
    t = t.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
      const abs = path.isAbsolute(src) ? src : path.join(ROOT, 'docs', src);
      const fileUrl = 'file://' + abs;
      return `<figure class="shot"><img src="${fileUrl}" alt="${escapeHtml(alt)}" /><figcaption>${escapeHtml(alt)}</figcaption></figure>`;
    });
    t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
    return t;
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (inCode) {
        out.push(`<pre><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>`);
        codeBuf = [];
        inCode = false;
      } else {
        closeList();
        closeTable();
        inCode = true;
      }
      i++;
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      i++;
      continue;
    }

    if (/^\|/.test(line)) {
      closeList();
      const cells = line
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim());
      const isSep = cells.every((c) => /^:?-+:?$/.test(c));
      if (!inTable && !isSep) {
        out.push('<table><thead><tr>' + cells.map((c) => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>');
        inTable = true;
      } else if (isSep) {
        // skip separator
      } else {
        out.push('<tr>' + cells.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>');
      }
      i++;
      continue;
    } else {
      closeTable();
    }

    if (/^---+$/.test(line.trim())) {
      closeList();
      out.push('<hr />');
      i++;
      continue;
    }

    const h = line.match(/^(#{1,3})\s+(.+)$/);
    if (h) {
      closeList();
      const level = h[1].length;
      const id = h[2]
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      out.push(`<h${level} id="${id}">${inline(h[2])}</h${level}>`);
      i++;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      if (!inList) {
        out.push('<ul>');
        inList = true;
      }
      out.push(`<li>${inline(line.replace(/^[-*]\s+/, ''))}</li>`);
      i++;
      continue;
    } else {
      closeList();
    }

    if (!line.trim()) {
      i++;
      continue;
    }

    // Image-only paragraph
    if (/^!\[/.test(line.trim())) {
      out.push(inline(line.trim()));
      i++;
      continue;
    }

    out.push(`<p>${inline(line)}</p>`);
    i++;
  }
  closeList();
  closeTable();
  return out.join('\n');
}

function wrapHtml(body) {
  const logoUrl = 'file://' + LOGO;
  const date = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>xpeacock Platform User Guide</title>
<style>
  @page { size: A4; margin: 18mm 16mm 20mm; }
  :root {
    --bg: #0b0b0c;
    --panel: #141416;
    --text: #f2f2f3;
    --muted: #a0a0a8;
    --red: #e30000;
    --border: rgba(255,255,255,0.08);
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    color: var(--text);
    background: var(--bg);
    font-size: 11pt;
    line-height: 1.55;
  }
  .cover {
    page-break-after: always;
    min-height: 240mm;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 24mm 10mm;
    background:
      radial-gradient(ellipse at 20% 0%, rgba(227,0,0,0.28), transparent 55%),
      linear-gradient(180deg, #121214 0%, #0b0b0c 100%);
  }
  .cover img.logo { width: 220px; height: auto; margin-bottom: 28px; }
  .cover h1 {
    font-size: 30pt;
    margin: 0 0 12px;
    letter-spacing: -0.02em;
  }
  .cover .sub { color: var(--muted); font-size: 12pt; max-width: 420px; line-height: 1.5; }
  .cover .meta {
    margin-top: 40px;
    color: var(--muted);
    font-size: 9.5pt;
  }
  .badge {
    display: inline-block;
    margin-top: 16px;
    padding: 5px 10px;
    border: 1px solid var(--red);
    color: var(--red);
    font-size: 8.5pt;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  h1, h2, h3 { page-break-after: avoid; }
  h1 { font-size: 16pt; border-bottom: 2px solid var(--red); padding-bottom: 6px; margin-top: 20px; }
  h2 { font-size: 12.5pt; color: #fff; margin-top: 16px; }
  h3 { font-size: 11pt; color: #eee; margin-top: 12px; }
  p { margin: 6px 0; color: #e6e6ea; font-size: 10pt; }
  ul { margin: 8px 0 12px 18px; }
  li { margin: 4px 0; }
  a { color: #ff6b6b; text-decoration: none; }
  code, pre {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 9.5pt;
  }
  code { background: #1c1c20; padding: 1px 5px; border-radius: 4px; }
  pre {
    background: #1c1c20;
    border: 1px solid var(--border);
    padding: 12px;
    border-radius: 8px;
    overflow: hidden;
    white-space: pre-wrap;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0 18px;
    font-size: 9.5pt;
    page-break-inside: avoid;
  }
  th, td {
    border: 1px solid var(--border);
    padding: 8px 10px;
    text-align: left;
    vertical-align: top;
  }
  th { background: #1a1a1e; color: #fff; }
  tr:nth-child(even) td { background: rgba(255,255,255,0.02); }
  figure.shot {
    margin: 10px 0 16px;
    page-break-inside: avoid;
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
    max-height: 210mm;
  }
  figure.shot img {
    display: block;
    width: 100%;
    height: auto;
    max-height: 195mm;
    object-fit: contain;
    object-position: top;
    background: #000;
  }
  figcaption {
    padding: 6px 10px;
    font-size: 8pt;
    color: var(--muted);
    border-top: 1px solid var(--border);
  }
  table { font-size: 9pt; }
  th, td { padding: 6px 8px; }
  hr { border: none; border-top: 1px solid var(--border); margin: 24px 0; }
  .toc a { color: var(--text); }
  .footer-note { color: var(--muted); font-size: 9pt; margin-top: 40px; }
</style>
</head>
<body>
  <section class="cover">
    <img class="logo" src="${logoUrl}" alt="xpeacock" />
    <h1>Platform User Guide</h1>
    <p class="sub">Complete operations guide for Viewers, Creators, Admins, and Superadmins.</p>
    <div class="badge">Confidential — Client Handover</div>
    <p class="meta">Version 1.0 · ${date}<br/>Product: xpeacock streaming platform</p>
  </section>
  <main>
    ${body}
    <p class="footer-note">© ${new Date().getFullYear()} xpeacock. Screenshots captured from the live product UI. Re-run <code>docs/scripts/capture-user-guide.cjs</code> after major UI changes.</p>
  </main>
</body>
</html>`;
}

async function main() {
  if (!fs.existsSync(MD_PATH)) {
    console.error('Missing markdown:', MD_PATH);
    process.exit(1);
  }
  const md = fs.readFileSync(MD_PATH, 'utf8');
  // Strip leading H1 (cover already has title)
  const mdBody = md.replace(/^#\s+[^\n]+\n+/, '');
  const html = wrapHtml(mdToHtml(mdBody));
  fs.writeFileSync(OUT_HTML, html);
  console.log('[pdf] wrote', OUT_HTML);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('file://' + OUT_HTML, { waitUntil: 'load' });
  await page.pdf({
    path: OUT_PDF,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `<div style="font-size:8px;width:100%;padding:0 16mm;color:#888;font-family:sans-serif;">xpeacock Platform User Guide</div>`,
    footerTemplate: `<div style="font-size:8px;width:100%;padding:0 16mm;color:#888;font-family:sans-serif;display:flex;justify-content:space-between;"><span>Confidential</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
    margin: { top: '16mm', bottom: '18mm', left: '14mm', right: '14mm' },
  });
  await browser.close();
  console.log('[pdf] wrote', OUT_PDF);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
