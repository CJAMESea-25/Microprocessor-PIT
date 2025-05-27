import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/BayadBoardLogo.png';
import '../styles/Sidebar.css';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Manage All Post', path: '/manage-posts' },
    { label: 'View Bulletin', path: '/view-bulletin' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="BayanBoard Logo" className="sidebar-logo" />
        <h2 className="logo-text">BayanBoard</h2>
      </div>
      <nav>
        <ul>
          {menuItems.map(item => (
            <li
              key={item.path}
              className={location.pathname === item.path ? 'active' : ''}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </nav>
      <a href="/" className="logout">Log Out</a>
    </aside>
  );
}
