# 💸 FundsFlow

Build playful "money maps" — flowcharts of how funds move between government
organizations, grants, contracts, NGOs, and the people they help. Runs entirely
on your machine; nothing is deployed or sent anywhere.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## How it works

- **Drag blocks** from the left palette onto the canvas: money sources (Federal
  Agency, State Government, City, Foundation), flow vehicles (Grant, Government
  Contract, Private Contract, Sub-grant), and destinations (NGO, Vendor,
  Program, Community).
- **Connect blocks** by dragging from a block's right handle to another's left
  handle — animated lines show money flowing. Click a line's pill to set the
  amount (`250k`, `1.5m`, `2b` all work).
- **Budget tracking**: every block shows money in, money out, and what's left.
  Send out more than a block has and it gets a friendly 😬 Over budget! badge.
- **Sources** get a "Starting pot" you can type an amount into.
- Charts **auto-save** in your browser (localStorage). Keep multiple named maps
  and switch between them in the toolbar.
- **Export** any map as JSON (re-importable, shareable) or a PNG snapshot.
  Try ✨ Sample for a demo federal-grant journey.

## Stack

Vite + React + TypeScript, [React Flow](https://reactflow.dev) (`@xyflow/react`),
zustand (with localStorage persistence), html-to-image for PNG export.
