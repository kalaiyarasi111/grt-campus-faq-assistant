/* =====================================================================
   APPROVED FAQ DATASET  (edit this file to add verified information)
   ---------------------------------------------------------------------
   Every entry below is SAMPLE data for the capstone demo. Answers that
   contain "[Placeholder ...]" must be replaced with verified college
   information before real use. Set  sample:false  once an answer has
   been verified by the college office.

   Fields
     id      unique id
     cat     category id (see CATEGORIES)
     q       the official question shown to students
     alts    other ways students ask the same thing (helps matching)
     kw      extra keywords for this topic
     a       the approved answer
     sample  true = demo/placeholder content
   ===================================================================== */

const CATEGORIES = [
  { id: 'academics',  name: 'Academics & Examinations',   desc: 'Exam pattern, hall tickets, revaluation and academic calendar.', icon: 'book',     tone: 'blue'   },
  { id: 'attendance', name: 'Attendance & Leave',         desc: 'Attendance rules, leave requests and on-duty permission.',      icon: 'calcheck', tone: 'green'  },
  { id: 'placements', name: 'Placements & Internships',   desc: 'Campus drives, eligibility, training and internships.',         icon: 'briefcase',tone: 'orange' },
  { id: 'fees',       name: 'Fees & Scholarships',        desc: 'Fee structure, payment, receipts and scholarships.',            icon: 'wallet',   tone: 'purple' },
  { id: 'campus',     name: 'Library, Transport & Hostel',desc: 'Library hours, bus routes, bus pass and hostel stay.',          icon: 'building', tone: 'teal'   }
];

const FAQS = [
  /* ---------------- Academics & Examinations ---------------- */
  { id: 'ac1', cat: 'academics', sample: true,
    q: 'What is the exam pattern?',
    alts: ['How are the semester exams conducted', 'What is the exam format', 'How are marks divided between internal and end semester', 'Explain the examination scheme', 'How is the semester exam structured'],
    kw: 'exam examination pattern format scheme internal assessment end semester marks theory practical lab',
    a: 'Each course is evaluated through continuous internal assessment and an end-semester examination. Practical courses include a lab record and a practical examination. [Sample answer. Replace the mark split with the verified regulation.]' },

  { id: 'ac2', cat: 'academics', sample: true,
    q: 'What documents are required for semester exam hall ticket?',
    alts: ['How do I get my hall ticket', 'What do I need to collect the admit card', 'Hall ticket requirements for exams', 'When is the hall ticket issued', 'Documents needed for exam hall ticket'],
    kw: 'hall ticket admit card semester exam document id card fee clearance',
    a: 'You normally need your college ID card, a clear fee status and the required attendance to receive the hall ticket. The examination cell issues it before the semester examinations. [Sample answer. Confirm the exact list with the examination cell.]' },

  { id: 'ac3', cat: 'academics', sample: true,
    q: 'How can I apply for revaluation?',
    alts: ['How do I apply for re-evaluation of my answer paper', 'How to get retotalling or rechecking of marks', 'I am not satisfied with my result, what can I do', 'Revaluation process and last date', 'Can I get my answer sheet rechecked'],
    kw: 'revaluation result marks answer paper recheck retotal apply fee grievance',
    a: 'Revaluation requests are submitted through the examination cell within the notified window after results are published, along with the prescribed fee. [Sample answer. Add the verified procedure and deadline.]' },

  { id: 'ac4', cat: 'academics', sample: true,
    q: 'When are internal assessment tests conducted?',
    alts: ['What is the internal test schedule', 'When are the cycle tests held', 'Internal exam dates', 'When is the model exam', 'Internal assessment timetable'],
    kw: 'internal assessment test cycle model exam schedule date timetable',
    a: 'Internal assessment dates are published in the academic calendar and on department notice boards each semester. [Placeholder. No verified dates have been added.]' },

  { id: 'ac5', cat: 'academics', sample: true,
    q: 'What are the minimum marks to pass a subject?',
    alts: ['What is the passing criteria', 'How many marks do I need to pass', 'What is the pass mark in the end semester exam', 'Minimum marks to clear an exam', 'Pass percentage for a subject'],
    kw: 'pass passing marks minimum criteria fail arrear clear subject',
    a: 'To pass a course, a student must obtain the minimum marks prescribed in the university regulations for the internal and end-semester components. [Placeholder. Add the verified pass criteria.]' },

  { id: 'ac6', cat: 'academics', sample: true,
    q: 'Where can I find the academic calendar?',
    alts: ['How do I get the class timetable', 'Where is the semester calendar', 'When does the semester start and end', 'Academic calendar download', 'When is the semester reopening'],
    kw: 'academic calendar timetable schedule semester reopening holidays class',
    a: 'The academic calendar is shared by the college office and displayed on department notice boards. [Placeholder. Link the verified calendar here.]' },

  /* ---------------- Attendance & Leave ---------------- */
  { id: 'at1', cat: 'attendance', sample: true,
    q: 'How much attendance do I need?',
    alts: ['What is the minimum attendance percentage', 'How much attendance is required for exams', 'What is the attendance criteria', 'Minimum attendance to write semester exam', 'What percentage of attendance is mandatory', 'Attendance eligibility for exams'],
    kw: 'attendance minimum percentage required mandatory criteria eligible exam 75',
    a: 'Students need a minimum of 75% attendance to be eligible to appear for the semester examinations. [Sample value. Replace with the verified GRT attendance rule.]' },

  { id: 'at2', cat: 'attendance', sample: true,
    q: 'How can I apply for leave?',
    alts: ['How do I submit a leave letter', 'What is the leave application procedure', 'I need to take leave, whom should I inform', 'Leave request process for students', 'How to get leave permission'],
    kw: 'leave apply application letter permission absent request advisor hod',
    a: 'Submit a leave application to your class advisor or mentor, who forwards it to the HoD for approval. Attach a supporting document for medical leave. [Sample answer. Confirm the procedure with your department.]' },

  { id: 'at3', cat: 'attendance', sample: true,
    q: 'What if my attendance is below the minimum?',
    alts: ['What is attendance condonation', 'Can I write exams with low attendance', 'My attendance is short, what should I do', 'Attendance shortage rules', 'Can shortage of attendance be condoned'],
    kw: 'attendance below shortage low condonation condone fine shortfall exam short',
    a: 'Students with a shortage of attendance may apply for condonation with valid reasons, subject to approval and any prescribed fee. [Sample answer. Replace with the verified condonation rules.]' },

  { id: 'at4', cat: 'attendance', sample: true,
    q: 'How can I get my attendance details?',
    alts: ['Where can I check my attendance', 'How do I view my attendance percentage', 'Where is attendance published', 'Check attendance record', 'How do I know my current attendance'],
    kw: 'attendance details check view record percentage portal advisor',
    a: 'Your attendance is updated by faculty and shared by your class advisor at regular intervals. [Placeholder. Add the official portal or process once verified.]' },

  { id: 'at5', cat: 'attendance', sample: true,
    q: 'How do I get On-Duty (OD) permission for events?',
    alts: ['How to apply for OD for a symposium', 'On duty letter for competitions', 'OD for college events attendance', 'Can I get OD for a workshop', 'Permission to attend an inter-college event'],
    kw: 'od on duty permission event symposium competition workshop attendance letter',
    a: 'Request OD through your class advisor with an invitation or registration proof. Approved OD is added to your attendance record. [Sample answer. Confirm with your department.]' },

  /* ---------------- Placements & Internships ---------------- */
  { id: 'pl1', cat: 'placements', sample: true,
    q: 'Where can I find placement details?',
    alts: ['How do I check placement information', 'Where are placement updates posted', 'Who handles placements in the college', 'Placement cell information', 'How do I know about upcoming placement drives'],
    kw: 'placement details information cell officer drive update notice',
    a: 'Placement information and upcoming drives are shared by the Training & Placement cell through notices and your department. [Placeholder. Add the verified contact and portal.]' },

  { id: 'pl2', cat: 'placements', sample: true,
    q: 'What companies visit for placement?',
    alts: ['Which companies come for campus recruitment', 'List of recruiters', 'Which companies recruited last year', 'Placement companies list', 'Which companies hire from the college'],
    kw: 'company companies recruiter recruit hiring visit placement list',
    a: 'The list of visiting companies changes every year. The placement cell announces confirmed companies for your batch. [Placeholder. No verified company list has been added.]' },

  { id: 'pl3', cat: 'placements', sample: true,
    q: 'How do I apply for an internship?',
    alts: ['How to get an internship', 'Can I do an internship during the semester', 'Internship permission letter', 'Where can I find internship opportunities', 'Internship application process'],
    kw: 'internship intern apply permission letter opportunity summer industrial',
    a: 'Internships are arranged through the placement cell or found by students with approval from the department. Collect a permission letter before joining. [Sample answer. Confirm the process.]' },

  { id: 'pl4', cat: 'placements', sample: true,
    q: 'What is the eligibility for campus placement?',
    alts: ['What are the placement eligibility criteria', 'Who can sit for campus drives', 'Do arrears affect placements', 'Minimum CGPA for placement', 'Placement requirements'],
    kw: 'eligibility eligible criteria cgpa arrear backlog percentage placement requirement',
    a: 'Eligibility is set by each recruiting company and usually depends on academic performance and arrear status. [Placeholder. Add verified criteria and CGPA cut-offs.]' },

  { id: 'pl5', cat: 'placements', sample: true,
    q: 'Is there a training program for placements?',
    alts: ['Does the college provide placement training', 'Aptitude and soft skills training', 'Are there coaching classes for interviews', 'Mock interview sessions', 'Placement preparation support'],
    kw: 'training program aptitude soft skill interview coaching mock preparation placement',
    a: 'The placement cell organises aptitude, communication and technical training before the placement season. [Placeholder. Add the verified schedule.]' },

  /* ---------------- Fees & Scholarships ---------------- */
  { id: 'fe1', cat: 'fees', sample: true,
    q: 'What is the fee structure?',
    alts: ['How much is the tuition fee', 'What are the college fees', 'Fee details for my course', 'How much do I have to pay each year', 'Fees for B.E. programmes'],
    kw: 'fee structure tuition amount cost course year semester',
    a: 'Fees depend on the programme, quota and academic year. The accounts office publishes the official fee table. [Placeholder. Add the verified fee amounts.]' },

  { id: 'fe2', cat: 'fees', sample: true,
    q: 'How can I pay my fees?',
    alts: ['What are the fee payment modes', 'Can I pay college fees online', 'How do I pay the semester fee', 'Fee payment procedure', 'Where do I pay the fees'],
    kw: 'pay payment fee online bank dd cash counter mode procedure',
    a: 'Fees are paid at the college accounts office or through the modes announced by the college. Always collect a receipt. [Placeholder. Add the verified payment modes.]' },

  { id: 'fe3', cat: 'fees', sample: true,
    q: 'What is the last date for fee payment?',
    alts: ['When is the fee due', 'Fee payment deadline', 'Is there a fine for late fee payment', 'Due date for semester fees', 'Last date to pay fees'],
    kw: 'last date deadline due fee payment fine late',
    a: 'Due dates are announced by the accounts office through notices. [Placeholder. No verified dates have been added.]' },

  { id: 'fe4', cat: 'fees', sample: true,
    q: 'What scholarships are available?',
    alts: ['How can I apply for a scholarship', 'Are there fee concessions for students', 'Government scholarship for engineering students', 'First graduate scholarship', 'Scholarship eligibility'],
    kw: 'scholarship concession first graduate govt government merit eligibility apply financial aid',
    a: 'Scholarships may be available through government schemes and merit or management concessions. Eligibility and documents vary by scheme. [Placeholder. Add the verified scholarship list.]' },

  { id: 'fe5', cat: 'fees', sample: true,
    q: 'How can I get a fee receipt?',
    alts: ['I lost my fee receipt', 'Where do I collect the payment receipt', 'Duplicate fee receipt request', 'Fee paid certificate', 'Proof of fee payment'],
    kw: 'receipt fee paid duplicate lost proof certificate accounts',
    a: 'Request a duplicate receipt from the accounts office with your student details. [Placeholder. Add the verified procedure.]' },

  /* ---------------- Library, Transport & Hostel ---------------- */
  { id: 'lb1', cat: 'campus', sample: true,
    q: 'What are the library timings?',
    alts: ['What time does the library open', 'When does the library close', 'Library working hours', 'Is the library open on Saturdays', 'Library opening hours'],
    kw: 'library timing hours open close working saturday sunday',
    a: 'The library is open from 8:30 AM to 5:30 PM on all working days. [Sample timing. Replace with the verified library hours.]' },

  { id: 'lb2', cat: 'campus', sample: true,
    q: 'How many books can I borrow from the library?',
    alts: ['What is the book borrowing limit', 'How do I issue a book', 'How long can I keep a library book', 'Library card and borrowing rules', 'Fine for late return of books'],
    kw: 'library book borrow issue return limit card fine loan',
    a: 'Students can borrow books with their library card, up to the limit set by the library, for a fixed loan period. [Placeholder. Add the verified limit, period and fine.]' },

  { id: 'tr1', cat: 'campus', sample: true,
    q: 'What are the bus routes and timings?',
    alts: ['Which bus routes does the college run', 'What time does the college bus start', 'Bus timing for my area', 'College transport details', 'Where does the college bus stop'],
    kw: 'bus route routes timing transport stop pickup area',
    a: 'The transport office publishes route lists and timings every academic year. [Placeholder. Add verified routes, stops and timings.]' },

  { id: 'tr2', cat: 'campus', sample: true,
    q: 'How do I get a bus pass?',
    alts: ['How to register for college transport', 'Bus pass application', 'Transport fee and registration', 'How do I apply for bus facility', 'Where do I register for the college bus'],
    kw: 'bus pass transport register registration apply fee facility',
    a: 'Apply at the transport office with your ID card and fee receipt to get a bus pass. [Sample answer. Confirm the process.]' },

  { id: 'ho1', cat: 'campus', sample: true,
    q: 'How can I apply for hostel accommodation?',
    alts: ['How do I get a hostel room', 'Hostel admission procedure', 'Is hostel available for first year students', 'Hostel application form', 'Hostel room allotment'],
    kw: 'hostel accommodation room apply admission allotment warden stay',
    a: 'Hostel rooms are allotted by the hostel office on application, subject to availability. [Placeholder. Add the verified process and fee.]' },

  { id: 'ho2', cat: 'campus', sample: true,
    q: 'What are the hostel rules and timings?',
    alts: ['What time must I return to hostel', 'Hostel in and out timings', 'Can I go out on weekends', 'Hostel visitor rules', 'Hostel curfew'],
    kw: 'hostel rules timing curfew entry exit outing visitor warden weekend',
    a: 'Hostel entry and exit timings and visitor rules are set by the hostel office. [Placeholder. Add the verified rules.]' }
];

/* Official contact details. Leave a field empty until the project owner
   supplies a verified value. Empty fields are never shown to students. */
const CONTACT = { office: '', phone: '', email: '', location: '', hours: '' };

/* Sample notices. These are demonstration items, not official notices. */
const SAMPLE_NOTICES = [
  { id: 'n1', title: 'End-semester examination timetable released', cat: 'Exams',      date: '2026-10-28', priority: 'High',   desc: 'Sample notice: the timetable for the upcoming end-semester examinations is shown on the department notice boards. Check your hall ticket for the final centre details.' },
  { id: 'n2', title: 'Campus placement drive for final-year students', cat: 'Placements', date: '2026-10-25', priority: 'High',   desc: 'Sample notice: a recruitment drive for the current final-year batch. Eligible students should register with the placement cell before the announced date.' },
  { id: 'n3', title: 'Annual cultural fest', cat: 'Events',     date: '2026-10-22', priority: 'Normal', desc: 'Sample notice: the annual cultural fest with music, dance, technical events and competitions. Event registration opens through your class advisor.' },
  { id: 'n4', title: 'Transport service update for the holiday', cat: 'Transport',  date: '2026-10-20', priority: 'Normal', desc: 'Sample notice: college bus services will run on a modified schedule during the holiday. Check with the transport office for your route.' }
];
