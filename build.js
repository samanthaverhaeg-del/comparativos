// build.js
// Lê o campanha.json de cada pasta de campanha e gera:
//  - <pasta-da-campanha>/index.html  (lista de comparativos daquela campanha)
//  - index.html na raiz              (lista de todas as campanhas)
//
// Rodar com: node build.js
// (o workflow do GitHub Actions faz isso automaticamente a cada push)

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const IGNORE = new Set([".git", ".github", "assets", "node_modules"]);

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function findCampaignDirs() {
  return fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !IGNORE.has(d.name))
    .map((d) => d.name)
    .filter((name) => fs.existsSync(path.join(ROOT, name, "campanha.json")));
}

function loadCampaign(dirName) {
  const jsonPath = path.join(ROOT, dirName, "campanha.json");
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  data._dir = dirName;
  data.comparativos = data.comparativos || [];
  return data;
}

const HEAD_AUTH = `<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@200;300;400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{{DEPTH}}assets/auth.css">
<script src="{{DEPTH}}assets/auth.js" defer></script>`;

const SHARED_STYLE = `
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#141517; color:#E6E7EA; font-family:'Lexend', Arial, Helvetica, sans-serif; min-height:100vh; }
  .header { position:relative; padding:56px 40px 40px; overflow:hidden; border-bottom:1px solid #2C2D30; }
  .header-accent { position:absolute; top:0; right:0; height:100%; opacity:0.9; }
  .kicker { font-weight:500; font-size:13px; letter-spacing:2px; text-transform:uppercase; color:#FB653D; margin-bottom:12px; }
  h1 { font-weight:300; font-size:36px; color:#FFFFFF; position:relative; z-index:1; }
  .subtitle { font-weight:400; font-size:15px; color:#9A9DA1; margin-top:10px; max-width:520px; position:relative; z-index:1; }
  .back-link { display:inline-block; font-size:13px; color:#7D8083; text-decoration:none; margin-bottom:18px; }
  .back-link:hover { color:#FB653D; }
  .container { max-width:960px; margin:0 auto; padding:32px 40px 80px; }
  .list { border-top:1px solid #2C2D30; }
  .row { display:flex; align-items:center; gap:24px; padding:22px 8px; border-bottom:1px solid #2C2D30; text-decoration:none; color:inherit; transition:background 0.15s ease; }
  .row:hover { background:#1B1C1F; }
  .row-tail { flex-shrink:0; width:4px; height:36px; background:#FF4719; transform:skewX(-18deg); opacity:0.85; }
  .row-main { flex:1; min-width:0; }
  .row-name { font-weight:400; font-size:17px; color:#FFFFFF; margin-bottom:4px; }
  .row-meta { display:flex; gap:16px; font-size:13px; color:#7D8083; }
  .badge { flex-shrink:0; font-weight:500; font-size:12px; letter-spacing:0.5px; text-transform:uppercase; padding:6px 14px; border-radius:20px; background:#F3F4F8; color:#141517; white-space:nowrap; }
  .date { flex-shrink:0; font-weight:400; font-size:13px; color:#B2B4B6; width:90px; text-align:right; }
  .arrow { flex-shrink:0; color:#63666A; font-size:18px; }
  .empty-note { padding:40px 8px; color:#63666A; font-size:14px; font-style:italic; }
  @media (max-width:640px) {
    .header{padding:40px 20px 28px;} .container{padding:24px 20px 60px;} h1{font-size:28px;}
    .row{flex-wrap:wrap; gap:8px 16px;} .row-meta{flex-wrap:wrap;} .date{width:auto; text-align:left; order:3;}
  }
</style>`;

function renderRow({ href, name, metaLeft, badge, date }) {
  return `    <a class="row" href="${escapeHtml(href)}">
      <div class="row-tail"></div>
      <div class="row-main">
        <div class="row-name">${escapeHtml(name)}</div>
        <div class="row-meta"><span>${escapeHtml(metaLeft)}</span></div>
      </div>
      <span class="badge">${escapeHtml(badge)}</span>
      <span class="date">${escapeHtml(date || "—")}</span>
      <span class="arrow">→</span>
    </a>`;
}

function renderPage({ depth, kickerText, title, subtitle, backLink, rowsHtml }) {
  const head = HEAD_AUTH.replace(/{{DEPTH}}/g, depth);
  const back = backLink
    ? `<a class="back-link" href="${escapeHtml(backLink)}">← Todas as campanhas</a>`
    : "";
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)} — Qive</title>
${head}
${SHARED_STYLE}
</head>
<body>

<div class="header">
  <svg class="header-accent" width="220" height="100%" viewBox="0 0 220 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <polygon points="120,0 190,0 100,300 30,300" fill="#FF4719" opacity="0.12"/>
    <polygon points="170,60 220,60 140,300 90,300" fill="#FF4719" opacity="0.08"/>
  </svg>
  <div class="kicker">${escapeHtml(kickerText)}</div>
  <h1>${escapeHtml(title)}</h1>
  <p class="subtitle">${escapeHtml(subtitle)}</p>
</div>

<div class="container">
  ${back}
  <div class="list">
${rowsHtml || '    <div class="empty-note">Nenhum item cadastrado ainda.</div>'}
  </div>
</div>

</body>
</html>
`;
}

function build() {
  const campaignDirs = findCampaignDirs();
  const campaigns = campaignDirs.map(loadCampaign);

  // Gera a página de cada campanha
  campaigns.forEach((camp) => {
    const rows = camp.comparativos
      .map((c) =>
        renderRow({
          href: c.arquivo,
          name: c.nome,
          metaLeft: `Canal: ${c.canal}`,
          badge: c.canal,
          date: c.data,
        })
      )
      .join("\n");

    const html = renderPage({
      depth: "../",
      kickerText: "Growth Marketing · Qive",
      title: camp.nome,
      subtitle: `${camp.comparativos.length} comparativo(s) desta campanha.`,
      backLink: "../index.html",
      rowsHtml: rows,
    });

    fs.writeFileSync(path.join(ROOT, camp._dir, "index.html"), html, "utf8");
    console.log(`Gerado: ${camp._dir}/index.html`);
  });

  // Gera a página raiz com a lista de campanhas
  const rootRows = campaigns
    .map((camp) => {
      const datas = camp.comparativos.map((c) => c.data).filter(Boolean);
      const ultimaData = datas.length ? datas[datas.length - 1] : "—";
      return renderRow({
        href: `${camp._dir}/index.html`,
        name: camp.nome,
        metaLeft: `${camp.comparativos.length} comparativo(s)`,
        badge: "Campanha",
        date: ultimaData,
      });
    })
    .join("\n");

  const rootHtml = renderPage({
    depth: "",
    kickerText: "Growth Marketing · Qive",
    title: "Comparativos",
    subtitle: "Análises de resultados e testes A/B de campanhas.",
    backLink: null,
    rowsHtml: rootRows,
  });

  fs.writeFileSync(path.join(ROOT, "index.html"), rootHtml, "utf8");
  console.log("Gerado: index.html (raiz)");
}

build();
