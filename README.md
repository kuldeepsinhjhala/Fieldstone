# Fieldstone

Fieldstone is a small app that runs in your browser. You pick a folder on your computer, open a JSON file, and edit it as a simple form. You do not need to type braces, commas, or quotes.

When you save, Fieldstone writes the file back to your computer. Nothing is uploaded. Your files stay on your machine.

---

## Why the name?

**Field** is each piece of data you see, like a name, a number, or a yes/no value.

**Stone** means the data stays on your computer. You change one piece at a time, like stacking stones to make a wall.

---

## What can you use it for?

JSON is a common file format for settings, game data, website content, and mock API data.

Fieldstone is useful when you want to:

- Change a config file without fighting JSON syntax
- Edit content or data for a site, game, or tool
- Fix a small mock API file
- Help someone who does not like editing raw JSON

---

## Example: a settings file

Say you have a file named `app-settings.json`:

```json
{
  "site_name": "My Shop",
  "max_items": 50,
  "dark_mode": true,
  "welcome_message": "Hello"
}
```

In Fieldstone this shows up as fields you can change:

| Field in the form | What you type or pick |
| --- | --- |
| Site Name | `My Shop` |
| Max Items | `50` |
| Dark Mode | yes / no |
| Welcome Message | `Hello` |

Keys like `site_name` become labels like **Site Name**. That makes the form easier to read.

When you click **Save Changes**, the same JSON file is written back to disk.

---

## Example: a list of items

JSON can also be a list. Here is `products.json`:

```json
[
  {
    "name": "Notebook",
    "price": 4.5,
    "in_stock": true
  },
  {
    "name": "Pen",
    "price": 1.25,
    "in_stock": false
  }
]
```

Fieldstone shows each product as a group. You can:

- Change a name or price
- Turn **In Stock** on or off
- Add another product (it copies the shape of the last one)
- Remove a product

---

## Example: nested data

Some files have groups inside groups. Here is `education.json`:

```json
[
  {
    "title": "High School",
    "time": {
      "startDate": "2007",
      "endDate": "2019"
    },
    "achievements": ["Honor roll"]
  }
]
```

Fieldstone keeps that shape. **Time** stays a group with **Start Date** and **End Date**. If you add a new item to the list, the new item gets the same nested fields, ready to fill in.

---

## How to use it

1. Open Fieldstone in your browser.
2. Click the folder button and choose a folder. The browser will ask for permission to read and write files.
3. The sidebar lists every `.json` file in that folder (only the files in that folder, not files in subfolders).
4. Click a file. It opens as a form.
5. Change the fields.
6. Click **Save Changes**, or press **Ctrl+S** (Windows/Linux) or **Cmd+S** (Mac).

You can also:

- Create a new JSON file with **New File**
- Delete the open file with **Delete**
- Undo with **Ctrl+Z** and redo with **Ctrl+Shift+Z** (or the toolbar buttons)

If you try to switch files, switch folders, or close the tab with unsaved changes, Fieldstone will ask you to confirm.

---

## Browser notes

Fieldstone uses the browser File System Access API so it can read and write files you allow.

It works best in recent **Chrome**, **Edge**, or other Chromium browsers. Open the app on **localhost** or **HTTPS**.

If you cannot pick a folder, try Chrome or Edge. Safari and Firefox often do not support this well.

---

## Set up the project

You need [Node.js](https://nodejs.org/) on your computer.

Then, in the Fieldstone folder, run:

```bash
npm install
npm run dev
```

Open the URL Vite prints. It is usually `http://localhost:5173`.

To make a production build:

```bash
npm run build
npm run preview
```

`npm run preview` lets you check the built app locally.

---

## How to run tests

Tests live in the `tests` folder. They use [Vitest](https://vitest.dev/).

Run all tests once:

```bash
npm test
```

Re-run tests when files change:

```bash
npm run test:watch
```

Check the code for common mistakes:

```bash
npm run lint
```

What the tests cover:

- `tests/jsonValue.test.js` — helpers that detect types, convert values, and copy nested shapes
- `tests/appContext.test.jsx` — loading folders, opening files, and saving
- `tests/uiFlows.test.jsx` — buttons like save, undo, and delete
- `tests/nestedEditor.test.jsx` — editing lists and nested groups

Before you send a change, run `npm test` and `npm run lint`. Both should pass.

---

## How to contribute

You do not need to be an expert. Small fixes are welcome: clearer labels, bug fixes, tests, or docs.

### 1. Get the code

Fork the repo on GitHub, then clone your fork:

```bash
git clone https://github.com/YOUR-USERNAME/Fieldstone.git
cd Fieldstone
npm install
```

### 2. Make a branch

```bash
git checkout -b my-change
```

Use a short name that describes the change, like `fix-save-error` or `add-empty-state`.

### 3. Run the app

```bash
npm run dev
```

Change the code, then try it in the browser. If you change how files are saved, undo, or the editor form, click through those steps yourself.

### 4. Add or update tests

If you change behavior, add a test or update an existing one in `tests/`.

Then run:

```bash
npm test
npm run lint
```

### 5. Send a pull request

```bash
git add .
git commit -m "Short description of why you made the change"
git push -u origin my-change
```

Open a pull request on GitHub. Write a few sentences about:

- What you changed
- Why it helps
- How you tested it

That is enough. Thank you for helping.

---

## Project layout

```
src/
  components/     UI: folder picker, file list, toolbar, editor
  context/        App state (open folder, current file, save, undo)
  utils/          JSON helpers and labels
tests/            Automated tests
```

---

## Tech stack

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vitest](https://vitest.dev/) for tests
