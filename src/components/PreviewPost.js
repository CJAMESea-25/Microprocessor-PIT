import { useEffect, useRef, useState } from 'react';
import '../styles/PreviewPost.css';

export default function PreviewPost({ post, onClose, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  // Close dropdown if clicked outside
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
          &times;
        </button>

        <div className="ellipsis-menu-wrapper" ref={menuRef}>
          <button
            className="ellipsis-btn"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Options"
          >
            &#x22EE; {/* vertical ellipsis */}
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
            <div className="detail-box">{post.category}</div>
          </div>

          <div>
            <div className="label-text">Title</div>
            <div className="detail-box">{post.title}</div>
          </div>

          <div>
            <div className="label-text">Content</div>
            <div className="detail-box">{post.content}</div>
          </div>
        </div>

        {post.photo && (
          <div className="preview-image">
            <img src={post.photo} alt={post.title} />
          </div>
        )}
      </div>
    </div>
  );
}
