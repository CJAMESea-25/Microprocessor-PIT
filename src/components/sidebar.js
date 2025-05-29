import React from 'react';
import { useNavigate } from 'react-router-dom';
import sidebar from '../assets/BayadBoardLogo.png';
import '../styles/Sidebar.css';

const Sidebar = ({ activePage }) => {
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/Dashboard' },
    { name: 'Manage All Posts', path: '/manage-posts' },
    { name: 'View Bulletin', path: '/admin-view' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src={sidebar} alt="BayanBoard Logo" className="sidebar-logo" />
        <h2 className="logo-text">BayanBoard</h2>
      </div>
      <nav>
        <ul>
          {navItems.map((item) => (
            <li
              key={item.name}
              className={activePage === item.name ? 'active' : ''}
              onClick={() => navigate(item.path)}
            >
              {item.name}
            </li>
          ))}
        </ul>
      </nav>
      <a href="/" className="logout">Log Out</a>
    </aside>
  );
};

export default Sidebar;