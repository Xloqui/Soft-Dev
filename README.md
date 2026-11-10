# CIT-U Campus Lost and Found System
Software Development Project

A web app that connects students who lost something on campus with the staff who manage found items. Students report lost items, staff check them against found items and notify the student, and the student proves ownership before staff approve the claim and record the return.

> **Rule:** students must **not** be able to browse or search the list of found items, because that invites false claims. Students only see the items staff matched to **their own** report. Every page we build must follow this rule.

## Tech Stack
- **Frontend:** React (Vite), React Router, plain CSS (`src/index.css`, notebook theme)
- **Data (for now):** browser `localStorage`, through `src/data/store.js`
- **Backend (Phase 2):** Supabase (login, PostgreSQL database, photo storage)
- **Hosting (Phase 3):** Vercel or GitHub Pages

## Prerequisites
- Node.js LTS (**22.22 or newer**): check with `node -v`
- Git: check with `git --version`
- VS Code with the ESLint, Prettier, and ES7+ React snippets extensions
- Git set up with the **same email as your GitHub account**, so your commits count:
  ```bash
  git config --global user.name "Your Name"
  git config --global user.email "you@example.com"
  ```

## Getting Started
```bash
1.) Clone the repo
    git clone https://github.com/Xloqui/Soft-Dev.git
    cd Soft-Dev
2.) Type in the terminal:
    git checkout main
    git pull
    npm install   ##Downloads React, Vite, React Router, ESLint
    npm run dev
3.) Open http://localhost:5173. You should see the login page.
```

**Test logins**
- Staff: `admin` / `admin123`
- Student: any student ID, your full name, and a password (first login creates the account)

**Reset demo data:** F12 → Application → Local Storage → `http://localhost:5173` → delete `clf-react-v1`, then refresh.

## Project Structure
```
src/
├── pages/        # One file per screen: auth/, student/, admin/
├── layouts/      # Page shells: header + menu (StudentLayout, AdminLayout)
├── components/   # Reusable UI pieces (cards, dialogs, navbar, status pills)
├── data/         # store.js = all data + actions; useStore() hook
├── lib/          # Small helpers (dates, matching rules, photos, toast)
├── App.jsx       # All routes
└── index.css     # All styles
legacy/           # Old plain-JS version, for reference only
```

## Team Ownership (Phase 1: UI)
| Area | Files | Branch | Owner |
|---|---|---|---|
| Login, routing, header/menu | `pages/auth/`, `layouts/`, `App.jsx` | `loquinario` | _Hans Justin Loquinario_ |
| Student pages (report, my reports, claims) | `pages/student/`, `LostReportCard`, `ClaimDialog` | `Flores` | _Stefanny Jean Flores_ |
| Staff: found items & returns | `pages/admin/FoundItems`, `Returns`, `ItemCard`, `AddFoundItemDialog` | `surname` | _Sef Punay_ |
| Staff: student requests & claims review | `pages/admin/StudentRequests`, `Claims`, `RequestCard`, `lib/matching.js` | `coraza` | _Mitch Walter Coraza_ |
| Data & Supabase (Phase 2), ERD | `data/` | `surname` | _Name_ |

## Workflow: What Everyone Must Do
1. **Never commit directly to `main`.** Work on your own branch (your surname), made from the latest `main`:
   ```bash
   git checkout main
   git pull
   git checkout -b your-surname
   ```
2. **Work mostly in your own files** (see Team Ownership) to avoid merge conflicts.
3. **Commit small and often** with clear messages, e.g. `feat: add claim status filter`.
   Prefixes: `feat:` new feature · `fix:` bug fix · `style:` CSS/layout · `refactor:` cleanup · `docs:` README
4. **Run `npm run lint`** and fix all errors before pushing.
5. **Push your branch** with `git push -u origin your-surname`.
6. **Open a pull request into `main`** on GitHub. Ask at least one teammate to review it before merging.
7. **Keep your branch up to date** with `main` regularly:
   ```bash
   git checkout main
   git pull
   git checkout your-surname
   git merge main
   ```
8. After your PR is merged, update your branch again (step 7) before starting new work.

## Conventions
- Component files use PascalCase (`ItemCard.jsx`); other files and folders use camelCase/lowercase.
- Style with the existing classes in `src/index.css` (`card`, `btn`, `pill`, `note`, `empty`...). No Tailwind.
- Read and change data only through `useStore()`:
  ```jsx
  const { state, session, act } = useStore();   // act.addLostReport({...})
  ```
  New actions go in `src/data/store.js`. Never use `localStorage` directly in a page.
- `ItemCard` (full found-item details) is for **staff pages only**.
- Add your routes to `src/App.jsx` in your own block. If you get a merge conflict there, keep **both** sides' routes.
- Images go in `public/assets/` and are used as `/assets/name.png`.
- Never commit `.env` files, `node_modules`, or `dist`.
- Format on save with Prettier, and fix ESLint warnings before opening a PR.

## Troubleshooting
- **`'...\node_modules\.bin\' is not recognized`?** Your folder path has a `&` in it (e.g. `Campus L&F`). Rename the folder without `&`, reopen it in VS Code, and run `npm run dev` again.
- **`npm run dev` fails after pulling?** Run `npm install` again, since someone may have added a package.
- **`'npm' is not recognized`?** Install Node.js, then close and reopen VS Code.
- **PowerShell says `running scripts is disabled on this system`?** Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once.
- **Blank page?** Press F12 → Console and read the red error.
- **Not sure which branch you're on?** Run `git branch`; the current one has a `*`.

## Documents
- Pitch Presentation
