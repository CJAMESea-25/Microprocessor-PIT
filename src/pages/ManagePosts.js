import { collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import EditPost from '../components/EditPost';
import PreviewPost from '../components/PreviewPost';
import { db } from '../firebase'; 
import '../styles/ManagePosts.css';
import Sidebar from '../components/sidebar';

const getIcon = (cat) => {
  if (!cat) return '📌';
  if (cat.includes('Emergency')) return '🚨';
  if (cat.includes('School Events')) return '📅';
  if (cat.includes('Announcements')) return '📢';
  if (cat.includes('Lost and Found')) return '📝';
  if (cat.includes('Community News')) return '📰';
  return '📌';
};

export default function ManagePosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postToEdit, setPostToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All'); // Default to 'All' to show all posts
  const [categories, setCategories] = useState(['All']); // Start with 'All'
  const [sortOrder, setSortOrder] = useState('desc'); // Default to descending (newest first)

  // Fetch posts and categories from Firestore in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'posts'), (snapshot) => {
      const fetchedPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        icon: getIcon(doc.data().category),
        title: doc.data().title,
        category: doc.data().category,
        date: new Date(doc.data().timestamp).toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
        }).replace(/(\d+)\/(\d+)\/(\d+)/, '$1 / $2 / $3'),
        content: doc.data().content,
        photo: doc.data().imageUrl && doc.data().imageUrl.length > 0 ? doc.data().imageUrl[0] : null,
      }));
      console.log('Fetched posts from Firestore:', fetchedPosts);

      // Extract unique categories and include 'All'
      const uniqueCategories = ['All', ...new Set(fetchedPosts.map(post => post.category))].filter(Boolean);
      setCategories(uniqueCategories);

      setPosts(fetchedPosts);
    }, (error) => {
      console.error('Error fetching posts:', error.message, 'Code:', error.code);
      message.error('Failed to load posts');
    });
    return () => unsubscribe();
  }, []);

  const handleDeleteClick = (post) => {
    setPostToDelete(post);
    setShowDeletePopup(true);
  };

  const confirmDelete = async () => {
    if (postToDelete) {
      try {
        await deleteDoc(doc(db, 'posts', postToDelete.id));
        setPosts(posts.filter((p) => p.id !== postToDelete.id));
        setShowDeletePopup(false);
        setPostToDelete(null);
        message.success('Post deleted successfully');
      } catch (error) {
        console.error('Error deleting post:', error.message, 'Code:', error.code);
        message.error('Failed to delete post');
      }
    }
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

  // Filter and sort posts based on search term, selected category, and sort order
  const filteredPosts = posts
    .filter((post) => {
      const matchesSearch = searchTerm === '' || post.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date.split(' / ').reverse().join('-'));
      const dateB = new Date(b.date.split(' / ').reverse().join('-'));
      // Sort by date based on sortOrder
      const dateComparison = sortOrder === 'desc' ? dateB - dateA : dateA - dateB;

      // If a category is selected (not 'All'), prioritize category sorting first
      if (selectedCategory !== 'All' && a.category === selectedCategory && b.category === selectedCategory) {
        return dateComparison;
      }

      // If no category is selected or posts are from different categories, sort by date
      return dateComparison;
    });

  return (
    <div className="manage-container">
      <Sidebar activePage="Manage All Posts" />
      <main className="main-content">
        <div className="container">
          <h1>MANAGE ALL POSTS</h1>

          <div className="controls">
            <input
              type="text"
              placeholder="Search Title"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div>
              <label>Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Sort by Date:</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
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
              {filteredPosts.map((post) => (
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
              post={selectedPost}
              onClose={closePreview}
              onEdit={(post) => {
                setPostToEdit(post);
                setSelectedPost(null);
              }}
              onDelete={(post) => {
                handleDeleteClick(post);
                setSelectedPost(null);
              }}
            />
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