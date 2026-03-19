# ShiftFlow terminal package

A Vite + React starter package for your scheduling app with:

- grouped weekly schedule layout
- sticky employee column and sticky headers
- department color theming
- drag-and-drop shift movement with dnd-kit
- position-code first cards (P6, P7, U1, etc.)
- right-side health panel
- denser admin-dashboard style UI

## Run it

```bash
cd shiftflow-terminal-package
pnpm install
pnpm dev
```

Then open:

```bash
http://localhost:5174
```

## Build

```bash
pnpm build
pnpm preview
```

## Files to edit first

- `src/App.jsx`
- `src/components/ScheduleGrid.jsx`
- `src/components/ShiftCard.jsx`
- `src/data/scheduleData.js`
- `src/styles.css`

## Next upgrades

- edit drawer on shift click
- open shift creation modal
- conflict validation rules
- undo/redo stack
- keyboard shortcuts
- save schedule state to backend
