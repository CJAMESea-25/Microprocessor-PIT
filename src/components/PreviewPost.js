import { useEffect, useRef, useState } from 'react';
import '../styles/PreviewPost.css';

export default function PreviewPost({ post, onClose, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="preview-overlay" onClick={onClose}>
      <div
        className="preview-popup"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-btn" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="ellipsis-menu-wrapper" ref={menuRef}>
          <button
            className="ellipsis-btn"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Options"
          >
            ⋮
          </button>

          {menuOpen && (
            <div className="ellipsis-dropdown">
              <button
                className="ellipsis-option"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(post);
                }}
              >
                Edit
              </button>
              <button
                className="ellipsis-option delete"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(post);
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="preview-title">View Post Details</div>

        <div className="preview-details">
          <div>
            <div className="label-text">Category</div>
            <div className="detail-box">{post.category || 'N/A'}</div>
          </div>

          <div>
            <div className="label-text">Title</div>
            <div className="detail-box">{post.title || 'No Title'}</div>
          </div>

          <div>
            <div className="label-text">Content</div>
            <div className="detail-box">{post.content || 'No Content'}</div>
          </div>
        </div>

        {post.images && post.images.length > 0 && (
          <div className="preview-images">
            <div className="label-text">Images</div>
            <div className="image-container">
              {post.images.map((imageUrl, index) => (
                <img
                  key={index}
                  src={imageUrl}
                  alt={`${post.title} image ${index + 1}`}
                  className="preview-image"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}