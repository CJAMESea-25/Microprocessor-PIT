import { collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import EditPost from '../components/EditPost';
import PreviewPost from '../components/PreviewPost';
import { db } from '../firebase';
import '../styles/ManagePosts.css';
import Sidebar from '../components/sidebar';

const getIcon = (cat) => {
  if (!cat) return '📌';
  if (cat.includes('Emergency')) return '🚨';
  if (cat.includes('School Events') || cat.includes('Community Events')) return '📅';
  if (cat.includes('Announcements')) return '📢';
  if (cat.includes('Lost and Found')) return '📝';
  if (cat.includes('Community News')) return '📰';
  return '📌';
};

export default function ManagePosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postToEdit, setPostToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const unsubscribePosts = onSnapshot(collection(db, 'posts'), (snapshot) => {
      const fetchedPosts = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          icon: getIcon(data.category),
          title: data.title,
          category: data.category,
          type: data.type,
          date: new Date(data.timestamp).toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
          }).replace(/(\d+)\/(\d+)\/(\d+)/, '$1 / $2 / $3'),
          content: data.content,
        };
      });
      console.log('Fetched posts from Firestore:', fetchedPosts);

      const uniqueCategories = ['All', ...new Set(fetchedPosts.map(post => post.category))].filter(Boolean);
      setCategories(uniqueCategories);

      setPosts(fetchedPosts.map(post => ({
        ...post,
        images: imageUrls.filter(img => img.postId === post.id).map(img => img.url),
      })));
    }, (error) => {
      console.error('Error fetching posts:', error.message, 'Code:', error.code);
      message.error('Failed to load posts');
    });

    const unsubscribeImages = onSnapshot(collection(db, 'imageUrls'), (snapshot) => {
      const fetchedImageUrls = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log('Fetched imageUrls:', fetchedImageUrls);
      setImageUrls(fetchedImageUrls);

      setPosts(prevPosts => prevPosts.map(post => ({
        ...post,
        images: fetchedImageUrls.filter(img => img.postId === post.id).map(img => img.url),
      })));
    }, (error) => {
      console.error('Error fetching imageUrls:', error.message, 'Code:', error.code);
      message.error('Failed to load images');
    });

    return () => {
      unsubscribePosts();
      unsubscribeImages();
    };
  }, [imageUrls]);

  const handleDeleteClick = (post) => {
    setPostToDelete(post);
    setShowDeletePopup(true);
  };

  const confirmDelete = async () => {
    if (postToDelete) {
      try {
        await deleteDoc(doc(db, 'posts', postToDelete.id));
        const imagesToDelete = imageUrls.filter(img => img.postId === postToDelete.id);
        const deleteImagePromises = imagesToDelete.map(img => deleteDoc(doc(db, 'imageUrls', img.id)));
        await Promise.all(deleteImagePromises);

        setPosts(posts.filter((p) => p.id !== postToDelete.id));
        setImageUrls(imageUrls.filter(img => img.postId !== postToDelete.id));
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
      post.id === updatedPost.id
        ? {
            ...updatedPost,
            icon: getIcon(updatedPost.category),
            date: new Date(updatedPost.timestamp).toLocaleDateString('en-US', {
              month: '2-digit',
              day: '2-digit',
              year: 'numeric',
            }).replace(/(\d+)\/(\d+)\/(\d+)/, '$1 / $2 / $3'),
            images: updatedPost.images || [],
          }
        : post
    );
    setPosts(updatedPosts);
    closeEdit();
  };

  const filteredPosts = posts
    .filter((post) => {
      const matchesSearch = searchTerm === '' || post.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      const isNotEmergency = post?.type !== 'emergency';
      return matchesSearch && matchesCategory && isNotEmergency;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date.split(' / ').reverse().join('-'));
      const dateB = new Date(b.date.split(' / ').reverse().join('-'));
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const handleRowClick = (post) => {
    openPreview(post);
  };

  const handleKeyDown = (e, post) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openPreview(post);
    }
  };

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
                <tr
                  key={post.id}
                  onClick={() => handleRowClick(post)}
                  onKeyDown={(e) => handleKeyDown(e, post)}
                  role="button"
                  tabIndex={0}
                  className="clickable-row"
                >
                  <td>
                    {post.icon} {post.title}
                  </td>
                  <td>{post.category}</td>
                  <td>{post.date}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button
                      className="edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(post);
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(post);
                      }}
                    >
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