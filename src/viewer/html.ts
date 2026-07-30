import { readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"
import { ViewerData, COLORS } from "./types"

const d3Src = (() => {
  try {
    const dir = dirname(fileURLToPath(import.meta.url))
    return readFileSync(resolve(dir, "../src/viewer/d3.v7.min.js"), "utf-8")
  } catch {
    try {
      const dir = dirname(fileURLToPath(import.meta.url))
      return readFileSync(resolve(dir, "d3.v7.min.js"), "utf-8")
    } catch {
      return null
    }
  }
})()

export function generateHtml(viewerData: ViewerData): string {
  const jsonData = JSON.stringify(viewerData)
  const d3Tag = d3Src
    ? `<script>${d3Src}<\/script>`
    : `<script src="https://d3js.org/d3.v7.min.js"><\/script>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>toon-memory viewer</title>
<script>window.__MCP_UI__=window.__MCP_UI__||{invoke:()=>Promise.resolve({})}<\/script>
${d3Tag}
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0a0a0f;--bg2:#12121a;--bg3:#1a1a26;--border:#2a2a3a;
  --text:#e2e2ee;--muted:#8888a0;--brand:#a78bfa;--brand2:#c084fc;
  --green:#22c55e;--red:#ef4444;--blue:#3b82f6;--amber:#f59e0b;
  --pink:#ec4899;--cyan:#06b6d4;
}
html,body{height:100%;font-family:system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--text);overflow:hidden}
.app{display:grid;grid-template-rows:auto 1fr;height:100%}
header{display:flex;align-items:center;justify-content:space-between;padding:0.75rem 1.5rem;border-bottom:1px solid var(--border);background:var(--bg2)}
header h1{font-size:1.1rem;font-weight:700;background:linear-gradient(135deg,var(--brand),var(--pink));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
header .meta{display:flex;gap:1rem;font-size:0.8rem;color:var(--muted)}
header .meta span{display:flex;align-items:center;gap:0.3rem}
.main{display:grid;grid-template-columns:var(--sidebar-w,320px) 1fr;overflow:hidden;position:relative}
.sidebar{display:flex;flex-direction:column;border-right:1px solid var(--border);overflow:hidden}
.sidebar-resizer{width:4px;cursor:col-resize;background:transparent;position:absolute;left:var(--sidebar-w,320px);top:0;bottom:0;z-index:5;transition:background 0.15s}
.sidebar-resizer:hover,.sidebar-resizer:active{background:var(--brand)}
.sidebar-header{padding:0.75rem 1rem;border-bottom:1px solid var(--border);background:var(--bg2)}
.sidebar-header h2{font-size:0.85rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--muted);margin-bottom:0.5rem}
.search-box{width:100%;padding:0.5rem 0.75rem;border:1px solid var(--border);border-radius:8px;background:var(--bg3);color:var(--text);font-size:0.85rem;outline:none}
.search-box:focus{border-color:var(--brand)}
.filter-row{display:flex;gap:0.4rem;margin-top:0.5rem;flex-wrap:wrap}
.filter-btn{padding:0.2rem 0.5rem;border:1px solid var(--border);border-radius:6px;background:transparent;color:var(--muted);font-size:0.7rem;cursor:pointer;transition:all 0.15s}
.filter-btn:hover,.filter-btn.active{border-color:var(--brand);color:var(--brand);background:rgba(167,139,250,0.1)}
.entries-list{flex:1;overflow-y:auto;padding:0.5rem}
.entry-item{padding:0.6rem 0.75rem;border:1px solid var(--border);border-radius:8px;margin-bottom:0.4rem;cursor:pointer;transition:all 0.15s}
.entry-item:hover{border-color:var(--brand);background:rgba(167,139,250,0.05)}
.entry-item.selected{border-color:var(--brand);background:rgba(167,139,250,0.1)}
.entry-cat{font-size:0.65rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.2rem}
.entry-cat.decision{color:var(--brand)}
.entry-cat.bug{color:var(--red)}
.entry-cat.pattern{color:var(--green)}
.entry-cat.knowledge{color:var(--cyan)}
.entry-cat.architecture{color:var(--amber)}
.entry-key{font-size:0.85rem;font-weight:600;margin-bottom:0.15rem}
.entry-preview{font-size:0.75rem;color:var(--muted);line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.entry-tags{display:flex;gap:0.25rem;margin-top:0.3rem;flex-wrap:wrap}
.entry-tag{font-size:0.6rem;padding:0.1em 0.35rem;border-radius:3px;background:var(--bg3);color:var(--muted);font-family:monospace}
.viewer-area{display:flex;flex-direction:column;overflow:hidden}
.tabs{display:flex;border-bottom:1px solid var(--border);background:var(--bg2);padding:0 1rem}
.tab{padding:0.6rem 1rem;font-size:0.8rem;font-weight:500;color:var(--muted);cursor:pointer;border-bottom:2px solid transparent;transition:all 0.15s}
.tab:hover{color:var(--text)}
.tab.active{color:var(--brand);border-bottom-color:var(--brand)}
.tab-content{flex:1;overflow:hidden;position:relative}
.tab-panel{display:none;width:100%;height:100%;overflow:auto}
.tab-panel.active{display:block}
.graph-container{width:100%;height:100%;min-height:300px;background:var(--bg);position:relative}
.graph-container::before{content:'';position:absolute;inset:0;background-image:radial-gradient(var(--border) 1px,transparent 1px);background-size:24px 24px;opacity:0.3;pointer-events:none;z-index:0}
.graph-container svg{width:100%;height:100%;position:relative;z-index:1}
.node-circle{cursor:pointer;transition:r 0.2s ease,opacity 0.2s ease,filter 0.2s ease,stroke 0.2s ease}
.node-circle:hover{filter:brightness(1.3) drop-shadow(0 0 6px color-mix(in srgb,currentColor 60%,transparent))}
.node-circle.glow{filter:drop-shadow(0 0 12px var(--brand)) brightness(1.5)}
.node-circle.selected{stroke:var(--brand);stroke-width:3;filter:drop-shadow(0 0 14px var(--brand)) brightness(1.3)}
.node-label{font-size:9px;font-family:monospace;fill:var(--text);pointer-events:none;text-anchor:middle;transition:opacity 0.2s ease;font-weight:500;letter-spacing:0.02em}
.link{stroke:var(--border);stroke-opacity:0.4;transition:all 0.2s ease;cursor:pointer}
.link:hover{stroke-opacity:0.9;stroke-width:3}
.link.highlighted{stroke:var(--brand);stroke-opacity:0.9;stroke-width:2.5}
.link.faded{stroke-opacity:0.04}
.node-ring{fill:none;stroke-width:2;opacity:0;transition:opacity 0.3s ease,r 0.3s ease}
.node-ring.visible{opacity:0.6}
.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;padding:1.5rem}
.stat-card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:1.25rem}
.stat-card h3{font-size:0.8rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--muted);margin-bottom:0.75rem}
.stat-big{font-size:2rem;font-weight:800;background:linear-gradient(135deg,var(--brand),var(--pink));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.bar-chart{display:flex;flex-direction:column;gap:0.4rem}
.bar-row{display:flex;align-items:center;gap:0.5rem}
.bar-label{font-size:0.75rem;color:var(--muted);width:80px;text-align:right;flex-shrink:0}
.bar-track{flex:1;height:20px;background:var(--bg3);border-radius:4px;overflow:hidden}
.bar-fill{height:100%;border-radius:4px;transition:width 0.6s cubic-bezier(0.16,1,0.3,1)}
.bar-value{font-size:0.7rem;color:var(--muted);width:30px}
.tag-cloud{display:flex;flex-wrap:wrap;gap:0.4rem}
.tag-pill{padding:0.25rem 0.6rem;border-radius:6px;font-size:0.75rem;font-family:monospace;border:1px solid var(--border);color:var(--muted);transition:all 0.15s}
.tag-pill:hover{border-color:var(--brand);color:var(--brand)}
.detail-panel{padding:1.5rem;max-width:700px}
.detail-panel h2{font-size:1.2rem;font-weight:700;margin-bottom:0.5rem}
.detail-panel .detail-cat{font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:1rem}
.detail-field{margin-bottom:1rem}
.detail-field label{display:block;font-size:0.75rem;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.3rem}
.detail-field .value{font-size:0.9rem;line-height:1.6}
.detail-field .value.mono{font-family:monospace;background:var(--bg3);padding:0.5rem;border-radius:6px;display:block;overflow-x:auto;white-space:pre-wrap}
.detail-links{display:flex;gap:0.4rem;flex-wrap:wrap}
.detail-link{padding:0.2rem 0.5rem;border:1px solid var(--border);border-radius:6px;font-size:0.75rem;font-family:monospace;color:var(--brand);cursor:pointer;transition:all 0.15s}
.detail-link:hover{border-color:var(--brand);background:rgba(167,139,250,0.1)}
.empty-detail{display:flex;align-items:center;justify-content:center;height:100%;color:var(--muted);font-size:0.9rem}
.graph-legend{position:absolute;bottom:3.5rem;left:0.5rem;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:0.75rem;font-size:0.7rem;z-index:10}
.legend-item{display:flex;align-items:center;gap:0.4rem;margin-bottom:0.25rem}
.legend-dot{width:10px;height:10px;border-radius:50%}
.graph-controls{position:absolute;top:1rem;right:1rem;display:flex;gap:0.4rem;z-index:10}
.graph-btn{width:32px;height:32px;border:1px solid var(--border);border-radius:6px;background:var(--bg2);color:var(--text);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1rem;transition:all 0.15s}
.graph-btn:hover{border-color:var(--brand);color:var(--brand)}
.tooltip{position:fixed;pointer-events:none;background:rgba(18,18,26,0.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid var(--border);border-radius:12px;padding:0.75rem 1rem;font-size:0.75rem;max-width:320px;z-index:1000;box-shadow:0 8px 32px rgba(0,0,0,0.5)}
.tooltip .tt-cat{font-size:0.6rem;font-weight:600;text-transform:uppercase;margin-bottom:0.2rem}
.tooltip .tt-key{font-weight:600;margin-bottom:0.2rem}
.tooltip .tt-content{color:var(--muted);line-height:1.4;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.tooltip .tt-score{margin-top:0.3rem;font-size:0.65rem;color:var(--brand)}
.tooltip .tt-edge{font-size:0.65rem;color:var(--muted);margin-top:0.3rem;padding-top:0.3rem;border-top:1px solid var(--border)}
.timeline-container{padding:1.5rem;overflow-y:auto;height:100%}
.timeline-header{font-size:1rem;font-weight:700;margin-bottom:1rem;color:var(--text)}
.timeline-track{position:relative;padding-left:2rem}
.timeline-line{position:absolute;left:0.5rem;top:0;bottom:0;width:2px;background:var(--border)}
.timeline-entry{position:relative;margin-bottom:1rem;padding:0.6rem 0.8rem;border:1px solid var(--border);border-radius:8px;background:var(--bg2);transition:all 0.15s;cursor:pointer}
.timeline-entry:hover{border-color:var(--brand)}
.timeline-entry::before{content:'';position:absolute;left:-1.75rem;top:0.8rem;width:10px;height:10px;border-radius:50%;border:2px solid var(--border);background:var(--bg)}
.timeline-entry .tl-date{font-size:0.65rem;color:var(--muted);margin-bottom:0.2rem}
.timeline-entry .tl-cat{font-size:0.6rem;font-weight:600;text-transform:uppercase}
.timeline-entry .tl-key{font-size:0.85rem;font-weight:600}
.timeline-entry .tl-content{font-size:0.75rem;color:var(--muted);margin-top:0.2rem}
.export-btn{padding:0.3rem 0.6rem;border:1px solid var(--border);border-radius:6px;background:var(--bg2);color:var(--text);font-size:0.7rem;cursor:pointer;transition:all 0.15s}
.export-btn:hover{border-color:var(--brand);color:var(--brand)}
.export-bar{display:flex;gap:0.4rem}
.theme-toggle{background:none;border:1px solid var(--border);border-radius:6px;padding:0.3rem 0.6rem;color:var(--text);cursor:pointer;font-size:0.8rem;transition:all 0.15s}
.theme-toggle:hover{border-color:var(--brand);color:var(--brand)}
.reload-btn{background:none;border:1px solid var(--border);border-radius:6px;padding:0.3rem 0.6rem;color:var(--muted);cursor:pointer;font-size:0.9rem;transition:all 0.15s;line-height:1}
.reload-btn:hover{border-color:var(--brand);color:var(--brand)}
.minimap{width:150px;height:100px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.3);cursor:pointer}
.minimap svg{width:100%;height:100%;display:block}
.minimap-viewport{fill:rgba(167,139,250,0.15);stroke:var(--brand);stroke-width:1.5}
.graph-right{position:absolute;bottom:1rem;right:1rem;z-index:10;display:flex;flex-direction:column;align-items:flex-end;gap:0.4rem}
.physics-panel{position:absolute;top:2.8rem;left:0.5rem;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:0.75rem;font-size:0.7rem;z-index:10;min-width:180px}
.physics-panel h4{font-size:0.7rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--muted);margin-bottom:0.5rem}
.graph-toolbar{position:absolute;top:1rem;left:0.5rem;display:flex;gap:0.4rem;z-index:11}
.physics-row{display:flex;align-items:center;gap:0.5rem;margin-bottom:0.4rem}
.physics-row label{font-size:0.65rem;color:var(--muted);width:60px;flex-shrink:0}
.physics-row input[type="range"]{flex:1;height:4px;-webkit-appearance:none;background:var(--bg3);border-radius:2px;outline:none}
.physics-row input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;border-radius:50%;background:var(--brand);cursor:pointer}
.physics-row .physics-val{font-size:0.6rem;color:var(--muted);width:30px;text-align:right}
.node-circle.search-match{filter:drop-shadow(0 0 10px var(--brand)) brightness(1.4);animation:searchPulse 1.5s ease-in-out infinite}
@keyframes searchPulse{0%,100%{filter:drop-shadow(0 0 8px var(--brand)) brightness(1.2)}50%{filter:drop-shadow(0 0 18px var(--brand)) brightness(1.7)}}
.path-btn.active{background:var(--brand);color:#fff;border-color:var(--brand)}
.path-info{position:absolute;bottom:0.5rem;left:0.5rem;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:0.4rem 0.7rem;font-size:0.7rem;z-index:10;display:none;max-width:500px;word-break:break-all}
.node-circle.path-start{stroke:var(--green);stroke-width:3;filter:drop-shadow(0 0 12px var(--green))}
.node-circle.path-end{stroke:var(--red);stroke-width:3;filter:drop-shadow(0 0 12px var(--red))}
.node-circle.path-node{stroke:var(--brand);stroke-width:2.5;animation:pathNodePulse 1.2s ease-in-out infinite}
@keyframes pathNodePulse{0%,100%{filter:drop-shadow(0 0 6px var(--brand))}50%{filter:drop-shadow(0 0 14px var(--brand))}}
.link.path-edge{stroke:var(--brand);stroke-opacity:0.9;stroke-width:3}
.light{--bg:#f4f4f9;--bg2:#ffffff;--bg3:#e8e8f0;--border:#c8c8d8;--text:#1a1a2e;--muted:#666680;--brand:#7c3aed;--brand2:#9333ea}
.light .tooltip{background:rgba(255,255,255,0.95);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-color:#c8c8d8;box-shadow:0 8px 32px rgba(0,0,0,0.1)}
.light .timeline-entry{background:#fff}
.light .graph-btn,.light .export-btn,.light .theme-toggle{background:#fff}
.light .minimap{box-shadow:0 4px 16px rgba(0,0,0,0.08)}
@media(max-width:768px){.main{grid-template-columns:1fr}.sidebar{display:none}}
</style>
</head>
<body>
<div class="app">
  <header>
    <h1>toon-memory viewer</h1>
    <div class="meta">
      <span id="totalCount"></span>
      <span id="edgeCount"></span>
      <span id="categoryCount"></span>
      <button class="theme-toggle" id="themeToggle" title="Toggle theme">☀</button>
      <button class="reload-btn" id="reloadBtn" title="Reload (r)">↻</button>
    </div>
  </header>
  <div class="main">
    <div class="sidebar">
      <div class="sidebar-header">
        <h2>Entries</h2>
        <input type="text" class="search-box" id="search" placeholder="Search entries... (/)">
        <div class="filter-row" id="filters"></div>
      </div>
      <div class="entries-list" id="entriesList"></div>
    </div>
    <div class="sidebar-resizer" id="sidebarResizer"></div>
    <div class="viewer-area">
      <div class="tabs">
        <div class="tab active" data-tab="graph">Graph</div>
        <div class="tab" data-tab="stats">Stats</div>
        <div class="tab" data-tab="timeline">Timeline</div>
        <div class="tab" data-tab="detail">Detail</div>
      </div>
      <div class="tab-content">
        <div class="tab-panel active" id="panel-graph">
          <div class="graph-container" id="graphContainer">
            <div class="graph-legend" id="legend"></div>
            <div class="graph-right">
              <div class="export-bar">
                <button class="export-btn" id="exportPng">PNG</button>
                <button class="export-btn" id="exportSvg">SVG</button>
              </div>
              <div class="minimap" id="minimap"><svg id="minimapSvg"></svg></div>
            </div>
            <div class="graph-controls">
              <button class="graph-btn" id="zoomIn" title="Zoom in (+)">+</button>
              <button class="graph-btn" id="zoomOut" title="Zoom out (-)">−</button>
              <button class="graph-btn" id="zoomReset" title="Reset (0)">⟲</button>
            </div>
            <div class="graph-toolbar">
              <button class="graph-btn" id="physicsToggle" title="Physics controls">⚙</button>
              <button class="graph-btn path-btn" id="pathToggle" title="Find path between two nodes">⇿</button>
            </div>
            <div class="physics-panel" id="physicsPanel" style="display:none">
              <h4>Graph Physics</h4>
              <div class="physics-row"><label>Charge</label><input type="range" id="chargeSlider" min="-300" max="0" value="-120" step="10"><span class="physics-val" id="chargeVal">-120</span></div>
              <div class="physics-row"><label>Distance</label><input type="range" id="distSlider" min="20" max="200" value="70" step="5"><span class="physics-val" id="distVal">70</span></div>
              <div class="physics-row"><label>Center</label><input type="range" id="centerSlider" min="0" max="1" value="0.05" step="0.01"><span class="physics-val" id="centerVal">0.05</span></div>
            </div>
            <div class="path-info" id="pathInfo"></div>
          </div>
        </div>
        <div class="tab-panel" id="panel-stats">
          <div class="stats-grid" id="statsGrid"></div>
        </div>
        <div class="tab-panel" id="panel-timeline">
          <div class="timeline-container" id="timelineContainer"></div>
        </div>
        <div class="tab-panel" id="panel-detail">
          <div class="detail-panel" id="detailPanel">
            <div class="empty-detail">Select an entry from the sidebar or click a node in the graph</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<div class="tooltip" id="tooltip" style="display:none"></div>
<script>
const DATA = ${jsonData};

const COLORS = {
  decision: '#a78bfa', bug: '#ef4444', pattern: '#22c55e',
  knowledge: '#06b6d4', architecture: '#f59e0b'
};

let selectedEntry = null;
let activeFilter = null;
let searchQuery = '';

// --- Theme Toggle ---
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('toon-viewer-theme') || 'dark';
if (savedTheme === 'light') { document.documentElement.classList.add('light'); themeToggle.textContent = '☾'; }
themeToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('light');
  const isLight = document.documentElement.classList.contains('light');
  themeToggle.textContent = isLight ? '☾' : '☀';
  localStorage.setItem('toon-viewer-theme', isLight ? 'light' : 'dark');
});

// --- Tooltip ---
const tooltip = document.getElementById('tooltip');
function showTooltip(e, d) {
  const score = d.quality || 0;
  tooltip.innerHTML =
    '<div class="tt-cat" style="color:' + (COLORS[d.category] || 'var(--muted)') + '">' + d.category + '</div>' +
    '<div class="tt-key">' + escHtml(d.id) + '</div>' +
    '<div class="tt-content">' + escHtml(d.content) + '</div>' +
    '<div class="tt-score">Quality: ' + score.toFixed(2) + ' | Access: ' + (d.accessCount || 0) + '</div>';
  tooltip.style.display = 'block';
  positionTooltip(e);
}
function positionTooltip(e) {
  const x = e.clientX + 12;
  const y = e.clientY + 12;
  const rect = tooltip.getBoundingClientRect();
  tooltip.style.left = (x + rect.width > window.innerWidth ? e.clientX - rect.width - 8 : x) + 'px';
  tooltip.style.top = (y + rect.height > window.innerHeight ? e.clientY - rect.height - 8 : y) + 'px';
}
function hideTooltip() { tooltip.style.display = 'none'; }
document.addEventListener('mousemove', (e) => { if (tooltip.style.display === 'block') positionTooltip(e); });

// --- Header ---
document.getElementById('totalCount').textContent = DATA.totalEntries + ' entries';
document.getElementById('edgeCount').textContent = DATA.edges.length + ' edges';
document.getElementById('categoryCount').textContent = Object.keys(DATA.categories).length + ' categories';

// --- Tabs ---
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
    if (tab.dataset.tab === 'graph') setTimeout(() => graph.resize(), 50);
  });
});

function switchTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelector('[data-tab="' + name + '"]').classList.add('active');
  document.getElementById('panel-' + name).classList.add('active');
}

// --- Filters ---
const filterContainer = document.getElementById('filters');
const allBtn = document.createElement('button');
allBtn.className = 'filter-btn active';
allBtn.textContent = 'All';
allBtn.onclick = () => setFilter(null);
filterContainer.appendChild(allBtn);
Object.keys(DATA.categories).sort().forEach(cat => {
  const btn = document.createElement('button');
  btn.className = 'filter-btn';
  btn.textContent = cat;
  btn.dataset.cat = cat;
  btn.onclick = () => setFilter(cat);
  filterContainer.appendChild(btn);
});

function setFilter(cat) {
  activeFilter = cat;
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.toggle('active', cat === null ? !b.dataset.cat : b.dataset.cat === cat);
  });
  renderEntries();
  if (graph.highlightSearch) graph.highlightSearch();
}

// --- Search ---
document.getElementById('search').addEventListener('input', (e) => {
  searchQuery = e.target.value.toLowerCase();
  renderEntries();
  if (graph.highlightSearch) graph.highlightSearch();
  if (searchQuery && graph.centerOn) {
    const first = DATA.nodes.find(n => n.id.toLowerCase().includes(searchQuery) || n.content.toLowerCase().includes(searchQuery) || n.tags.some(t => t.toLowerCase().includes(searchQuery)));
    if (first) graph.centerOn(first.id);
  }
});

// --- Entries List ---
function renderEntries() {
  const q = searchQuery;
  const list = document.getElementById('entriesList');
  list.innerHTML = '';
  DATA.nodes
    .filter(e => !activeFilter || e.category === activeFilter)
    .filter(e => !q || e.id.toLowerCase().includes(q) || e.content.toLowerCase().includes(q) || e.tags.some(t => t.toLowerCase().includes(q)))
    .forEach(e => {
      const div = document.createElement('div');
      div.className = 'entry-item' + (selectedEntry && selectedEntry.id === e.id ? ' selected' : '');
      div.innerHTML =
        '<div class="entry-cat ' + e.category + '">' + e.category + '</div>' +
        '<div class="entry-key">' + escHtml(e.id) + '</div>' +
        '<div class="entry-preview">' + escHtml(e.content) + '</div>' +
        (e.tags.length ? '<div class="entry-tags">' + e.tags.map(t => '<span class="entry-tag">' + escHtml(t) + '</span>').join('') + '</div>' : '');
      div.onclick = () => selectEntry(e);
      list.appendChild(div);
    });
}

function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// --- Entry Selection ---
function selectEntry(entry) {
  selectedEntry = entry;
  renderEntries();
  showDetail(entry);
  graph.highlightNode(entry.id);
  graph.centerOn(entry.id);
  switchTab('detail');
}

function showDetail(e) {
  const panel = document.getElementById('detailPanel');
  const linkedNodes = DATA.edges
    .filter(ed => (typeof ed.source === 'object' ? ed.source.id : ed.source) === e.id || (typeof ed.target === 'object' ? ed.target.id : ed.target) === e.id)
    .map(ed => (typeof ed.source === 'object' ? ed.source.id : ed.source) === e.id ? (typeof ed.target === 'object' ? ed.target.id : ed.target) : (typeof ed.source === 'object' ? ed.source.id : ed.source));

  panel.innerHTML =
    '<div class="detail-cat" style="color:' + (COLORS[e.category] || 'var(--muted)') + '">' + e.category + '</div>' +
    '<h2>' + escHtml(e.id) + '</h2>' +
    '<div class="detail-field"><label>Content</label><span class="value mono">' + escHtml(e.content) + '</span></div>' +
    (e.file ? '<div class="detail-field"><label>File</label><span class="value mono"><a href="#" onclick="event.preventDefault()" style="color:var(--brand);text-decoration:none;cursor:pointer">' + escHtml(e.file) + '</a></span></div>' : '') +
    (e.date ? '<div class="detail-field"><label>Date</label><span class="value">' + e.date + '</span></div>' : '') +
    '<div class="detail-field"><label>Quality Score</label><span class="value" style="color:var(--brand);font-weight:700;font-size:1.1rem">' + (e.quality || 0).toFixed(3) + '</span></div>' +
    '<div class="detail-field"><label>Access Count</label><span class="value">' + (e.accessCount || 0) + '</span></div>' +
    (e.ttl ? '<div class="detail-field"><label>TTL</label><span class="value">' + e.ttl + '</span></div>' : '') +
    (e.lastAccessed ? '<div class="detail-field"><label>Last Accessed</label><span class="value">' + e.lastAccessed + '</span></div>' : '') +
    (e.tags.length ? '<div class="detail-field"><label>Tags</label><div class="entry-tags">' + e.tags.map(t => '<span class="entry-tag">' + escHtml(t) + '</span>').join('') + '</div></div>' : '') +
    (linkedNodes.length ? '<div class="detail-field"><label>Linked Entries (' + linkedNodes.length + ')</label><div class="detail-links">' + linkedNodes.map(k => '<span class="detail-link" onclick="selectEntryById(\\'' + k + '\\')">' + escHtml(k) + '</span>').join('') + '</div></div>' : '');
}

window.selectEntryById = function(id) {
  const e = DATA.nodes.find(n => n.id === id);
  if (e) selectEntry(e);
};

// --- Stats ---
function renderStats() {
  const grid = document.getElementById('statsGrid');
  const catEntries = Object.entries(DATA.categories).sort((a,b) => b[1] - a[1]);
  const maxCat = Math.max(...catEntries.map(c => c[1]));
  const topTags = Object.entries(DATA.tagCounts).sort((a,b) => b[1] - a[1]).slice(0, 20);
  const maxTag = Math.max(...topTags.map(t => t[1]));
  const avgQuality = DATA.nodes.reduce((s, n) => s + (n.quality || 0), 0) / DATA.nodes.length;
  const maxAccess = Math.max(...DATA.nodes.map(n => n.accessCount || 0));

  grid.innerHTML =
    '<div class="stat-card"><h3>Total Entries</h3><div class="stat-big">' + DATA.totalEntries + '</div></div>' +
    '<div class="stat-card"><h3>Graph Edges</h3><div class="stat-big">' + DATA.edges.length + '</div></div>' +
    '<div class="stat-card"><h3>Avg Quality</h3><div class="stat-big">' + avgQuality.toFixed(2) + '</div></div>' +
    '<div class="stat-card"><h3>Max Access</h3><div class="stat-big">' + maxAccess + '</div></div>' +
    '<div class="stat-card"><h3>Categories</h3><div class="bar-chart">' +
      catEntries.map(([cat, count]) =>
        '<div class="bar-row"><span class="bar-label">' + cat + '</span><div class="bar-track"><div class="bar-fill" style="width:' + (count/maxCat*100) + '%;background:' + (COLORS[cat] || 'var(--brand)') + '"></div></div><span class="bar-value">' + count + '</span></div>'
      ).join('') +
    '</div></div>' +
    '<div class="stat-card"><h3>Top Tags</h3><div class="tag-cloud">' +
      topTags.map(([tag, count]) =>
        '<span class="tag-pill">' + escHtml(tag) + ' <small>(' + count + ')</small></span>'
      ).join('') +
    '</div></div>';
}

function renderTimeline() {
  const container = document.getElementById('timelineContainer');
  const sorted = [...DATA.nodes].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const grouped = {};
  sorted.forEach(e => {
    const d = e.date || 'unknown';
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(e);
  });

  let html = '<div class="timeline-header">Timeline (' + DATA.totalEntries + ' entries)</div><div class="timeline-track"><div class="timeline-line"></div>';
  for (const [date, entries] of Object.entries(grouped)) {
    for (const e of entries) {
      html += '<div class="timeline-entry" onclick="selectEntryById(\\'' + e.id + '\\')" style="border-left:3px solid ' + (COLORS[e.category] || 'var(--border)') + '">' +
        '<div class="tl-date">' + escHtml(date) + '</div>' +
        '<div class="tl-cat" style="color:' + (COLORS[e.category] || 'var(--muted)') + '">' + e.category + '</div>' +
        '<div class="tl-key">' + escHtml(e.id) + '</div>' +
        '<div class="tl-content">' + escHtml(e.content.substring(0, 100)) + '</div>' +
      '</div>';
    }
  }
  html += '</div>';
  container.innerHTML = html;
}

// --- Graph ---
const graph = (function() {
  const container = document.getElementById('graphContainer');
  let _impl = null;
  const safe = (name, ...args) => { if (_impl && _impl[name]) return _impl[name](...args); };
  const initGraph = () => {
  const width = Math.max(container.clientWidth, 400);
  const height = Math.max(container.clientHeight, 300);
  const svg = d3.select(container).append('svg').attr('width', '100%').attr('height', '100%');

  const defs = svg.append('defs');
  const filter = defs.append('filter').attr('id', 'glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
  filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'blur');
  filter.append('feMerge').selectAll('feMergeNode').data(['blur', 'SourceGraphic']).join('feMergeNode').attr('in', d => d);

  const g = svg.append('g');
  let currentTransform = d3.zoomIdentity;
  const zoom = d3.zoom().scaleExtent([0.1, 4]).on('zoom', e => { g.attr('transform', e.transform); currentTransform = e.transform; updateMinimap(); });
  svg.call(zoom);

  function nodeRadius(d) { return 4 + Math.min((d.accessCount || 0) * 0.8, 8); }

  const connectionCount = new Map();
  DATA.edges.forEach(e => {
    const s = typeof e.source === 'object' ? e.source.id : e.source;
    const t = typeof e.target === 'object' ? e.target.id : e.target;
    connectionCount.set(s, (connectionCount.get(s) || 0) + 1);
    connectionCount.set(t, (connectionCount.get(t) || 0) + 1);
  });
  function edgeWidth(d) {
    const s = typeof d.source === 'object' ? d.source.id : d.source;
    const t = typeof d.target === 'object' ? d.target.id : d.target;
    const shared = Math.min(connectionCount.get(s) || 1, connectionCount.get(t) || 1);
    return 0.5 + Math.min(shared * 0.3, 3);
  }

  function getSharedTags(a, b) {
    const na = nodeMap.get(a), nb = nodeMap.get(b);
    if (!na || !nb || !na.tags || !nb.tags) return [];
    return na.tags.filter(t => nb.tags.includes(t));
  }

  let chargeStrength = -120;
  let linkDistance = 70;
  let centerStrength = 0.05;

  const nodeMap = new Map(DATA.nodes.map(n => [n.id, n]));
  const simulation = d3.forceSimulation(DATA.nodes)
    .force('link', d3.forceLink(DATA.edges).id(d => d.id).distance(linkDistance).strength(0.5))
    .force('charge', d3.forceManyBody().strength(chargeStrength))
    .force('center', d3.forceCenter(width / 2, height / 2).strength(centerStrength))
    .force('collision', d3.forceCollide().radius(d => nodeRadius(d) + 4));

  const link = g.append('g').selectAll('line').data(DATA.edges).join('line')
    .attr('class', 'link')
    .attr('stroke-width', d => edgeWidth(d))
    .attr('stroke-linecap', 'round');

  const node = g.append('g').selectAll('circle').data(DATA.nodes).join('circle')
    .attr('class', 'node-circle')
    .attr('r', d => nodeRadius(d))
    .attr('fill', d => COLORS[d.category] || '#888')
    .attr('stroke', d => { const c = COLORS[d.category] || '#888'; return c; })
    .attr('stroke-width', 1.5)
    .attr('stroke-opacity', 0.6)
    .call(d3.drag()
      .on('start', (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on('end', (e, d) => { if (!e.active) simulation.alphaTarget(0); })
    )
    .on('contextmenu', (e, d) => { e.preventDefault(); d.fx = null; d.fy = null; simulation.alpha(0.3).restart(); });
  const label = g.append('g').selectAll('text').data(DATA.nodes).join('text')
    .attr('class', 'node-label').attr('dy', d => -(nodeRadius(d) + 4))
    .text(d => d.id.length > 18 ? d.id.substring(0, 16) + '..' : d.id);

  // Edge tooltips
  link.on('mouseover', (e, d) => {
    const s = typeof d.source === 'object' ? d.source.id : d.source;
    const t = typeof d.target === 'object' ? d.target.id : d.target;
    const sharedTags = getSharedTags(s, t);
    const html = '<div class="tt-edge">' +
      '<span style="color:' + (COLORS[nodeMap.get(s)?.category] || 'var(--muted)') + '">' + escHtml(s) + '</span>' +
      ' → ' +
      '<span style="color:' + (COLORS[nodeMap.get(t)?.category] || 'var(--muted)') + '">' + escHtml(t) + '</span>' +
      (sharedTags.length ? '<br>Tags: ' + sharedTags.map(tag => '<span class="entry-tag">' + escHtml(tag) + '</span>').join(' ') : '') +
      '</div>';
    tooltip.innerHTML = html;
    tooltip.style.display = 'block';
    positionTooltip(e);
  })
  .on('mouseout', () => { hideTooltip(); });

  node.on('mouseover', (e, d) => {
    showTooltip(e, d);
    highlightNode(d.id);
  })
  .on('mouseout', () => {
    hideTooltip();
    if (!selectedEntry) highlightNode(null);
    else highlightNode(selectedEntry.id);
  });

  svg.on('click', () => { selectedEntry = null; highlightNode(null); renderEntries(); });

  simulation.on('tick', () => {
    link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    node.attr('cx', d => d.x).attr('cy', d => d.y);
    label.attr('x', d => d.x).attr('y', d => d.y);
    updateMinimap();
  });

  function highlightNode(id) {
    const neighbors = new Set();
    if (id) {
      DATA.edges.forEach(e => {
        const s = typeof e.source === 'object' ? e.source.id : e.source;
        const t = typeof e.target === 'object' ? e.target.id : e.target;
        if (s === id) neighbors.add(t);
        if (t === id) neighbors.add(s);
      });
      neighbors.add(id);
    }
    node.attr('r', d => id ? (d.id === id ? nodeRadius(d) + 4 : neighbors.has(d.id) ? nodeRadius(d) + 1 : 2) : nodeRadius(d))
        .attr('opacity', d => id ? (neighbors.has(d.id) ? 1 : 0.12) : 1)
        .classed('glow', d => id && d.id === id);
    link.classed('highlighted', d => id && ((typeof d.source === 'object' ? d.source.id : d.source) === id || (typeof d.target === 'object' ? d.target.id : d.target) === id));
    link.attr('opacity', d => id ? (((typeof d.source === 'object' ? d.source.id : d.source) === id || (typeof d.target === 'object' ? d.target.id : d.target) === id) ? 1 : 0.04) : 0.5);
    label.attr('opacity', d => id ? (neighbors.has(d.id) ? 1 : 0.08) : 1);
  }

  function highlightSearch() {
    if (!searchQuery && !activeFilter) { highlightNode(null); return; }
    const q = searchQuery;
    const matches = new Set();
    DATA.nodes.forEach(n => {
      const match = (!q || n.id.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags.some(t => t.toLowerCase().includes(q)));
      const catMatch = !activeFilter || n.category === activeFilter;
      if (match && catMatch) matches.add(n.id);
    });
    node.attr('r', d => matches.has(d.id) ? nodeRadius(d) + 3 : 2)
        .attr('opacity', d => matches.has(d.id) ? 1 : 0.06)
        .classed('glow search-match', d => matches.has(d.id));
    label.attr('opacity', d => matches.has(d.id) ? 1 : 0.03);
    link.attr('opacity', 0.03);
  }

  // Zoom controls
  document.getElementById('zoomIn').onclick = () => svg.transition().call(zoom.scaleBy, 1.5);
  document.getElementById('zoomOut').onclick = () => svg.transition().call(zoom.scaleBy, 0.67);
  document.getElementById('zoomReset').onclick = () => svg.transition().call(zoom.transform, d3.zoomIdentity);

  // Legend
  const legend = document.getElementById('legend');
  legend.innerHTML = Object.entries(COLORS).map(([cat, color]) =>
    '<div class="legend-item"><span class="legend-dot" style="background:' + color + '"></span>' + cat + '</div>'
  ).join('');

  // Physics controls
  const physicsToggle = document.getElementById('physicsToggle');
  const physicsPanel = document.getElementById('physicsPanel');
  physicsToggle.onclick = () => {
    physicsPanel.style.display = physicsPanel.style.display === 'none' ? 'block' : 'none';
  };

  function updatePhysics() {
    simulation.force('charge').strength(chargeStrength);
    simulation.force('link').distance(linkDistance);
    simulation.force('center').strength(centerStrength);
    simulation.alpha(0.5).restart();
  }

  document.getElementById('chargeSlider').oninput = (e) => {
    chargeStrength = parseInt(e.target.value);
    document.getElementById('chargeVal').textContent = chargeStrength;
    updatePhysics();
  };
  document.getElementById('distSlider').oninput = (e) => {
    linkDistance = parseInt(e.target.value);
    document.getElementById('distVal').textContent = linkDistance;
    updatePhysics();
  };
  document.getElementById('centerSlider').oninput = (e) => {
    centerStrength = parseFloat(e.target.value);
    document.getElementById('centerVal').textContent = centerStrength;
    updatePhysics();
  };

  // Center on a node
  function centerOn(id) {
    const n = DATA.nodes.find(d => d.id === id);
    if (!n || n.x == null) return;
    const w = container.clientWidth, h = container.clientHeight;
    svg.transition().duration(400).call(zoom.transform,
      d3.zoomIdentity.translate(w / 2 - n.x * currentTransform.k, h / 2 - n.y * currentTransform.k).scale(currentTransform.k));
  }

  // Path finder
  let pathStart = null, pathActive = false;
  function findPath(a, b) {
    const adj = new Map();
    DATA.edges.forEach(e => {
      const s = typeof e.source === 'object' ? e.source.id : e.source;
      const t = typeof e.target === 'object' ? e.target.id : e.target;
      if (!adj.has(s)) adj.set(s, []);
      if (!adj.has(t)) adj.set(t, []);
      adj.get(s).push(t);
      adj.get(t).push(s);
    });
    const visited = new Set([a]), parent = new Map([[a, null]]);
    const queue = [a];
    while (queue.length) {
      const cur = queue.shift();
      if (cur === b) break;
      for (const nb of (adj.get(cur) || [])) {
        if (!visited.has(nb)) { visited.add(nb); parent.set(nb, cur); queue.push(nb); }
      }
    }
    if (!parent.has(b)) return null;
    const path = [];
    let cur = b;
    while (cur !== null) { path.unshift(cur); cur = parent.get(cur); }
    return path;
  }
  function highlightPath(path) {
    link.classed('path-edge', false).attr('opacity', 0.5);
    node.classed('path-start path-end path-node', false).attr('r', d => nodeRadius(d));
    if (!path) return;
    const set = new Set(path);
    path.forEach((id, i) => {
      node.filter(d => d.id === id)
        .classed(i === 0 ? 'path-start' : i === path.length - 1 ? 'path-end' : 'path-node', true)
        .attr('r', d => nodeRadius(d) + 3);
    });
    for (let i = 0; i < path.length - 1; i++) {
      link.filter(d => {
        const s = typeof d.source === 'object' ? d.source.id : d.source;
        const t = typeof d.target === 'object' ? d.target.id : d.target;
        return (s === path[i] && t === path[i+1]) || (s === path[i+1] && t === path[i]);
      }).classed('path-edge', true).attr('opacity', 1);
    }
  }

  // Minimap
  const minimapSvg = d3.select('#minimapSvg');
  const minimapScale = 0.1;
  const minimapW = 150, minimapH = 100;
  const minimapG = minimapSvg.append('g');
  minimapG.append('g').attr('class', 'minimap-links');
  minimapG.append('g').attr('class', 'minimap-nodes');
  const minimapViewport = minimapSvg.append('rect').attr('class', 'minimap-viewport').attr('fill', 'rgba(167,139,250,0.12)').attr('stroke', 'var(--brand)').attr('stroke-width', 1.5).attr('rx', 3);

  function getGraphBounds() {
    const allX = DATA.nodes.map(n => n.x || 0);
    const allY = DATA.nodes.map(n => n.y || 0);
    return { minX: Math.min(...allX) - 20, minY: Math.min(...allY) - 20, maxX: Math.max(...allX) + 20, maxY: Math.max(...allY) + 20 };
  }

  function updateMinimap() {
    const { minX, minY } = getGraphBounds();
    minimapG.attr('transform', 'translate(' + (-minX * minimapScale) + ',' + (-minY * minimapScale) + ')');

    minimapG.select('.minimap-links').selectAll('line').data(DATA.edges).join('line')
      .attr('x1', d => (d.source.x || 0) * minimapScale)
      .attr('y1', d => (d.source.y || 0) * minimapScale)
      .attr('x2', d => (d.target.x || 0) * minimapScale)
      .attr('y2', d => (d.target.y || 0) * minimapScale)
      .attr('stroke', 'var(--border)').attr('stroke-width', 0.5).attr('stroke-opacity', 0.3);

    minimapG.select('.minimap-nodes').selectAll('circle').data(DATA.nodes).join('circle')
      .attr('cx', d => (d.x || 0) * minimapScale).attr('cy', d => (d.y || 0) * minimapScale)
      .attr('r', 1.8).attr('fill', d => COLORS[d.category] || '#888').attr('stroke', 'none');

    const t = currentTransform;
    const containerW = container.clientWidth;
    const containerH = container.clientHeight;
    const vpX = (-t.x / t.k - minX) * minimapScale;
    const vpY = (-t.y / t.k - minY) * minimapScale;
    const vpW = (containerW / t.k) * minimapScale;
    const vpH = (containerH / t.k) * minimapScale;
    minimapViewport.attr('x', Math.max(0, vpX)).attr('y', Math.max(0, vpY))
      .attr('width', Math.min(vpW, minimapW)).attr('height', Math.min(vpH, minimapH));
  }

  minimapSvg.on('click', (e) => {
    const { minX, minY } = getGraphBounds();
    const rect = minimapSvg.node().getBoundingClientRect();
    const mmx = (e.clientX - rect.left) / minimapScale + minX;
    const mmy = (e.clientY - rect.top) / minimapScale + minY;
    const w2 = container.clientWidth / 2, h2 = container.clientHeight / 2;
    svg.transition().duration(300).call(zoom.transform, d3.zoomIdentity.translate(w2 - mmx, h2 - mmy));
  });

  // Export PNG
  document.getElementById('exportPng').onclick = () => {
    const svgEl = container.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    canvas.width = svgEl.clientWidth * 2;
    canvas.height = svgEl.clientHeight * 2;
    img.onload = () => {
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const link = document.createElement('a');
      link.download = 'toon-memory-graph.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  // Export SVG
  document.getElementById('exportSvg').onclick = () => {
    const svgEl = container.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.download = 'toon-memory-graph.svg';
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  // Path toggle
  document.getElementById('pathToggle').onclick = () => {
    pathActive = !pathActive;
    document.getElementById('pathToggle').classList.toggle('active', pathActive);
    if (!pathActive) { pathStart = null; highlightPath(null); }
    document.getElementById('pathInfo').style.display = 'none';
  };
  function selectEntryGraph(entry) {
    selectedEntry = entry;
    renderEntries();
    showDetail(entry);
    graph.highlightNode(entry.id);
    graph.centerOn(entry.id);
  }

  let clickTimer = null;
  node.on('click', (e, d) => {
    e.stopPropagation();
    if (pathActive) {
      if (!pathStart) {
        pathStart = d.id;
        document.getElementById('pathInfo').textContent = 'Click target node';
        document.getElementById('pathInfo').style.display = 'block';
        highlightPath(null);
        node.classed('path-start', false);
        node.filter(n => n.id === d.id).classed('path-start', true);
      } else {
        const path = findPath(pathStart, d.id);
        if (path) {
          const info = document.getElementById('pathInfo');
          info.innerHTML = 'Path: ' + path.join(' → ');
          info.style.display = 'block';
          highlightPath(path);
          centerOn(path[Math.floor(path.length / 2)]);
        } else {
          document.getElementById('pathInfo').textContent = 'No path found';
          document.getElementById('pathInfo').style.display = 'block';
        }
        pathStart = null;
        pathActive = false;
        document.getElementById('pathToggle').classList.remove('active');
      }
      return;
    }
    if (clickTimer) { clearTimeout(clickTimer); clickTimer = null; return; }
    clickTimer = setTimeout(() => {
      clickTimer = null;
      selectEntryGraph(d);
    }, 220);
  });
  node.on('dblclick', (e, d) => {
    e.stopPropagation();
    if (clickTimer) { clearTimeout(clickTimer); clickTimer = null; }
    selectEntry(d); hideTooltip();
  });

  _impl = { highlightNode, highlightSearch, centerOn, resize: () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    simulation.force('center', d3.forceCenter(w / 2, h / 2).strength(centerStrength));
    simulation.alpha(0.3).restart();
  }};
  };
  if (container.clientWidth > 0 && container.clientHeight > 0) {
    initGraph();
  } else {
    const ro = new ResizeObserver(() => {
      if (container.clientWidth > 0 && container.clientHeight > 0) {
        ro.disconnect();
        initGraph();
      }
    });
    ro.observe(container);
  }
  return { highlightNode: (...a) => safe('highlightNode', ...a), highlightSearch: (...a) => safe('highlightSearch', ...a), centerOn: (...a) => safe('centerOn', ...a), resize: (...a) => safe('resize', ...a) };
})();

// --- Keyboard Shortcuts ---
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') {
    if (e.key === 'Escape') { e.target.value = ''; searchQuery = ''; renderEntries(); if (graph.highlightSearch) graph.highlightSearch(); e.target.blur(); }
    return;
  }
  if (e.key === '/') { e.preventDefault(); document.getElementById('search').focus(); }
  if (e.key === 'Escape') { selectedEntry = null; renderEntries(); graph.highlightNode(null); switchTab('graph'); }
  if (e.key === '1') switchTab('graph');
  if (e.key === '2') switchTab('stats');
  if (e.key === '3') switchTab('timeline');
  if (e.key === '4') switchTab('detail');
});

// --- Sidebar Resize ---
(function() {
  const resizer = document.getElementById('sidebarResizer');
  let startX, startW;
  resizer.addEventListener('mousedown', (e) => {
    startX = e.clientX;
    startW = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-w')) || 320;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    const onMove = (ev) => {
      const w = Math.max(160, Math.min(600, startW + ev.clientX - startX));
      document.documentElement.style.setProperty('--sidebar-w', w + 'px');
    };
    const onUp = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
})();

renderStats();
renderTimeline();
renderEntries();

document.getElementById('reloadBtn').addEventListener('click', () => location.reload());
document.addEventListener('keydown', (e) => {
  if (e.key === 'r' && !e.metaKey && !e.ctrlKey && !e.target.closest('input,textarea')) location.reload();
});

// MCP Apps: expose a global so the host can detect the viewer is ready
if (window.parent !== window) {
  console.log('toon-memory viewer running in MCP Apps iframe');
}
<\/script>
</body>
</html>`
}
