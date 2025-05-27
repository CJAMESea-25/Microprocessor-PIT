import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import sidebarLogo from '../assets/BayadBoardLogo.png';
import '../styles/Sidebar.css';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src={sidebarLogo} alt="BayanBoard Logo" className="sidebar-logo" />
        <h2 className="logo-text">BayanBoard</h2>
      </div>
      <nav>
        <ul>
          <li className={isActive('/dashboard') ? 'active' : ''} onClick={() => navigate('/dashboard')}>
            Dashboard
          </li>
          <li className={isActive('/manage-post') ? 'active' : ''} onClick={() => navigate('/manage-post')}>
            Manage All Post
          </li>
          <li className={isActive('/view-bulletin') ? 'active' : ''} onClick={() => navigate('/view-bulletin')}>
            View Bulletin
          </li>
        </ul>
      </nav>
      <a href="/" className="logout">Log Out</a>
    </aside>
  );
}
