import { HashRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import WorkoutEditPage from './pages/WorkoutEditPage'
import TimerPage from './pages/TimerPage'
import SettingsPage from './pages/SettingsPage'

export default function Router() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/workout/new" element={<WorkoutEditPage />} />
        <Route path="/workout/:id/edit" element={<WorkoutEditPage />} />
        <Route path="/workout/:id/timer" element={<TimerPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </HashRouter>
  )
}
