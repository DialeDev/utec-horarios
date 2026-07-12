import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import Landing from './components/Landing';
import SubjectManager from './components/Phase1/SubjectManager';
import ScheduleBuilder from './components/ScheduleBuilder';
import ToastProvider from './components/ToastProvider';
import { ScheduleProvider } from './context/ScheduleContext';

export default function App() {
  return (
    <ErrorBoundary>
      <ScheduleProvider>
        <ToastProvider />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Landing />} />
            <Route path="materias" element={<SubjectManager />} />
            <Route path="horario" element={<ScheduleBuilder />} />
          </Route>
        </Routes>
      </ScheduleProvider>
    </ErrorBoundary>
  );
}
