// Run:  node tests/engine.test.js
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const src = f => fs.readFileSync(path.join(__dirname, '..', 'src', f), 'utf8');
const ctx = { module: { exports: {} }, console };
vm.createContext(ctx);
vm.runInContext(src('faq-data.js') + '\n' + src('faq-engine.js') + '\nthis.__x={createMatcher,FAQS,CATEGORIES};', ctx);
const { createMatcher, FAQS, CATEGORIES } = ctx.__x;
const m = createMatcher(FAQS);

// [question, expected faq id or null (no confident answer), allowed statuses]
const cases = [
  ['How much attendance do I need?', 'at1'],
  ['What is the minimum attendance percentage?', 'at1'],
  ['How much attendance is required for exams?', 'at1'],
  ['  HOW   MUCH ATTENDANCE do i NEED???  ', 'at1'],
  ['atendance needed to write exam', 'at1'],
  ['What is the exam pattern?', 'ac1'],
  ['how are exams conducted', 'ac1'],
  ['How can I apply for leave?', 'at2'],
  ['leave letter procedure', 'at2'],
  ['Where can I find placement details?', 'pl1'],
  ['What is the fee structure?', 'fe1'],
  ['how much is tuition fee', 'fe1'],
  ['What are the library timings?', 'lb1'],
  ['library timing', 'lb1'],
  ['what time does the library close', 'lb1'],
  ['How can I get my attendance details?', 'at4'],
  ['What documents are required for semester exam hall ticket?', 'ac2'],
  ['admit card documents', 'ac2'],
  ['how to apply for re-evaluation', 'ac3'],
  ['revaluation', 'ac3'],
  ['hostel room application', 'ho1'],
  ['is there a scholarship for first graduate students', 'fe4'],
  ['bus pass', 'tr2'],
  ['what is the eligibility for campus placement', 'pl4'],
  ['do you have placement training', 'pl5'],
  ['OD for symposium', 'at5'],
  ['what is the last date to pay fees', 'fe3'],
  // outside the dataset -> must NOT answer
  ['Who is the principal of the college?', null],
  ['What is the weather today?', null],
  ['Is there a swimming pool on campus?', null],
  ['What is the capital of France?', null],
  ['can I bring my pet to hostel canteen menu', null],
  ['pizza near college', null],
  ['asdf qwer zxcv', null],
  ['tell me a joke', null],
];

let pass = 0, fail = 0;
for (const [q, want] of cases) {
  const r = m.match(q);
  const got = r.status === 'match' ? r.best.faq.id : null;
  const ok = got === want;
  ok ? pass++ : fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${JSON.stringify(q)}  -> ${r.status} ${r.best ? r.best.faq.id + ' ' + r.best.score.toFixed(2) : ''} (want ${want})`);
}

// ambiguous single keyword should not return a confident single answer
for (const q of ['attendance', 'fee', 'hostel', 'library', 'exam']) {
  const r = m.match(q);
  const ok = r.status !== 'match';
  ok ? pass++ : fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  single keyword ${JSON.stringify(q)} -> ${r.status} ${r.best ? r.best.faq.id + ' ' + r.best.score.toFixed(2) : ''}`);
}

// data integrity
const ids = new Set(FAQS.map(f => f.id));
const catIds = new Set(CATEGORIES.map(c => c.id));
const dataOk = ids.size === FAQS.length && FAQS.every(f => catIds.has(f.cat) && f.q && f.a);
dataOk ? pass++ : fail++;
console.log(`${dataOk ? 'PASS' : 'FAIL'}  dataset integrity (${FAQS.length} FAQs, ${CATEGORIES.length} categories)`);

// every official question must match itself
for (const f of FAQS) {
  const r = m.match(f.q);
  const ok = r.status === 'match' && r.best.faq.id === f.id;
  ok ? pass++ : fail++;
  if (!ok) console.log(`FAIL  self-match ${f.id}: ${f.q} -> ${r.status} ${r.best.faq.id} ${r.best.score.toFixed(2)}`);
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
