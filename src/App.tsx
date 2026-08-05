import { HashRouter, Routes, Route } from "react-router-dom";
import { BottomNav } from "./components/BottomNav";
import { SyncProvider } from "./lib/SyncContext";
import { HomePage } from "./pages/HomePage";
import { SubjectsPage } from "./pages/SubjectsPage";
import { SubjectDetailPage } from "./pages/SubjectDetailPage";
import { LessonDetailPage } from "./pages/LessonDetailPage";
import { HomeworkPage } from "./pages/HomeworkPage";
import { ExamsPage } from "./pages/ExamsPage";
import { MistakesPage } from "./pages/MistakesPage";
import { SearchPage } from "./pages/SearchPage";
import { SettingsPage } from "./pages/SettingsPage";

export default function App() {
  return (
    <SyncProvider>
      <HashRouter>
        <div className="min-h-screen pb-16">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/subjects" element={<SubjectsPage />} />
            <Route path="/subjects/:subjectId" element={<SubjectDetailPage />} />
            <Route
              path="/subjects/:subjectId/lessons/:lessonId"
              element={<LessonDetailPage />}
            />
            <Route path="/homework" element={<HomeworkPage />} />
            <Route path="/exams" element={<ExamsPage />} />
            <Route path="/mistakes" element={<MistakesPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
        <BottomNav />
      </HashRouter>
    </SyncProvider>
  );
}
