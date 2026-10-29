"""End-to-end checks of the 12 required test cases. Run: python3 tests/ui_test.py (after python3 build.py)"""
import pathlib, sys
from playwright.sync_api import sync_playwright

URL = 'file://' + str(pathlib.Path(__file__).resolve().parent.parent / 'dist' / 'index.html')
SHOTS = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else None
results = []
def check(name, cond, extra=''):
    results.append((name, bool(cond)))
    print(('PASS ' if cond else 'FAIL ') + name + (' ' + str(extra) if extra and not cond else ''))

def shot(pg, name):
    if SHOTS:
        pg.wait_for_timeout(600)
        SHOTS.mkdir(parents=True, exist_ok=True)
        pg.screenshot(path=str(SHOTS / (name + '.png')))

def login(pg):
    pg.fill('#u', 'student'); pg.fill('#p', 'campus123'); pg.click('#login-btn')
    pg.wait_for_selector('.sidebar', timeout=6000)

def nav(pg, view):
    pg.click(f'.sidebar a[data-view="{view}"]')
    pg.wait_for_selector(f'.page-{view}')

def ask(pg, text):
    pg.fill('#chat-input', text); pg.press('#chat-input', 'Enter')
    pg.wait_for_selector('.msg.bot:not(.typing) >> nth=-1')
    pg.wait_for_function("() => !document.querySelector('#typing')", timeout=5000)

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': 1366, 'height': 820})
    pg = ctx.new_page()
    errors = []
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' and 'fonts' not in m.text and 'ERR_' not in m.text else None)
    pg.goto(URL)
    shot(pg, '01-login')

    # 2 invalid login
    pg.fill('#u', 'wrong'); pg.fill('#p', 'bad'); pg.click('#login-btn')
    pg.wait_for_selector('.alert.err-box', timeout=4000)
    check('2 invalid login shows clear error', 'Incorrect username or password' in pg.inner_text('#login-alert'))
    # validation of empty fields
    pg.fill('#u', ''); pg.fill('#p', ''); pg.click('#login-btn')
    check('2b empty fields validated', 'enter your username' in pg.inner_text('#u-err') and 'enter your password' in pg.inner_text('#p-err'))
    # show/hide password
    pg.fill('#p', 'abc'); pg.click('#pw-toggle')
    check('2c password show toggle', pg.get_attribute('#p', 'type') == 'text')

    # 1 valid login
    pg.fill('#u', 'student'); pg.fill('#p', 'campus123'); pg.click('#login-btn')
    pg.wait_for_selector('.welcome-ok', timeout=4000)
    check('1a welcome message after login', 'Welcome, Student' in pg.inner_text('.welcome-ok'))
    pg.wait_for_selector('.hero', timeout=5000)
    check('1b dashboard opens', 'Welcome to GRT Campus!' in pg.inner_text('.hero h1'))
    check('1c nine sidebar items', pg.locator('.sidebar a, .sidebar button.nav').count() >= 9)
    shot(pg, '02-home')

    # 3 category opens FAQ list
    pg.click('.cat-card >> nth=1')
    pg.wait_for_selector('details.faq')
    n = pg.locator('details.faq').count()
    cats = set(pg.locator('details.faq summary .tag').all_inner_texts())
    check('3 category opens its FAQ list', n == 5 and cats == {'Attendance & Leave'}, (n, cats))
    shot(pg, '03-faqs')

    # 4 search
    pg.click('[data-act="faq-cat"][data-id="all"]')
    pg.fill('#faq-search', 'library')
    cnt = pg.inner_text('#faq-count')
    check('4 search finds approved FAQ + count', pg.locator('details.faq').count() == 2 and '2 questions' in cnt, cnt)
    pg.fill('#faq-search', 'zzzzqq')
    check('4b empty state', 'No matching questions' in pg.inner_text('#faq-results'))
    pg.fill('#faq-search', '')

    # chat
    pg.click('.sidebar a[data-view="chat"]')
    pg.wait_for_selector('#chat-input')
    check('chat greeting shown', "I'm your GRT Campus Assistant" in pg.inner_text('#msgs'))
    # 11 suggested chip
    pg.click('.chat-suggest .chip >> nth=0')
    pg.wait_for_selector('#typing', timeout=2000)
    check('11a typing indicator visible', True)
    pg.wait_for_function("() => !document.querySelector('#typing')", timeout=5000)
    t = pg.inner_text('#msgs')
    check('11b suggested question answered', '75%' in t and 'How much attendance do I need?' in t)
    check('answer shows category + source', 'Category: Attendance & Leave' in t and 'Source: Approved Campus FAQ' in t)

    # 5 differently worded
    ask(pg, 'what is the minimum attendance percentage?')
    ask(pg, 'How much attendance is required for exams?')
    matched = pg.locator('.matched').all_inner_texts()
    check('5 reworded questions map to same FAQ', matched.count('Matched question: How much attendance do I need?') == 3, matched)

    # 8 feedback
    pg.click('.fb-btn.up >> nth=0')
    check('8a helpful selected + disabled + confirmation', pg.get_attribute('.fb-btn.up >> nth=0', 'aria-pressed') == 'true' and pg.is_disabled('.fb-btn.up >> nth=0'))
    pg.click('.fb-btn.down >> nth=1')
    fb = pg.evaluate("() => JSON.parse(localStorage.getItem('grt.feedback'))")
    check('8b feedback recorded for FAQ', fb.get('at1') == {'up': 1, 'down': 1}, fb)

    # 6 + 7 unknown question
    ask(pg, 'Who is the principal of the college?')
    t = pg.inner_text('#msgs')
    check('6 uncertainty message shown', "Sorry, I couldn't find a verified answer to this question in my approved campus FAQ database. Please contact the college office for confirmation." in t)
    check('6b Contact Help button present', pg.locator('.msg.bot >> text=Contact Help').count() >= 1)
    shot(pg, '04-chat')
    un = pg.evaluate("() => JSON.parse(localStorage.getItem('grt.unanswered'))")
    check('7a unanswered saved with pending status', len(un) == 1 and un[0]['status'] == 'pending' and 'principal' in un[0]['q'], un)
    nav(pg, 'unanswered-questions')
    pg.wait_for_selector('.row-card')
    check('7b appears in tracker', 'principal' in pg.inner_text('.row-card') and pg.inner_text('#pend-badge') == '1')
    shot(pg, '05-unanswered')
    # mark reviewed
    pg.click('[data-act="un-toggle"]')
    check('7c mark reviewed', pg.locator('.row-card').count() == 0)
    pg.click('[data-act="un-filter"][data-id="all"]')
    check('7d reviewed visible under All', pg.locator('.row-card').count() == 1)
    # add approved FAQ requires confirmation
    pg.click('[data-act="un-add"]')
    pg.fill('#af-a', 'Sample verified answer for testing.')
    pg.click('#faq-form button[type=submit]')
    check('7e confirmation required before adding', 'verified' in pg.inner_text('#af-err'))
    pg.check('#af-ok'); pg.click('#faq-form button[type=submit]')
    pg.wait_for_selector('.toast')
    cf = pg.evaluate("() => JSON.parse(localStorage.getItem('grt.customFaqs'))")
    check('7f admin adds approved FAQ', len(cf) == 1)
    nav(pg, 'chat')
    ask(pg, 'Who is the principal of the college?')
    check('7g new approved FAQ is now answered', 'Sample verified answer for testing.' in pg.inner_text('#msgs'))

    # 9 clear chat with confirmation
    pg.click('#clear-chat')
    pg.wait_for_selector('.modal')
    pg.click('#dlg-cancel')
    check('9a cancel keeps conversation', pg.locator('.msg.user').count() >= 4)
    pg.click('#clear-chat'); pg.click('#dlg-ok')
    pg.wait_for_function("() => document.querySelectorAll('.msg.user').length === 0")
    check('9b confirm clears conversation', pg.locator('.msg.user').count() == 0 and "I'm your GRT Campus Assistant" in pg.inner_text('#msgs'))

    # recent questions + reopen
    nav(pg, 'recent-questions')
    check('recent questions listed', pg.locator('.row-card').count() >= 4)
    pg.click('.row-card >> nth=3 >> [data-act="reopen"]')
    pg.wait_for_function("() => document.querySelectorAll('.msg.user').length === 1 && !document.querySelector('#typing')", timeout=6000)
    check('recent question reopens in chat', pg.locator('.msg.user').count() == 1)

    # daily FAQ
    nav(pg, 'faq-of-the-day')
    pg.click('[data-act="daily-reveal"]')
    check('FAQ of the day reveal', pg.locator('.fod-a').count() == 1 and 'Approved Campus FAQ' in pg.inner_text('.fod-a'))
    pg.click('.fb-btn.up')
    check('daily feedback recorded', pg.get_attribute('.fb-btn.up', 'aria-pressed') == 'true')
    shot(pg, '06-daily')

    # notices
    nav(pg, 'notice-board')
    check('4 sample notices labelled sample', pg.locator('.notice').count() == 4 and pg.locator('.tag.sample').count() == 4)
    pg.click('[data-act="notice-cat"][data-id="Exams"]')
    check('notice filter works', pg.locator('.notice').count() == 1)
    pg.click('.notice [data-act="notice-more"]')
    check('read more expands', pg.locator('.desc.clamp').count() == 0)
    shot(pg, '07-notices')

    # contact + about
    nav(pg, 'contact-help')
    check('contact page has no invented details', 'have not been added yet' in pg.inner_text('.page') and '@' not in pg.inner_text('.page'))
    nav(pg, 'about')
    check('about page has architecture diagram', pg.locator('svg.arch').count() == 1)
    shot(pg, '08-about')

    # language
    pg.select_option('#lang', 'ta')
    check('tamil limitation shown', pg.is_visible('#lang-strip'))
    pg.select_option('#lang', 'en')

    # 10 dark mode across pages
    bgs = {}
    pg.click('#theme-sw')
    for v in ['home', 'chat', 'faq-categories', 'notice-board']:
        nav(pg, v)
        bgs[v] = (pg.evaluate("() => getComputedStyle(document.body).backgroundColor"), pg.evaluate("() => document.documentElement.getAttribute('data-theme')"))
    check('10 dark mode persists across pages', all(c[0] == 'rgb(7, 20, 46)' and c[1] == 'dark' for c in bgs.values()), bgs)
    nav(pg, 'home'); shot(pg, '09-home-dark')
    nav(pg, 'chat'); shot(pg, '10-chat-dark')

    # logout
    pg.click('[data-act="logout"]')
    pg.wait_for_selector('#login-form')
    check('logout returns to login', True)
    ctx.close()

    # 12 mobile
    m = b.new_context(viewport={'width': 390, 'height': 800}, device_scale_factor=2, has_touch=True, is_mobile=True)
    mp = m.new_page()
    mp.on('pageerror', lambda e: errors.append(str(e)))
    mp.goto(URL)
    check('12g no overflow on phone (login)', mp.evaluate("() => document.documentElement.scrollWidth <= window.innerWidth + 1 && document.getElementById('login-card').getBoundingClientRect().right <= window.innerWidth - 12"))
    shot(mp, '11-login-mobile')
    mp.fill('#u', 'student'); mp.fill('#p', 'campus123'); mp.click('#login-btn')
    mp.wait_for_selector('.hero', timeout=6000)
    sw = mp.evaluate("() => document.documentElement.scrollWidth <= window.innerWidth + 1")
    check('12a no horizontal overflow on phone (home)', sw)
    check('12b sidebar hidden, hamburger visible', not mp.is_visible('#menu-btn') is False and mp.evaluate("() => document.getElementById('sidebar').getBoundingClientRect().right <= 0"))
    mp.click('#menu-btn')
    mp.wait_for_timeout(350)
    check('12c drawer opens', mp.evaluate("() => document.getElementById('sidebar').getBoundingClientRect().left >= 0"))
    shot(mp, '12-home-mobile-menu')
    mp.click('.sidebar a[data-view="chat"]')
    mp.wait_for_selector('#chat-input')
    mp.fill('#chat-input', 'library timing'); mp.click('#send-btn')
    mp.wait_for_function("() => document.querySelector('.msg.bot .matched')", timeout=6000)
    check('12d chat works on phone', '8:30 AM' in mp.inner_text('#msgs'))
    check('12e no overflow on phone (chat)', mp.evaluate("() => document.documentElement.scrollWidth <= window.innerWidth + 1"))
    shot(mp, '13-chat-mobile')
    for v in ['faq-categories', 'notice-board', 'unanswered-questions', 'about']:
        mp.evaluate(f"() => location.hash = '{v}'")
        mp.wait_for_selector(f'.page-{v}'); mp.wait_for_timeout(300)
        ok = mp.evaluate("() => document.documentElement.scrollWidth <= window.innerWidth + 1 && document.getElementById('main').scrollWidth <= document.getElementById('main').clientWidth + 1")
        check(f'12f no overflow on phone ({v})', ok)
    mp.evaluate("() => location.hash = 'home'"); mp.wait_for_selector('.page-home'); mp.wait_for_timeout(300)
    mp.evaluate("() => document.getElementById('main').scrollTo(0, 99999)"); shot(mp, '14-home-mobile-bottom')
    m.close()
    b.close()

    check('no console/page errors', not errors, errors)

failed = [n for n, ok in results if not ok]
print(f'\n{len(results) - len(failed)} passed, {len(failed)} failed')
sys.exit(1 if failed else 0)
