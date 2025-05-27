// src/pages/ManagePosts.js
import React, { useState } from 'react';
import '../styles/ManagePosts.css';
import { FaEdit, FaTrash } from 'react-icons/fa';
import sidebar from '../assets/BayadBoardLogo.png';
import PreviewPost from '../components/PreviewPost';
import EditPost from '../components/EditPost';
import { useNavigate } from 'react-router-dom';

const postsData = [
  {
    id: 1,
    icon: '📝',
    title: 'Post Number 1',
    category: 'Reminders/Notices',
    date: '10 / 15 / 2025',
    content: 'This is the content of Post Number 1.',
    photo: 'https://via.placeholder.com/400x200?text=Post+1+Photo',
  },
  {
    id: 2,
    icon: '📅',
    title: 'Post Number 2',
    category: 'Community Events',
    date: '10 / 18 / 2025',
    content: 'Details about community event for Post Number 2.',
    photo: 'https://via.placeholder.com/400x200?text=Post+2+Photo',
  },
  {
    id: 3,
    icon: '📢',
    title: 'Post Number 3',
    category: 'General Announcements',
    date: '10 / 19 / 2025',
    content: 'Announcement content of Post Number 3.',
    photo: 'https://via.placeholder.com/400x200?text=Post+3+Photo',
  },
];

export default function ManagePosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState(postsData);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postToEdit, setPostToEdit] = useState(null);

  const handleDeleteClick = (post) => {
    setPostToDelete(post);
    setShowDeletePopup(true);
  };

  const confirmDelete = () => {
    setPosts(posts.filter((p) => p.id !== postToDelete.id));
    setShowDeletePopup(false);
    setPostToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeletePopup(false);
    setPostToDelete(null);
  };

  const openPreview = (post) => {
    setSelectedPost(post);
  };

  const closePreview = () => {
    setSelectedPost(null);
  };

  const openEdit = (post) => {
    setPostToEdit(post);
  };

  const closeEdit = () => {
    setPostToEdit(null);
  };

  const saveEdit = (updatedPost) => {
    const updatedPosts = posts.map((post) =>
      post.id === updatedPost.id ? updatedPost : post
    );
    setPosts(updatedPosts);
    closeEdit();
  };

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
            <li className="active">Manage All Posts</li>
            <li onClick={() => navigate('/admin-view')}>View Bulletin</li>
          </ul>
        </nav>
        <a href="/" className="logout">Log Out</a>
      </aside>

      <main className="main-content">
        <div className="container">
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
              {posts.map((post) => (
                <tr key={post.id}>
                <td onClick={() => openPreview(post)} style={{ cursor: 'pointer' }}>
                {post.icon} {post.title}
              </td>
              <td>{post.category}</td>
              <td>{post.date}</td>
              <td>
                <button className="edit-btn" onClick={() => openEdit(post)}>
                 <FaEdit />
                </button>
                <button className="delete-btn" onClick={() => handleDeleteClick(post)}>
                <FaTrash />
                </button>
                </td>
                </tr>
          ))}
        </tbody>

          </table>
          {showDeletePopup && (
            <DeletePopup
              title={postToDelete?.title}
              onConfirm={confirmDelete}
              onCancel={cancelDelete}
            />
          )}

          {selectedPost && (
            <PreviewPost
              post={selectedPost} onClose={closePreview} onEdit={(post) => {
                setPostToEdit(post);
                setSelectedPost(null);
                }} onDelete={(post) => {
                  handleDeleteClick(post);
                  setSelectedPost(null); 
                }}/>
            )}


          {postToEdit && (
            <EditPost post={postToEdit} onClose={closeEdit} onSave={saveEdit} />
          )}
        </div>
      </main>
    </div>
  );
}

function DeletePopup({ title, onConfirm, onCancel }) {
  return (
    <div className="popup-overlay">
      <div className="popup">
        <h3>⚠️ Warning</h3>
        <p>You are about to delete <strong>{title}</strong>?</p>
        <div className="popup-buttons">
          <button onClick={onCancel} className="cancel">Cancel</button>
          <button onClick={onConfirm} className="confirm">Delete</button>
        </div>
      </div>
    </div>
  );
}