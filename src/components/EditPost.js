import React, { useState } from 'react';
import '../styles/EditPost.css';

export default function EditPost({ post, onClose, onSave }) {
  const [editedPost, setEditedPost] = useState({ ...post });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedPost({ ...editedPost, [name]: value });
  };

  const handleSave = () => {
    onSave(editedPost);
    onClose();
  };

  return (
    <div className="preview-overlay" onClick={onClose}>
      <div
        className="popup preview-popup"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
        <h2 className="preview-title">Edit Post</h2>

        <div className="preview-details">
          {/* Category Dropdown */}
          <div>
            <div className="label-text">Category</div>
            <div className="field-box">
              <select
                name="category"
                value={editedPost.category}
                onChange={handleChange}
                className="field-input"
              >
                <option value="">Select a category</option>
                <option value="Emergency Alerts 🚨">Emergency Alerts 🚨</option>
                <option value="Community Events 📅">Community Events 📅</option>
                <option value="General Announcements 📢">General Announcements 📢</option>
                <option value="Reminders or Notices 📝">Reminders or Notices 📝</option>
              </select>
            </div>
          </div>

          {/* Title Input */}
          <div>
            <div className="label-text">Title</div>
            <div className="field-box">
              <input
                type="text"
                name="title"
                value={editedPost.title}
                onChange={handleChange}
                className="field-input"
              />
            </div>
          </div>

          {/* Content Textarea */}
          <div>
            <div className="label-text">Content</div>
            <div className="field-box">
              <textarea
                name="content"
                value={editedPost.content}
                onChange={handleChange}
                className="field-input"
                rows="5"
              />
            </div>
          </div>
        </div>

        {/* Button container aligns button to lower right */}
        <div className="button-container">
          <button className="update-btn" onClick={handleSave}>
            UPDATE
          </button>
        </div>
      </div>
    </div>
  );
}
