import React from 'react';
import '../styles/ManagePost.css';
import { FaEdit, FaTrash } from 'react-icons/fa';

const posts = [
  {
    id: 1,
    icon: '📝',
    title: 'Post Number 1',
    category: 'Reminders/Notices',
    date: '10 / 15 / 2025',
  },
  {
    id: 2,
    icon: '📅',
    title: 'Post Number 2',
    category: 'Community Events',
    date: '10 / 18 / 2025',
  },
  {
    id: 3,
    icon: '📢',
    title: 'Post Number 3',
    category: 'General Announcements',
    date: '10 / 19 / 2025',
  },
  {
    id: 4,
    icon: '📢',
    title: 'Post Number 4',
    category: 'General Announcements',
    date: '10 / 21 / 2025',
  },
  {
    id: 5,
    icon: '📢',
    title: 'Post Number 5',
    category: 'General Announcements',
    date: '10 / 25 / 2025',
  },
  {
    id: 6,
    icon: '📅',
    title: 'Post Number 6',
    category: 'Community Events',
    date: '10 / 26 / 2025',
  },
];

export default function ManagePosts() {
  return (
    <div className="manage-container">
      <aside className="sidebar">
        <h2 className="logo">🕊️ BayanBoard</h2>
        <nav>
          <ul>
            <li>Dashboard</li>
            <li className="active">Manage All Post</li>
            <li>View Bulletin</li>
          </ul>
        </nav>
        <a href="/" className="logout">Log Out</a>
      </aside>

      <main className="main-content">
        <h1>MANAGE ALL POSTS</h1>

        <div className="controls">
          <input type="text" placeholder="Search Title" />
          <select>
            <option>Category</option>
          </select>
          <select>
            <option>Sort by Date</option>
          </select>
        </div>

        <table className="posts-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Date Posted</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post.id}>
                <td><span className="emoji">{post.icon}</span> <strong>{post.title}</strong></td>
                <td>{post.category}</td>
                <td>{post.date}</td>
                <td>
                  <button className="icon-btn"><FaEdit /></button>
                  <button className="icon-btn"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
