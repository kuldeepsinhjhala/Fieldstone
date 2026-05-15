# Fieldstone

A small, browser-based tool for opening a folder on your computer, picking JSON files, and editing them through a simple form instead of raw text. Changes are saved straight back to those files on disk.

---

## Why Fieldstone?

The name is a nod to how the app treats your data.

**Field** suggests the individual pieces you work with: each key and value appears as a clear *field* in the editor, not buried in syntax.

**Stone** suggests something solid and grounded: your JSON files stay on your own machine, and you build or adjust structure piece by piece—similar in spirit to *fieldstone* walls, where stones are shaped and fitted together into something stable.

Together, **Fieldstone** is meant to feel approachable: structured editing with a firm footing in the files you already have.

---

## What is this for?

JSON shows up everywhere: app settings, game data, API mocks, translation files, and small databases of structured information. **Fieldstone** is for anyone who wants to **view and change that data in a clear, structured way** without hunting through braces and commas in a text editor.

It works entirely in the browser. Your files stay on your machine; nothing is uploaded to a server.

---

## How it works

1. **Choose a folder**  
   You pick a folder using your browser’s folder picker. The app needs permission to read and write so it can list and save JSON files.

2. **See your JSON files**  
   The sidebar lists every `.json` file in that folder (at the top level of the folder you chose).

3. **Open and edit**  
   When you select a file, its contents are shown as a **tree of fields**: text, numbers, yes/no values, lists, and nested groups. Keys are turned into readable labels where it helps.

4. **Save**  
   Use **Save Changes** in the toolbar, or **Ctrl+S** (Windows/Linux) / **Cmd+S** (macOS). The file is written back with neat formatting (indented JSON).

You can also **create** a new empty JSON file, or **delete** the file you have open, from the toolbar.

---

## When you might use it

- Tweaking **config or environment-style JSON** you keep in a project folder  
- Editing **content or data files** for a site, game, or tool  
- Quickly fixing **mock API responses** or small datasets  
- Sharing a friendlier editor with someone who is **not comfortable editing raw JSON**

---

## Tech stack

- [React](https://react.dev/)  
- [Vite](https://vitejs.dev/)  
- [Tailwind CSS](https://tailwindcss.com/)

---

## Getting started

You need [Node.js](https://nodejs.org/) installed.

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

To create a production build:

```bash
npm run build
npm run preview
```

---

## Browser notes

This app uses the **File System Access API** so the browser can read and write files you explicitly allow. That works best in recent **Chrome**, **Edge**, or other Chromium-based browsers, and the page should be served over **HTTPS** or **localhost**.

Safari and Firefox support for this API is more limited; if the folder picker or saving does not work, try a Chromium-based browser.

---

Contributions and feedback are welcome if you find this useful.
