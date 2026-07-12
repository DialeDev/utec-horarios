import CourseAccordion from './CourseAccordion';
import WeeklyGrid from './WeeklyGrid';
import PDFExporter from './PDFExporter';

export default function ScheduleBuilder() {
  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-4">
      <CourseAccordion />
      <div className="flex-1 flex flex-col gap-4 min-h-0">
        <WeeklyGrid />
        <div className="flex justify-end">
          <PDFExporter />
        </div>
      </div>
    </div>
  );
}
