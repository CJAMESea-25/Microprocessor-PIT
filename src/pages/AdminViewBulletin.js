import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminViewBulletin.css';
import Sidebar from '../components/sidebar';

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
      <Sidebar activePage="View Bulletin" />
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