# Advanced Spreadsheet App

A pixel-perfect, static React + TypeScript spreadsheet prototype inspired by Google Sheets/Excel, built with Vite and Tailwind CSS.  
Implements a highly interactive, Figma-matched spreadsheet UI with keyboard navigation, column hide toggles, and export features.

---

## 🚀 Setup

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Start the development server:**
   ```sh
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

3. **Lint and type-check:**
   ```sh
   npm run lint
   npm run type-check
   ```

4. **Build for production:**
   ```sh
   npm run build
   ```

---

## 🛠️ Tech Stack

- **React 19** (with Vite)
- **TypeScript** (strict mode)
- **Tailwind CSS** (utility-first styling)
- **Simple HTML table** (custom grid logic, no external table library)
- **No backend/state management library** (all state is local)
- **lucide-react** for icons
- **sonner** for toasts/notifications

---

## 🎯 Features & Criteria

- **Pixel-perfect layout** matching [Figma design](https://www.figma.com/design/3nywpu5sz45RrCmwe68QZP/Intern-Design-Assigment?node-id=2-2535&t=DJGGMt8I4fiZjoIB-1)
- **Spreadsheet experience:**  
  - Editable grid with keyboard navigation (arrow keys, Enter, Escape)
  - Column hide/show toggles in toolbar
  - Sort and filter (via UI and tabs)
  - Add/remove rows and columns
  - Export to Excel (visible columns only)
  - All buttons/tabs are interactive (log to console or show toast)
- **Responsive, accessible UI** with sticky headers, colored badges, and tooltips
- **No dead UI:** All controls provide feedback or state changes
- **Code quality:** Passes ESLint, Prettier, and TypeScript checks

---

## ⚡ Trade-offs & Notes

- **No backend:** All data is local and resets on refresh.
- **No state management library:** State is managed via React hooks.
- **No authentication or sharing:** "Share" and "Import" buttons show toasts only.
- **Simple HTML table** is used for custom grid logic and no external table library is used.
- **Export** uses only visible columns and current data.
- **Stretch:** Keyboard navigation, column resize/hide, and toasts are implemented.
- **Design:** Some minor spacing or color differences may exist due to browser rendering vs. Figma.

---

## 📦 Submission

- **Live URL:** _[(https://jayeshrajbhar.github.io/advanced-spreadsheet-app/)]_
- **GitHub:** _[(https://github.com/JayeshRajbhar/advanced-spreadsheet-app)]_

---

## 📝 Scripts

- `npm run dev` — Start local dev server
- `npm run build` — Build for production
- `npm run lint` — Run ESLint and Prettier
- `npm run type-check` — Run TypeScript in strict mode

---

## 🙏 Credits

- [Figma Design](https://www.figma.com/design/3nywpu5sz45RrCmwe68QZP/Intern-Design-Assigment?node-id=2-2535&t=DJGGMt8I4fiZjoIB-1)
- [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/),