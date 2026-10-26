// Server-side dictionary search over entries and glossary terms.
import { entries } from './entries.js';
import { terms } from './glossary.js';

export const norm = s => String(s ?? '').normalize('NFC').toLowerCase().replace(/[\s·・,.\/()\[\]\-“”"'‘’?!~:;]+/g, '');
const SUFFIX = /(이란무엇인가요|이란무엇|이란|란무엇|란|이뭐야|뭐예요|뭐야|무엇|뜻|의미|기준|방법|하는법|읽는법|알려줘|은|는|이|가|을|를|의|에서|에|도|으로|로)$/;

export function tokens(q) {
  return String(q ?? '').normalize('NFC').toLowerCase().split(/[\s·・,.\/()\[\]\-“”"'‘’?!~:;]+/)
    .map(t => {
      let x = t;
      for (let i = 0; i < 2; i++) { const y = x.replace(SUFFIX, ''); if (y.length >= 2) x = y; }
      return x;
    })
    .filter(t => t.length >= 2);
}

const bigrams = s => { const out = new Set(); for (let i = 0; i < s.length - 1; i++) out.add(s.slice(i, i + 2)); return out; };
const overlap = (a, b) => { if (!a.size || !b.size) return 0; let n = 0; for (const x of a) if (b.has(x)) n++; return n < 2 ? 0 : n / Math.min(a.size, b.size); };

const entryDocs = entries.map(e => ({
  type: 'entry', ref: e,
  title: norm(`${e.title} ${e.short}`),
  kws: (e.keywords || []).map(norm).filter(Boolean),
  body: norm([e.description, e.lead, ...e.sections.flatMap(s => [s[0], ...s[1]]), ...(e.faq || []).flat(), ...(e.checks || [])].join(' '))
}));
const termDocs = terms.map(t => ({
  type: 'term', ref: t,
  title: norm(t.term.replace(/\(.*?\)/g, ' ')), full: norm(t.term),
  kws: t.aka.map(norm).filter(k => k.length >= 2),
  body: norm(`${t.def} ${t.check}`)
}));

function scoreDoc(d, qn, toks) {
  let s = 0;
  if (d.type === 'term') {
    if (d.title === qn || d.full === qn || d.kws.includes(qn)) s = 120;
    else if (qn.length >= 2 && (d.title.includes(qn) || d.full.includes(qn))) s = 80;
    else if (d.title.length >= 2 && qn.includes(d.title)) s = 65;
    else { const k = d.kws.find(k => qn.includes(k) || (qn.length >= 2 && k.includes(qn))); if (k) s = 55; }
  } else {
    if (qn.length >= 2 && d.title.includes(qn)) s = 70;
    else if (d.kws.includes(qn)) s = 70;
    else if (qn.length >= 2 && d.kws.some(k => k.includes(qn))) s = 45;
    else if (d.kws.some(k => k.length >= 2 && qn.includes(k))) s = 35;
  }
  let matched = 0, tokenScore = 0;
  for (const t of toks) {
    let hit = 0;
    if (d.title.includes(t)) hit = 12;
    else if (d.kws.some(k => k.includes(t) || t.includes(k) && k.length >= 2)) hit = 8;
    else if (d.body.includes(t)) hit = 3;
    if (hit) matched++;
    tokenScore += hit;
  }
  if (toks.length) {
    const ratio = matched / toks.length;
    s += ratio >= 1 ? tokenScore : ratio >= 0.5 ? tokenScore * 0.5 : 0;
  }
  return s;
}

export function search(raw) {
  const q = String(raw ?? '').trim().slice(0, 60);
  const qn = norm(q);
  if (!qn) return { q, terms: [], entries: [], suggestions: [] };
  const toks = tokens(q);
  const rank = docs => docs.map(d => ({ d, s: scoreDoc(d, qn, toks) })).filter(x => x.s >= 8).sort((a, b) => b.s - a.s);
  const t = rank(termDocs).slice(0, 6).map(x => x.d.ref);
  const e = rank(entryDocs).slice(0, 8).map(x => x.d.ref);
  // Entries linked from the best matching terms come right after direct entry hits.
  for (const term of t.slice(0, 3)) {
    const linked = entries.find(en => en.slug === term.link);
    if (linked && !e.includes(linked)) e.push(linked);
  }
  let suggestions = [];
  if (!t.length && !e.length) {
    const qb = bigrams(qn);
    suggestions = [...termDocs, ...entryDocs]
      .map(d => ({ d, s: Math.max(overlap(qb, bigrams(d.title)), ...d.kws.map(k => overlap(qb, bigrams(k)))) }))
      .filter(x => x.s >= 0.5).sort((a, b) => b.s - a.s).slice(0, 5).map(x => x.d);
  }
  return { q, terms: t, entries: e.slice(0, 8), suggestions };
}
