# Product Requirements Document (PRD)
## Horarios Utec — Schedule Builder & PDF Export Platform

**Version**: 2.0  
**Date**: May 2026  
**Status**: MVP 
**Deployment Target**: Vercel 

---

## 1. Executive Summary

**Horarios Utec** is a student-friendly schedule builder that transforms how UTEC (Universidad Tecnológica de El Salvador) students construct their weekly course timetables.

### Problem Statement
Students at UTEC receive a PDF "hoja de asesorías" (advisory sheet) listing all available courses, sections, days, and times for the academic cycle. Currently, they must manually cross-reference sections to avoid time conflicts and visualize their schedule. This is error-prone, time-consuming, and unintuitive.

### Solution
A web application that:
1. **Accepts PDF upload** of the hoja de asesorías
2. **Auto-populates courses & sections** from the PDF
3. **Allows manual or semi-automatic assembly** of conflict-free schedules
4. **Generates shareable PDF exports** with customizable theme and color

### Outcome
Students complete schedule construction in **5–10 minutes** (vs. 30+ minutes manual), with **zero conflict errors**.

---

## 2. Core User Flow

```
┌─────────────────────────────────────────────────────────┐
│  Landing Page                                            │
│  - "Upload hoja de asesorías" button                     │
│  - "Start manually" button (for testing)                 │
└──────────────────┬────────────────────────────────────┘
                   │
         ┌─────────┴──────────┐
         │                    │
         ▼                    ▼
   ┌──────────────┐    ┌──────────────┐
   │ Upload PDF   │    │ Manual Entry │
   └──────┬───────┘    └──────┬───────┘
          │                    │
          └─────────┬──────────┘
                    ▼
        ┌─────────────────────────┐
        │  Parse & Extract Data   │
        │  (Courses + Sections)   │
        └──────────┬──────────────┘
                   │
                   ▼
        ┌─────────────────────────┐
        │  Schedule Builder       │
        │  - Accordion (courses)  │
        │  - Weekly grid (visual) │
        │  - Click to select      │
        └──────────┬──────────────┘
                   │
                   ▼
        ┌─────────────────────────┐
        │  Conflict Detection     │
        │  (Real-time, per click) │
        └──────────┬──────────────┘
                   │
         ┌─────────▼──────────┐
         │                    │
      ┌──▼──────┐        ┌───▼──────┐
      │ Conflict│        │ Allowed  │
      │ (Alert) │        │ (Add)    │
      └─────────┘        └───┬──────┘
                              │
                              ▼
                 ┌────────────────────────┐
                 │ Export as PDF          │
                 │ - Theme selection      │
                 │ - Primary color picker │
                 │ - Download button      │
                 └────────────────────────┘
```

---

## 3. Feature Requirements

### 3.1 Landing / Entry Point
- **Upload PDF button**: Accepts `.pdf` files (hoja de asesorías format)
- **Manual entry button**: Skip upload, enter courses manually (for testing)
- **Info card**: Brief explanation of the workflow
- **Responsive**: Works on desktop, tablet, mobile

### 3.2 PDF Upload & Parsing
- **Supported format**: UTEC hoja de asesorías PDF (table structure)
- **Extraction logic**:
  - Detect table rows with: `Ciclo | Código | Materia | Sección | Matrícula | Dias | Hora | Aula`
  - Skip header and metadata rows
  - Parse day ranges (`Lu-Vi`, `Mie-Sab`, `Lu, Vi`, etc.)
  - Parse time ranges (`HH:MM-HH:MM`)
  - Handle "EN LINEA" and physical room codes
- **Error handling**:
  - If PDF is not valid → show error message, allow retry
  - If table structure is unrecognized → show error message, suggest manual entry
  - If parse fails for a single row → warn user, skip row, continue
- **Output**: Array of Course objects with Sections
- **Worker configuration**: pdfjs-dist worker MUST be bundled locally via Vite's `?url` import syntax. NO CDN loading. Prevents "error loading dynamically imported module" failures.

### 3.3 Course & Section Management
#### Data Model
```javascript
Course {
  id: string,           // UUID
  code: string,         // e.g., "BAS2-I"
  name: string,         // e.g., "BASE DE DATOS II"
  cicle: number,        // from PDF (3, 4, 5, 7, etc.)
  sections: Section[]
}

Section {
  id: string,           // UUID
  number: string,       // e.g., "01"
  days: string,         // original: "Ma-Ju", normalized: [3, 4] (day indices)
  time: string,         // "09:45-11:15" → normalized to { start: 585, end: 675 }
  room: string,         // "EN LINEA", "SB-508", etc.
  matricula: number     // enrollment #
}

ScheduleItem {
  id: string,
  courseId: string,
  sectionId: string,
  // + flattened fields for quick lookup
  code, name, room, days, time, matricula
}
```

### 3.4 Schedule Builder Interface
#### Left Panel: Course Accordion
- **List all courses** from parsed PDF (or manual input)
- **Group by course code** (e.g., "BAS2-I")
- **Each course shows**:
  - Course name
  - Expandable sections list
- **Each section shows**:
  - Section #, Days, Time, Room
  - Visual indicator: ✓ (selected), ✗ (conflicted), ○ (available)
  - Click to toggle (add/remove from schedule)

#### Right Panel: Weekly Grid
- **7-column layout**: Monday–Sunday
- **Time axis**: 06:00 → 22:00 (16 hours)
- **Cell size**: 30-min blocks
- **Each schedule item** displayed as a colored block:
  - Color: primary brand color (customizable)
  - Text: course code + section + room
  - Hover: show full details (name, matrícula, time)
  - Click: remove from schedule

#### Conflict Detection
- **Real-time**: On each add attempt
- **Logic**: 
  - Parse both items' days → day indices (0=Mon, 6=Sun)
  - Parse both items' times → minutes since 00:00
  - If ANY day overlaps AND times overlap → CONFLICT
- **UX on conflict**:
  - Toast notification (not `alert()`): "Conflicto con [COURSE] ([days] [time])"
  - Section remains unselected (not added)
  - Suggestion: Try a different section

### 3.5 Export to PDF (MVP — simplified)
#### Export Dialog
- **Single button**: "Descargar PDF" triggers download immediately
- **No theme selector, no color picker, no preview** (future enhancement)
- Colors default to UTEC brand palette

#### PDF Generation
- **Layout**:
  - Header: "Mi Horario" + generation date
  - Weekly grid (Mon–Sun, 06:00–22:00, 30-min blocks)
  - Color-coded schedule items (UTEC brand colors)
  - Legend: course codes + room assignments
  - Footer: Generated date, "Built with Horarios Utec"
- **Size**: A4 landscape
- **Font**: Clean, readable (sans-serif)
- **Accessibility**: High contrast for readability

#### Download
- **Filename**: `mi-horario-[date].pdf` (e.g., `mi-horario-2026-07-10.pdf`)
- **Button**: "Descargar PDF"

---

## 4. Non-Functional Requirements

### 4.1 Performance
- **PDF upload & parse**: ≤ 2 seconds
- **Weekly grid render**: ≤ 500ms (even with 6 courses)
- **PDF export generation**: ≤ 3 seconds
- **Bundle size**: ≤ 500 KB (gzipped)

### 4.2 Scalability
- **Max courses per schedule**: 10 (typical student load)
- **Max sections per course**: 20
- **Total schedule items**: ≤ 50 (hard limit)

### 4.3 Browser Support
- **Modern browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Mobile**: iOS Safari 14+, Android Chrome 90+
- **No IE11 support** (use modern ES2020 syntax)

### 4.4 Data Persistence
- **Local storage**: All course data + schedule + user theme preferences stored in `localStorage`
- **Sync**: None. Client-only. No server backend.
- **Export**: JSON snapshot downloadable for backup
- **Import**: (Future feature) Upload JSON snapshot to restore schedule

### 4.5 Accessibility (WCAG 2.1 AA)
- Semantic HTML (headings, nav, sections)
- ARIA labels on interactive elements
- Keyboard navigation for schedule grid
- Color contrast ≥ 4.5:1 for text
- Focus indicators visible
- Form inputs labeled

### 4.6 SEO (if public)
- Meta tags: title, description, og:image, og:url
- Structured data: JSON-LD for Event schema (optional)
- Robot indexing: Allow (if public); may consider disallow for single-user tools

### 4.7 Security
- **No authentication**: Open tool (students upload public PDFs)
- **No backend**: All parsing + storage is client-side
- **PDF handling**: Use trusted library (pdfjs, pdfparse, etc.)
- **No sensitive data collection**: No tracking, no analytics by default
- **HTTPS only**: Deployed on Vercel (enforced)

### 4.8 Error Handling & Logging
- **Toast notifications** for all user-facing errors (not `alert()`)
- **Error boundary** component to catch React errors
- **Console logging** for debugging (respect `localStorage` for opt-in analytics)
- **Graceful degradation**: If localStorage is full, warn user; if PDF parse fails, suggest manual entry

---

## 5. Technical Architecture

### 5.1 Stack
- **Frontend**: React 19 + Vite 7
- **Styling**: Tailwind CSS 4
- **Routing**: React Router 7
- **State**: Context API (ScheduleContext)
- **PDF Parsing**: pdfjs-dist (worker bundled locally via Vite `?url` import — NO CDN)
- **PDF Generation**: jsPDF (MVP uses simple layout, no html2canvas)
- **Deployment**: Vercel (Static SPA — no server-side needed)

### 5.2 Project Structure
```
src/
├── components/
│   ├── Landing.jsx         # Entry page: upload or manual start
│   ├── PDFUploader.jsx      # File input, PDF parsing orchestration
│   ├── ScheduleBuilder.jsx  # Layout: accordion + grid + controls
│   │   ├── CourseAccordion.jsx
│   │   ├── WeeklyGrid.jsx
│   │   └── ConflictDetector.jsx (logic, not UI)
│   ├── PDFExporter.jsx      # Generate & download PDF (simplified MVP)
│   └── ErrorBoundary.jsx    # React error fallback
├── context/
│   └── ScheduleContext.jsx  # State: courses, schedule, dispatch
├── utils/
│   ├── pdfParser.js         # Extract courses from PDF
│   ├── scheduler.js         # Conflict detection, schedule logic
│   ├── pdfGenerator.js      # Generate PDF with jsPDF
│   ├── day.js               # Day parsing: "Lu-Vi" → [0, 1, 2, 3, 4]
│   └── time.js              # Time parsing: "09:45-11:15" → { start, end }
├── styles/
│   └── globals.css          # Tailwind + theme vars
├── App.jsx
├── main.jsx
└── index.html
```

### 5.3 Routes (if multi-page)
```
/              → Landing (upload or manual)
/schedule      → ScheduleBuilder + PDFExporter
/help          → Help / FAQ (optional)
```

### 5.4 Deployment
- **Hosting**: Vercel (auto-deploy on git push)
- **Environment**: Static SPA (no backend needed)
- **Build**: `npm run build` → optimized production build
- **CI/CD**: GitHub Actions (lint, build, test, deploy)

---

## 6. User Stories & Acceptance Criteria

### Story 1: Upload & Parse PDF
**As a** student  
**I want to** upload my hoja de asesorías PDF  
**So that** the app automatically populates my available courses and sections

**Acceptance Criteria**:
- [ ] Upload button accepts `.pdf` files
- [ ] PDF is parsed within 2 seconds
- [ ] All courses and sections are extracted accurately
- [ ] If PDF format is invalid, a friendly error message appears
- [ ] Manual entry option is available as fallback

### Story 2: Build Schedule Manually
**As a** student  
**I want to** click on sections to add them to my schedule  
**So that** I can visually assemble a conflict-free weekly timetable

**Acceptance Criteria**:
- [ ] Courses are grouped in an accordion on the left
- [ ] Sections show day, time, and room
- [ ] Clicking a section adds it to the weekly grid
- [ ] Grid displays 7 days (Mon–Sun) and 16 hours (06:00–22:00)
- [ ] Each section appears as a colored block on the grid
- [ ] Clicking a block removes the section from the schedule

### Story 3: Conflict Detection
**As a** student  
**I want to** see an error when I try to select conflicting sections  
**So that** I can avoid scheduling mistakes

**Acceptance Criteria**:
- [ ] On conflict, a toast notification appears (not `alert()`)
- [ ] Section is not added to the schedule
- [ ] Error message shows which course conflicts and its time
- [ ] User can retry a different section

### Story 4: Export to PDF
**As a** student  
**I want to** download my schedule as a PDF  
**So that** I can print it, email it, or keep it as a record

**Acceptance Criteria**:
- [ ] "Descargar PDF" button downloads the schedule immediately
- [ ] PDF is A4 landscape, readable, and printable
- [ ] Header shows "Mi Horario" + generation date
- [ ] Courses are color-coded with UTEC brand colors
- [ ] Legend includes course codes and rooms

### Story 5: Data Persistence
**As a** student  
**I want to** close and reopen the app without losing my schedule  
**So that** I can build my schedule over multiple sessions

**Acceptance Criteria**:
- [ ] Courses and schedule are saved to `localStorage`
- [ ] On page refresh, the schedule is restored
- [ ] User theme preference is saved

---

## 7. Out of Scope (Future Phases)

1. **Backend API**: No user authentication, no server-side persistence
2. **Multi-user sync**: No cloud storage, no account system
3. **Export formats**: Only PDF for now (not Excel, iCal, etc.)
4. **Import from other sources**: Only UTEC hoja de asesorías PDFs
5. **Conflict resolution AI**: Only manual selection; no auto-optimization
6. **Real-time conflict warnings**: Warnings appear on click only
7. **Notifications**: No email, SMS, or calendar invites
8. **Analytics**: No user tracking (privacy-first)
9. **PDF themes & customization**: Color picker, theme selector (Light/Dark/Colorful), and PDF preview are future enhancements
10. **Export content options**: Toggle matrícula on/off in PDF, include/exclude rooms — deferred

---

## 8. Success Metrics

1. **Load time**: ≤ 3 seconds (Time to Interactive)
2. **PDF parse success rate**: ≥ 99%
3. **Conflict detection accuracy**: 100% (no false positives)
4. **User satisfaction**: ≥ 4.5/5 stars (if feedback collected)
5. **Error rate**: ≤ 0.1% (monitored via error logs)
6. **Accessibility score**: ≥ 90/100 (Lighthouse audit)

---

## 9. Timeline & Phases

### Phase 1: Foundation + PDF Parsing (prioritario)
- Configurar worker de pdfjs-dist localmente (no CDN)
- Landing page funcional con upload y entrada manual
- PDF upload + parseo completo de hoja de asesorías
- Testear con hoja_asesorias_example.pdf

### Phase 2: Schedule Builder
- Course accordion en panel izquierdo
- Weekly grid en panel derecho (Mon–Sun, 06:00–22:00)
- Conflict detection en tiempo real (toast notifications con sonner)
- Agregar/quitar materias del horario

### Phase 3: PDF Export
- Exportar horario a PDF (A4 landscape, jsPDF)
- Información clara, colores UTEC por defecto
- Nombre de archivo: mi-horario-[fecha].pdf

### Phase 4: Polish + Deploy
- Deploy a Vercel (static SPA)
- Error handling y edge cases
- Pruebas con compañeros de la UTEC
- Feedback loop para ajustar parseo según PDFs reales

---

## 10. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| PDF structure varies across UTEC exports | Medium | High | Build flexible parser; test with multiple PDFs; fallback to manual entry |
| Browser localStorage quota exceeded | Low | Medium | Warn user; offer JSON export/import |
| Conflict detection edge cases (multi-day events, extended hours) | Low | Medium | Comprehensive unit tests; edge case testing |
| Mobile UX: grid too small on phone | Medium | Medium | Responsive design; consider vertical layout on mobile; zoom/scroll |
| Performance: PDF generation slow | Low | Medium | Optimize jsPDF usage; lazy-load PDF library |
| Accessibility not met | Low | Medium | WCAG audit before launch; keyboard navigation tests |
| **pdfjs-dist worker fails to load** | **Medium** | **High** | Bundle worker locally via Vite `?url` import; never depend on CDN |

---

## 11. Appendix: Example Data Flow

### PDF Upload & Parse
```
User uploads hoja_asesorias.pdf
   ↓
pdfParser.extractPages()
   ↓
Detect table rows with [Ciclo, Código, Materia, Sección, Matrícula, Días, Hora, Aula]
   ↓
For each row:
  - Extract: { code, name, section, matricula, days, time, room }
  - Normalize: days → [0, 1, 2, ...], time → { start, end }
  - Create Course & Section objects
   ↓
ScheduleContext.setCourses(parsedCourses)
   ↓
UI renders CourseAccordion + WeeklyGrid
```

### Schedule Assembly & Conflict Detection
```
User clicks section "BAS2-I 01" (Ma-Ju 09:45-11:15)
   ↓
detectConflict([3, 4], { start: 585, end: 675 })
   ↓
Check existing schedule items:
  - If any item shares a day [3, 4] AND times overlap → CONFLICT
  - Else → OK
   ↓
On conflict:
  Toast: "Conflicto con FILOSOFÍA (Lu-Vi 06:30-08:00)"
  Section NOT added
  ↓
On OK:
  ScheduleContext.addToSchedule(sectionItem)
  WeeklyGrid re-renders with new block
```

### PDF Export (MVP)
```
User clicks "Descargar PDF"
   ↓
PDFExporter.createPDF(schedule)
  - Render 7-day grid with UTEC brand colors
  - Add legend (course codes, rooms)
  - Add header: "Mi Horario" + date
  - Add footer
   ↓
jsPDF download: `mi-horario-2026-07-10.pdf`
```

---

## Approval Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | [Name] | — | — |
| Tech Lead | [Name] | — | — |
| Design Lead | [Name] | — | — |

---

**End of PRD**
