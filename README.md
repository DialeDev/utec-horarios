# UniScheduler 📅

**Build your UTEC weekly timetable in minutes. No conflicts. Export as PDF.**

UniScheduler is a student-friendly web app that transforms the UTEC "hoja de asesorías" PDF into an interactive, conflict-free schedule builder.

## ✨ Features

- 📄 **Upload PDF** — Parse your UTEC advisory sheet automatically
- 🔧 **Manual Entry** — Add courses manually if needed
- ⚡ **Real-time Conflict Detection** — Never double-book a time slot
- 📅 **Interactive Weekly Grid** — Visual timetable with drag-to-select
- 🎨 **Custom PDF Export** — Download your schedule with themes and colors
- 🔒 **Privacy-first** — All data stays in your browser (localStorage)

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/DialeDev/utec-horarios.git
cd utec-horarios

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 📖 How It Works

1. **Upload your PDF** — Drop your UTEC "hoja de asesorías" (advisory sheet)
2. **Build your schedule** — Click sections to add them to your weekly grid
3. **Export as PDF** — Choose a theme, pick a color, download your schedule

## 🛠️ Tech Stack

- **React 19** + Vite 7
- **Tailwind CSS 4**
- **React Router 7**
- **pdfjs** — PDF parsing
- **jsPDF** — PDF generation

## 📁 Project Structure

```
src/
├── components/
│   ├── Landing.jsx          # Entry: upload or manual
│   ├── PDFUploader.jsx      # PDF upload & parse
│   ├── ScheduleBuilder.jsx   # Accordion + grid + controls
│   └── PDFExporter.jsx       # Theme selector + download
├── context/
│   └── ScheduleContext.jsx   # State management
├── utils/
│   ├── pdfParser.js          # Extract courses from PDF
│   ├── scheduler.js           # Conflict detection
│   ├── pdfGenerator.js       # Generate PDF
│   ├── day.js                # Day parsing
│   └── time.js               # Time parsing
├── App.jsx
└── main.jsx
```

## 🎯 Workflow

```
Upload PDF ──► Parse Data ──► Select Sections ──► Weekly Grid ──► Export PDF
                 │                                      │
          Manual Entry ◄──────────────────────────────────┘
```

## 📄 License

MIT — Free to use and modify.
