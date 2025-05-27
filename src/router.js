import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import LogIn from './pages/LogIn';
import ManagePosts from './pages/ManagePosts';
import ViewBulletin from './pages/ViewBulletin';
import AdminViewBulletin from './pages/AdminViewBulletin'

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/view-bulletin" element={<ViewBulletin />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/manage-posts" element={<ManagePosts />} />
        <Route path="/admin-view" element={<AdminViewBulletin/>}/>
      </Routes>
    </Router>
  );
}

