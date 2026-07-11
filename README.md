# UniScheduler

**Build your UTEC weekly timetable in minutes. No conflicts. Export as PDF.**

UniScheduler is a student-friendly web app that transforms the UTEC "hoja de asesorias" PDF into an interactive, conflict-free schedule builder.

## Features

- **Upload PDF** — Parse your UTEC advisory sheet automatically
- **Manual Entry** — Add courses manually if needed
- **Real-time Conflict Detection** — Never double-book a time slot
- **Interactive Weekly Grid** — Visual timetable with conflict highlighting
- **Custom PDF Export** — Download your schedule
- **Privacy-first** — All data stays in your browser (localStorage)

## Quick Start

```bash
# Clone the repo
git clone https://github.com/DialeDev/utec-horarios.git
cd utec-horarios

# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173)

## How It Works

1. **Upload your PDF** — Drop your UTEC "hoja de asesorias" (advisory sheet)
2. **Build your schedule** — Click sections to add them to your weekly grid
3. **Export as PDF** — Pick a theme, download your schedule

## Tech Stack

- **React 19** + Vite 7
- **Tailwind CSS 4**
- **React Router 7**
- **pdfjs** — PDF parsing with Y-position-aware table extraction
- **jsPDF** — PDF generation (schedule export)
- **react-icons** — Feather icons throughout the UI
- **sonner** — Toast notifications

## Project Structure

```
src/
├── components/
│   ├── Phase1/
│   │   └── SubjectManager.jsx   # Add/edit/delete courses and sections
│   ├── CourseAccordion.jsx      # Expandable course list with sections
│   ├── ErrorBoundary.jsx        # Error boundary with reload
│   ├── Landing.jsx              # Entry: upload PDF or manual entry
│   ├── Layout.jsx               # App shell with header + nav
│   ├── PDFExporter.jsx          # Schedule PDF export with themes
│   ├── PDFUploader.jsx          # PDF file upload and parse trigger
│   ├── ScheduleBuilder.jsx      # Orchestrator: accordion + grid + controls
│   ├── ToastProvider.jsx        # Sonner toast container
│   └── WeeklyGrid.jsx           # Visual timetable grid
├── context/
│   └── ScheduleContext.jsx      # Schedule + subjects state management
├── utils/
│   ├── pdfParser.js             # Y-position-aware PDF course extraction
│   ├── scheduler.js             # Conflict detection
│   ├── pdfGenerator.js          # Schedule PDF generation
│   ├── day.js                   # Day parsing (Lu-Vi -> Lunes..Viernes)
│   └── time.js                  # Time parsing and conflict math
├── App.jsx
└── main.jsx
```

## Workflow

```
Upload PDF --> Parse Data --> Select Sections --> Weekly Grid --> Export PDF
                 |                                |
          Manual Entry <---------------------------+
```

## License

MIT — Free to use and modify.
