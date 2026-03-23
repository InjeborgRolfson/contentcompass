#!/usr/bin/env node
// claude-usage.js — Claude Code local usage dashboard
// Run: node claude-usage.js

'use strict';

const fs   = require('fs');
const path = require('path');
const os   = require('os');

// ─── ANSI helpers ────────────────────────────────────────────────────────────
const C = {
  reset  : '\x1b[0m',
  bold   : '\x1b[1m',
  dim    : '\x1b[2m',
  cyan   : '\x1b[36m',
  green  : '\x1b[32m',
  yellow : '\x1b[33m',
  blue   : '\x1b[34m',
  magenta: '\x1b[35m',
  red    : '\x1b[31m',
  white  : '\x1b[37m',
  bgBlue : '\x1b[44m',
};
const b  = s => C.bold   + s + C.reset;
const cy = s => C.cyan   + s + C.reset;
const gr = s => C.green  + s + C.reset;
const yw = s => C.yellow + s + C.reset;
const mg = s => C.magenta + s + C.reset;
const dm = s => C.dim    + s + C.reset;
const rd = s => C.red    + s + C.reset;

// ─── Pricing (per 1M tokens) — claude-sonnet-4-x rates ──────────────────────
const PRICING = {
  'claude-sonnet-4':    { input: 3.00, output: 15.00, cacheWrite: 3.75, cacheRead: 0.30 },
  'claude-opus-4':      { input: 15.00, output: 75.00, cacheWrite: 18.75, cacheRead: 1.50 },
  'claude-haiku-4':     { input: 0.80, output: 4.00,  cacheWrite: 1.00,  cacheRead: 0.08 },
  'claude-haiku-3':     { input: 0.25, output: 1.25,  cacheWrite: 0.30,  cacheRead: 0.03 },
  'default':            { input: 3.00, output: 15.00, cacheWrite: 3.75, cacheRead: 0.30 },
};

function getPrice(model) {
  if (!model || model === '<synthetic>') return PRICING['default'];
  for (const key of Object.keys(PRICING)) {
    if (key !== 'default' && model.startsWith(key)) return PRICING[key];
  }
  return PRICING['default'];
}

function calcCost(usage, model) {
  const p = getPrice(model);
  const M = 1_000_000;
  const cacheCreate = (usage.cacheCreate || 0);
  const cacheRead   = (usage.cacheRead   || 0);
  return (
    (usage.input       / M) * p.input       +
    (usage.output      / M) * p.output      +
    (cacheCreate       / M) * p.cacheWrite  +
    (cacheRead         / M) * p.cacheRead
  );
}

// ─── Data collection ─────────────────────────────────────────────────────────
function scanProjects() {
  const claudeDir   = path.join(os.homedir(), '.claude');
  const projectsDir = path.join(claudeDir, 'projects');

  if (!fs.existsSync(projectsDir)) {
    console.error(rd('No ~/.claude/projects directory found.'));
    process.exit(1);
  }

  const allSessions = [];

  const projectDirs = fs.readdirSync(projectsDir).filter(d => {
    return fs.statSync(path.join(projectsDir, d)).isDirectory();
  });

  for (const proj of projectDirs) {
    const projPath = path.join(projectsDir, proj);
    const jsonlFiles = fs.readdirSync(projPath).filter(f => f.endsWith('.jsonl'));

    for (const file of jsonlFiles) {
      const filePath = path.join(projPath, file);
      const session  = parseSession(filePath, proj, file);
      if (session) allSessions.push(session);
    }
  }

  return allSessions;
}

function parseSession(filePath, project, file) {
  let lines;
  try {
    lines = fs.readFileSync(filePath, 'utf8').trim().split('\n');
  } catch (e) {
    return null;
  }

  const sessionId  = file.replace('.jsonl', '');
  let firstDate    = null;
  let lastDate     = null;
  let model        = null;
  let title        = null;

  const totals = { input: 0, output: 0, cacheCreate: 0, cacheRead: 0 };
  let turnCount = 0;

  for (const line of lines) {
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }

    if (obj.timestamp) {
      const d = new Date(obj.timestamp);
      if (!firstDate || d < firstDate) firstDate = d;
      if (!lastDate  || d > lastDate)  lastDate  = d;
    }

    if (obj.type === 'ai-title' && obj.aiTitle) {
      title = obj.aiTitle;
    }

    const msg = obj.message || {};
    if (msg.role === 'assistant' && msg.usage) {
      const u = msg.usage;
      totals.input       += (u.input_tokens || 0);
      totals.output      += (u.output_tokens || 0);
      totals.cacheCreate += (u.cache_creation_input_tokens || 0);
      totals.cacheRead   += (u.cache_read_input_tokens || 0);
      if (!model && msg.model && msg.model !== '<synthetic>') model = msg.model;
      turnCount++;
    }
  }

  const totalTokens = totals.input + totals.output + totals.cacheCreate + totals.cacheRead;
  if (totalTokens === 0 && turnCount === 0) return null; // skip empty

  return {
    sessionId,
    project,
    title      : title || sessionId.slice(0, 8) + '...',
    firstDate,
    lastDate,
    model      : model || '<synthetic>',
    totals,
    cost       : calcCost(totals, model),
    turnCount,
  };
}

// ─── Formatting helpers ───────────────────────────────────────────────────────
const W = 72; // dashboard width

function fmt(n)   { return n.toLocaleString('en-US'); }
function fmtCost(n) {
  if (n < 0.001) return '$0.00';
  return '$' + n.toFixed(4);
}
function pad(s, w, right = false) {
  const plain = stripAnsi(s);
  const pad   = ' '.repeat(Math.max(0, w - plain.length));
  return right ? pad + s : s + pad;
}
function stripAnsi(s) {
  return s.replace(/\x1b\[[0-9;]*m/g, '');
}
function hr(char = '─') { return dm(char.repeat(W)); }
function box(text) {
  const inner = W - 2;
  const plain = stripAnsi(text);
  const padLen = Math.max(0, inner - plain.length);
  return cy('║') + ' ' + text + ' '.repeat(padLen - 1) + cy('║');
}

function header(title) {
  const top    = cy('╔' + '═'.repeat(W - 2) + '╗');
  const bot    = cy('╚' + '═'.repeat(W - 2) + '╝');
  const inner  = W - 2;
  const plain  = stripAnsi(title);
  const lpad   = Math.floor((inner - plain.length) / 2);
  const rpad   = inner - plain.length - lpad;
  const mid    = cy('║') + ' '.repeat(lpad) + title + ' '.repeat(rpad) + cy('║');
  return [top, mid, bot].join('\n');
}

// ─── Bar chart ────────────────────────────────────────────────────────────────
function barChart(sessions, days = 7) {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const buckets = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets[key] = { input: 0, output: 0, cacheCreate: 0, cacheRead: 0, cost: 0 };
  }

  for (const s of sessions) {
    if (!s.firstDate) continue;
    const key = s.firstDate.toISOString().slice(0, 10);
    if (buckets[key]) {
      buckets[key].input       += s.totals.input;
      buckets[key].output      += s.totals.output;
      buckets[key].cacheCreate += s.totals.cacheCreate;
      buckets[key].cacheRead   += s.totals.cacheRead;
      buckets[key].cost        += s.cost;
    }
  }

  const dates  = Object.keys(buckets).sort();
  const values = dates.map(d => buckets[d].output + buckets[d].input);
  const maxVal = Math.max(...values, 1);
  const BAR_W  = 32;

  const lines = [];
  for (const date of dates) {
    const val     = values[dates.indexOf(date)];
    const filled  = Math.round((val / maxVal) * BAR_W);
    const empty   = BAR_W - filled;
    const bar     = filled > 0
      ? gr('█'.repeat(filled)) + dm('░'.repeat(empty))
      : dm('░'.repeat(BAR_W));
    const label   = date.slice(5);          // MM-DD
    const valStr  = fmt(val).padStart(8);
    const costStr = yw(fmtCost(buckets[date].cost)).padStart(9 + 14); // with ANSI
    lines.push(`  ${dm(label)}  ${bar}  ${cy(valStr)} ${dm('tok')}  ${costStr}`);
  }
  return lines;
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
function main() {
  const sessions = scanProjects();

  if (sessions.length === 0) {
    console.log(yw('No usage data found in ~/.claude/projects/'));
    process.exit(0);
  }

  // Sort sessions by date
  sessions.sort((a, b) => (a.firstDate || 0) - (b.firstDate || 0));

  // Totals across all sessions
  const grand = { input: 0, output: 0, cacheCreate: 0, cacheRead: 0 };
  let totalCost = 0;
  for (const s of sessions) {
    grand.input       += s.totals.input;
    grand.output      += s.totals.output;
    grand.cacheCreate += s.totals.cacheCreate;
    grand.cacheRead   += s.totals.cacheRead;
    totalCost         += s.cost;
  }
  const grandTotal = grand.input + grand.output + grand.cacheCreate + grand.cacheRead;

  // Current session = most recent
  const current = sessions[sessions.length - 1];
  const avgOutput = Math.round(
    sessions.reduce((a, s) => a + s.totals.output, 0) / sessions.length
  );

  console.log('');
  console.log(header(b(cy('  CLAUDE CODE USAGE DASHBOARD  '))));
  console.log('');

  // ── Token summary ─────────────────────────────────────────────────────────
  console.log('  ' + b('TOKEN SUMMARY') + '                              ' + b('COST BREAKDOWN'));
  console.log('  ' + hr());

  const leftCol  = 38;
  const rows = [
    [dm('Input (direct)'),   cy(fmt(grand.input)),         dm('Input'),        cy(fmtCost((grand.input / 1e6) * 3.00))],
    [dm('Output'),           gr(fmt(grand.output)),         dm('Output'),       gr(fmtCost((grand.output / 1e6) * 15.00))],
    [dm('Cache created'),    yw(fmt(grand.cacheCreate)),    dm('Cache write'),  yw(fmtCost((grand.cacheCreate / 1e6) * 3.75))],
    [dm('Cache read'),       mg(fmt(grand.cacheRead)),      dm('Cache read'),   mg(fmtCost((grand.cacheRead / 1e6) * 0.30))],
  ];

  for (const [lk, lv, rk, rv] of rows) {
    const left  = `  ${pad(lk, 20)} : ${pad(lv, 14, true)}`;
    const right = `    ${pad(rk, 14)} : ${rv}`;
    console.log(left + right);
  }

  console.log('  ' + hr());
  const grandLeft  = `  ${pad(b('Total tokens'), 20)} : ${pad(b(cy(fmt(grandTotal))), 14 + 8, true)}`;
  const grandRight = `    ${pad(b('TOTAL COST'), 14)} : ${b(gr(fmtCost(totalCost)))}`;
  console.log(grandLeft + grandRight);

  console.log('');

  // ── Current session vs average ────────────────────────────────────────────
  console.log('  ' + b('CURRENT SESSION') + '  ' + dm('vs historical average'));
  console.log('  ' + hr());

  const ratio = current.totals.output / Math.max(avgOutput, 1);
  const arrow = ratio >= 1.5 ? rd('▲▲') : ratio >= 1.1 ? yw('▲') : ratio <= 0.5 ? gr('▼▼') : gr('─');
  console.log(`  Session   : ${cy(current.title)}`);
  console.log(`  Output    : ${gr(fmt(current.totals.output))} tokens  ${arrow}  avg ${yw(fmt(avgOutput))} tokens`);
  console.log(`  Cost      : ${gr(fmtCost(current.cost))}   |   Sessions scanned: ${yw(sessions.length)}`);
  if (current.model !== '<synthetic>') {
    console.log(`  Model     : ${dm(current.model)}`);
  }

  console.log('');

  // ── Session table ─────────────────────────────────────────────────────────
  console.log('  ' + b('SESSIONS'));
  console.log('  ' + hr());
  const TH = `  ${pad(dm('#'), 4)}${pad(dm('Date'), 12)}${pad(dm('Title'), 30)}${pad(dm('Output'), 10, true)}  ${pad(dm('Cost'), 10, true)}`;
  console.log(TH);
  console.log('  ' + dm('·'.repeat(W - 2)));

  sessions.forEach((s, i) => {
    const num   = String(i + 1).padStart(2);
    const date  = s.firstDate ? s.firstDate.toISOString().slice(0, 10) : '??';
    const title = s.title.length > 28 ? s.title.slice(0, 27) + '…' : s.title;
    const out   = fmt(s.totals.output).padStart(8);
    const cost  = fmtCost(s.cost).padStart(8);
    const isCur = i === sessions.length - 1;
    const row   = `  ${isCur ? yw(num) : dm(num)}  ${dm(date)}  ${isCur ? cy(pad(title, 28)) : pad(dm(title), 28)}  ${gr(out)}  ${isCur ? yw(cost) : dm(cost)}`;
    console.log(row);
  });

  console.log('');

  // ── Daily bar chart ───────────────────────────────────────────────────────
  console.log('  ' + b('DAILY USAGE — LAST 7 DAYS') + '  ' + dm('(direct input + output tokens)'));
  console.log('  ' + hr());
  const chartLines = barChart(sessions, 7);
  for (const line of chartLines) console.log(line);

  console.log('');
  console.log('  ' + dm(`Source: ~/.claude/projects/  |  ${sessions.length} sessions  |  Run: node claude-usage.js`));
  console.log('');
}

main();
