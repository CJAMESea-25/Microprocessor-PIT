import React from 'react';
import sidebar from '../assets/BayadBoardLogo.png';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminViewBulletin.css';

const AdminViewBulletin = () => {
  const navigate = useNavigate();

  const dummyPosts = [
    {
      id: 1,
      title: 'Community Clean-up Drive',
      content: 'Join us this Saturday for a barangay clean-up drive!',
      date: 'May 25, 2025',
    },
    {
      id: 2,
      title: 'Water Interruption Advisory',
      content: 'There will be a scheduled water interruption from 8AM-5PM.',
      date: 'May 26, 2025',
    },
    {
      id: 3,
      title: 'Water Interruption Advisory',
      content: 'There will be a scheduled water interruption from 8AM-5PM.',
      date: 'May 26, 2025',
    },
    {
      id: 4,
      title: 'Water Interruption Advisory',
      content: 'There will be a scheduled water interruption from 8AM-5PM.',
      date: 'May 26, 2025',
    },
  ];

  return (
    <div className="manage-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src={sidebar} alt="BayanBoard Logo" className="sidebar-logo" />
          <h2 className="logo-text">BayanBoard</h2>
        </div>
        <nav>
          <ul>
            <li onClick={() => navigate('/Dashboard')}>Dashboard</li>
            <li onClick={() => navigate('/manage-posts')}>Manage All Posts</li>
            <li className="active">View Bulletin</li>
          </ul>
        </nav>
        <a href="/" className="logout">Log Out</a>
      </aside>

      <main className="view-main-content">
        <div className="view-bulletin">
          <h1>VIEW BULLETIN BOARD</h1>
            {dummyPosts.map(post => (
              <div key={post.id} className="bulletin-posts">
                        <h3>{post.title}</h3>
                <p>{post.content}</p>
                <span className="post-date">{post.date}</span>
              </div>
            ))}
          </div>
      </main>
    </div>
  );
};

export default AdminViewBulletin;
