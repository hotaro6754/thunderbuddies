# Languages & Formats used in this project

This document lists every programming language, markup language, and configuration/data format present in the repository, where it's used, examples of files, and a short note about the usage.

- HTML
  - Where: frontend UI pages
  - Examples: `Frontend/index.html`, `Frontend/account-aggregator.html`, `Frontend/transactions.html`, `Frontend/pages/transactions.html`
  - Usage: static pages, UI markup for the web app.

- JavaScript
  - Where: frontend behavior, client-side scripts, small Node server
  - Examples: `Frontend/app.js`, `Frontend/scripts/transactions.js`, `server.js` (Node static server), `Frontend/scripts/*.js`
  - Usage: DOM manipulation, page navigation, SIP calculator, chat widget, optional Node server.

- CSS
  - Where: frontend styling
  - Examples: `Frontend/styles.css`, various page-specific CSS files under `Frontend/styles/` (placeholders)
  - Usage: styling and layout for pages and components.

- Python
  - Where: backend API and tests
  - Examples: `Backend/app.py`, `Backend/tests/test_openai_chat.py`, `Backend/__init__.py`
  - Usage: FastAPI backend (OpenAI proxy, Supabase endpoints), pytest-based tests.

- Markdown
  - Where: documentation
  - Examples: `README.md`, `Backend/README.md`
  - Usage: project and backend setup documentation.

- JSON
  - Where: package manifests and lockfiles, node module metadata
  - Examples: `package.json`, `package-lock.json`
  - Usage: Node package manifest and lockfile.

- Plain text / requirements
  - Where: Python dependency manifest
  - Examples: `Backend/requirements.txt`
  - Usage: lists Python packages to install via pip.

- Environment file (dotenv)
  - Where: local environment secrets/config
  - Examples: `.env` (gitignored)
  - Usage: stores secrets and environment variables for local development (OPENAI_API_KEY, SUPABASE_*, etc.).

- Binary / compiled files (not source)
  - Where: virtualenv/pycache and node_modules
  - Examples: `Backend/__pycache__/*.pyc`, `node_modules/*`
  - Note: these are generated and typically excluded from source control; large directories like `node_modules/` should remain ignored.

Notes & recommendations
- If you want a more detailed language breakdown (e.g., TypeScript from node_modules or any incidental files), I can run a file-type scan and produce counts and locations.
- Ensure `.env` remains in `.gitignore` and rotate any keys that were accidentally committed earlier.
- Consider adding a short CONTRIBUTING.md describing which language to use for new components (frontend JS vs backend Python) and where to add tests.

If you'd like, I can also:
- Add a short badge or section in `README.md` summarizing these languages.
- Produce a per-directory language summary with file counts.
