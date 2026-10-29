/* =====================================================================
   FAQ MATCHING ENGINE
   Pipeline: normalise text -> remove filler words -> map synonyms to a
   canonical term -> fix small typos -> score against ONLY the approved
   FAQ dataset -> confidence check.
   No external service is used. Everything runs in the browser.
   ===================================================================== */

const MATCH_THRESHOLD   = 0.5;   // below this the assistant admits it does not know
const SUGGEST_THRESHOLD = 0.25;  // below this nothing related is offered
const TIE_MARGIN        = 0.04;  // top two FAQs this close together = ambiguous

const STOPWORDS = new Set(('a an the is are was were am be been do does did done i me my mine we us our you your yours it its this that these those ' +
  'can could should would will shall may might must how what when where which who whom whose why for of to in on at by with from and or if so as about into than then there here ' +
  'any some please tell give show know want like need get got find have has had having s im ive id dont doesnt cant whats hows thats theres much many very also just let lets kindly ' +
  'needed needs write sir madam hi hello hey regarding college campus grt student students institute engineering').split(' '));

const SYNONYM_GROUPS = [
  ['attendance', 'attendance attendence attendace atendance attend attending present presence'],
  ['requirement', 'minimum min least required require requirement requirements mandatory criteria criterion percentage percent pct compulsory eligibility eligible'],
  ['exam', 'exam exams examination examinations'],
  ['leave', 'leave leaves absent absence'],
  ['placement', 'placement placements placed recruitment recruiting recruit'],
  ['company', 'company companies recruiter recruiters employer employers firm firms'],
  ['internship', 'internship internships intern interns'],
  ['fee', 'fee fees tuition'],
  ['pay', 'pay paying paid payment payments'],
  ['scholarship', 'scholarship scholarships concession concessions bursary aid'],
  ['hostel', 'hostel hostels accommodation dorm dormitory lodging'],
  ['library', 'library libraries'],
  ['timing', 'timing timings time times hours hour open opens opening close closes closing'],
  ['book', 'book books'],
  ['borrow', 'borrow borrowing issue issued loan lend'],
  ['bus', 'bus buses transport transportation'],
  ['route', 'route routes stop stops pickup'],
  ['detail', 'detail details info information'],
  ['apply', 'apply applying application applications register registration submit enroll'],
  ['training', 'training coaching coach preparation prepare'],
  ['interview', 'interview interviews'],
  ['document', 'document documents doc docs'],
  ['onduty', 'onduty od'],
  ['pass', 'pass passing cleared'],
  ['internal', 'internal internals'],
  ['result', 'result results']
];
const SYN = {};
SYNONYM_GROUPS.forEach(([canonical, words]) => words.split(' ').forEach(w => { SYN[w] = canonical; }));

function normalize(text) {
  let t = String(text == null ? '' : text).toLowerCase().replace(/[’‘`']/g, '').replace(/&/g, ' and ');
  t = t
    .replace(/\bre[\s-]?(evaluat\w*|valuat\w*|total\w*|check\w*)/g, 'revaluation')
    .replace(/\b(hall[\s-]?ticket|admit[\s-]?card)s?\b/g, 'hallticket')
    .replace(/\bon[\s-]?duty\b/g, 'onduty')
    .replace(/\b(last|due|final)[\s-]?date\b/g, 'deadline')
    .replace(/\bfirst[\s-]?graduate\b/g, 'firstgraduate')
    .replace(/[^a-z0-9\s]/g, ' ');
  return t.replace(/\s+/g, ' ').trim();
}

function canon(w) {
  if (SYN[w]) return SYN[w];
  let s = w;
  if (s.length > 4 && s.endsWith('ies')) s = s.slice(0, -3) + 'y';
  else if (s.length > 3 && s.endsWith('s') && !s.endsWith('ss')) s = s.slice(0, -1);
  return SYN[s] || s;
}

function tokenize(text) {
  const out = [];
  normalize(text).split(' ').forEach(w => {
    if (!w || STOPWORDS.has(w)) return;
    const c = canon(w);
    if (c && !out.includes(c)) out.push(c);
  });
  return out;
}

function editDistance(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let last = prev[0]; prev[0] = i; let rowMin = prev[0];
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = a[i - 1] === b[j - 1] ? last : 1 + Math.min(last, prev[j], prev[j - 1]);
      last = tmp; if (prev[j] < rowMin) rowMin = prev[j];
    }
    if (rowMin > max) return max + 1;
  }
  return prev[b.length];
}

function createMatcher(faqs) {
  const docs = faqs.map(f => ({
    f,
    variants: [f.q].concat(f.alts || []).map(tokenize),
    kw: new Set(tokenize((f.kw || '') + ' ' + f.q))
  }));
  const df = new Map();
  docs.forEach(d => {
    const all = new Set(d.kw);
    d.variants.forEach(v => v.forEach(t => all.add(t)));
    all.forEach(t => df.set(t, (df.get(t) || 0) + 1));
  });
  const N = Math.max(docs.length, 1);
  const idf = t => Math.log(1 + N / (df.get(t) || 0.5));
  const vocab = Array.from(df.keys());

  function fixTypos(tokens) {
    return tokens.map(t => {
      if (df.has(t) || t.length < 5 || /\d/.test(t)) return t;
      const max = t.length >= 8 ? 2 : 1;
      let best = t, bestD = max + 1;
      vocab.forEach(v => { const d = editDistance(t, v, max); if (d < bestD) { bestD = d; best = v; } });
      return bestD <= max ? best : t;
    });
  }

  function match(question) {
    const q = fixTypos(tokenize(question));
    if (!q.length) return { status: 'empty', best: null, ranked: [], tokens: q };
    const wq = q.reduce((s, t) => s + idf(t), 0);
    const ranked = docs.map(d => {
      let dice = 0;
      d.variants.forEach(v => {
        if (!v.length) return;
        const wm = q.filter(t => v.includes(t)).reduce((s, t) => s + idf(t), 0);
        const wv = v.reduce((s, t) => s + idf(t), 0);
        dice = Math.max(dice, (2 * wm) / (wq + wv));
      });
      const hits = q.filter(t => d.kw.has(t));
      const cover = hits.reduce((s, t) => s + idf(t), 0) / wq;
      const kwScore = hits.length >= Math.min(2, q.length) ? cover * 0.7 : 0;
      return { faq: d.f, dice, score: Math.max(dice, kwScore) };
    }).sort((a, b) => b.score - a.score);

    const best = ranked[0], second = ranked[1];
    const related = ranked.filter(r => r.score >= SUGGEST_THRESHOLD).slice(0, 3);
    let status;
    if (best.score >= MATCH_THRESHOLD) {
      const tie = second && best.score - second.score < TIE_MARGIN && best.dice < 0.85;
      const oneWord = q.length === 1 && normalize(question).split(' ').length <= 2 && related.length > 1;
      status = (tie || oneWord) ? 'ambiguous' : 'match';
    } else {
      status = 'none';
    }
    return { status, best, ranked, related, tokens: q, confidence: Math.min(best.score, 1) };
  }
  return { match };
}

if (typeof module !== 'undefined') module.exports = { createMatcher, normalize, tokenize };
