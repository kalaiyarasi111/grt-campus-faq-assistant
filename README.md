# GRT Campus FAQ Assistant

A working FAQ chatbot web app for GRT Institute of Engineering and Technology, Tiruttani. It answers only from an approved FAQ dataset and says so when it does not know.

## Run it
Open `dist/index.html` in any modern browser. No server, install or paid service is needed.

Demo login: username `student`, password `campus123`. This is a classroom demo, not production-grade security.

## Edit it
- `src/faq-data.js`  approved FAQs, categories, contact details, sample notices (all sample content, replace with verified information)
- `src/faq-engine.js`  matching engine (normalise, synonyms, typo fix, confidence threshold)
- `src/app.js`, `src/styles.css`  interface
- `assets/`  the two campus photos (entrance = login page, wide building = dashboard)

After editing run `python3 build.py` to rebuild `dist/index.html`.

## Test it
- `node tests/engine.test.js`  matching engine (68 checks)
- `python3 tests/ui_test.py`  end-to-end browser checks of the 12 required cases (needs `pip install playwright` and Chromium)

## Notes
Recent questions, unanswered questions, feedback, notices and theme are stored in the browser (localStorage). The Unanswered Questions screen and notice editing are demonstration admin features with no authentication.
