import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './components/Landing';
import SubjectManager from './components/Phase1/SubjectManager';
import ClassSelector from './components/Phase2/ClassSelector';
import WeeklyView from './components/Phase2/WeeklyView';
import ToastProvider from './components/ToastProvider';
import { ScheduleProvider } from './context/ScheduleContext';

// Wrapper para la vista de construcción (Layout de 2 columnas)
function BuilderLayout() {
  return (
    <div className="flex h-[calc(100vh-100px)] gap-4">
      <ClassSelector />
      <div className="flex-1">
        <WeeklyView />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ScheduleProvider>
      <ToastProvider />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="subjects" element={<SubjectManager />} />
          <Route path="builder" element={<BuilderLayout />} />
        </Route>
      </Routes>
    </ScheduleProvider>
  );
}