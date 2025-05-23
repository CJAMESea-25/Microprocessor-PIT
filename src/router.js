// src/router.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LogIn from './pages/LogIn';
import ManagePosts from './pages/ManagePosts';

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/manage-post" element={<ManagePosts />} />
      </Routes>
    </Router>
  );
}
