# Scheduler

A lightweight weekly planner for quickly jotting down tasks per day, navigating weeks, and sharing your plan via the URL — no backend, no accounts.

Live: https://scheduler.mju.no

## What it does
- Plan by week (the path’s first segment is the week’s Monday in ISO format)
- Add, edit, and reorder items per day (drag-and-drop)
- Toggle weekends on/off
- Choose date format and heading level in Settings
- Export a rich-text snippet (HTML) for copy/paste
- Shareable links: items are stored compactly in the URL hash (base64). No data leaves your browser.

## Quick start
- Requirements: Node 18+
- Install deps: `npm install`
- Start dev server: `npm run dev`
- Run tests: `npm test`
- Lint: `npm run lint`
- Build: `npm run build` then preview: `npm run preview`

## How links encode your plan
- Path: `/{mondayISO}` anchors the visible week (example: `/2025-01-06`).
- Search params: `dateFormat`, `headingLevel`, `weekends=1`.
- Hash: base64-encoded items only; safe to share and persists your list without a backend.

## Tech
React + TypeScript + Vite, React Router, Luxon, Vitest, Testing Library.

## Experimental and AI Generated code
This app is generated with the help of the Github Copilot plugin.  
It started off as a simple side-project to generate week plans for Confluence.  
Now it is used as a playground for learning new technologies.  
If you intend to use it for anything serious, consider forking the repo and run it locally.
