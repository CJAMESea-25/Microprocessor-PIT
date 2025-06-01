import { Link } from 'react-router-dom';
import logo from '../assets/BayadBoardLogo.png';
import '../styles/ViewBulletin.css';
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const ViewBulletin = () => {
  const [posts, setPosts] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories
  useEffect(() => {
    console.log("useEffect: Setting up Firestore listener for categories...");
    const unsubscribe = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const fetchedCategories = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      console.log('Fetched categories:', fetchedCategories);
      setCategories(fetchedCategories);
      if (!fetchedCategories.length) {
        console.log('No categories found in Firestore. Using defaults.');
        setCategories([
          { id: 'cat1', name: 'Emergency Alerts' },
          { id: 'cat2', name: 'General Announcements' },
          { id: 'cat3', name: 'Community News' },
          { id: 'cat4', name: 'Reminders or Notices' },
        ]);
      }
    }, (error) => {
      console.error('Error fetching categories:', error.message, 'Code:', error.code);
      setError('Failed to load categories: ' + error.message);
      setCategories([
        { id: 'cat1', name: 'Emergency Alerts' },
        { id: 'cat2', name: 'General Announcements' },
        { id: 'cat3', name: 'Community News' },
        { id: 'cat4', name: 'Reminders or Notices' },
      ]);
    });

    return () => {
      console.log("useEffect cleanup: Unsubscribing from Firestore categories listener.");
      unsubscribe();
    };
  }, []);

  // Fetch posts
  useEffect(() => {
    console.log("useEffect: Setting up Firestore listener for posts...");
    const postsCollectionRef = collection(db, 'posts');
    const postsQuery = query(postsCollectionRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(postsCollectionRef, (snapshot) => {
      const fetchedPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log('Fetched posts:', fetchedPosts);
      setPosts(fetchedPosts);
      setLoading(false); 
    }, (error) => {
      console.error('Error fetching posts:', error.message, 'Code:', error.code);
      setError('Failed to load posts: ' + error.message);
      setLoading(false);
    });

    return () => {
      console.log("useEffect cleanup: Unsubscribing from Firestore posts listener.");
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    console.log("useEffect: Setting up Firestore listener for imageUrls...");
    const imageUrlsCollectionRef = collection(db, 'imageUrls');
    const imagesQuery = query(imageUrlsCollectionRef);

    const unsubscribe = onSnapshot(imageUrlsCollectionRef, (snapshot) => {
      const fetchedImageUrls = snapshot.docs.map((doc) => ({
        id: doc.id,
        postId: doc.data().postId,
        url: Array.isArray(doc.data().url) ? doc.data().url : [doc.data().url].filter(Boolean),
      }));
      console.log('Fetched imageUrls:', fetchedImageUrls);
      setImageUrls(fetchedImageUrls);
    }, (error) => {
      console.error('Error fetching imageUrls:', error.message, 'Code:', error.code);
      setError('Failed to load images: ' + error.message);
    });

    return () => {
      console.log("useEffect cleanup: Unsubscribing from Firestore imageUrls listener.");
      unsubscribe();
    };
  }, []);

  const postsWithImages = posts.map((post) => ({
    ...post,
    images: imageUrls
      .filter((image) => image.postId === post.id)
      .flatMap((image) => image.url), 
  }));

  const getIcon = (cat) => {
    if (!cat) return '📌';
    if (cat.includes('Emergency Alerts')) return '🚨';
    if (cat.includes('General Announcements')) return '📢';
    if (cat.includes('Community News')) return '📰';
    if (cat.includes('Reminders or Notices')) return '📝';
    return '📌';
  };

  const renderPostContent = (post) => {
    return (
      <>
        <h4>
          {getIcon(post.category)} {post.title || 'No Title'}
        </h4>
        <p className="posted-date">Posted on {post.timestamp ? (
      <>
      {new Date(post.timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}
      <br />
      at {new Date(post.timestamp).toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })}
      </>
       ) : 'N/A'} </p>
        <p className="post-main-content">
          {post.content || post.description || 'No content provided.'}
        </p>
        {post.images && post.images.length > 0 && (
          <div className="post-images">
            {post.images.map((imageUrl, index) => (
              <img
                key={index}
                src={imageUrl}
                alt={`Post image ${index + 1}`}
                className="post-image"
                onError={(e) => console.error(`Failed to load image: ${imageUrl}`, e)}
              />
            ))}
          </div>
        )}
        {post.author && <small className="post-author">By: {post.author}</small>}
      </>
    );
  };

  if (loading) {
    return (
      <div className="board-container">
        <header className="fixed-header">
          <div className="logo-section">
            <div className="logo">
              <img src={logo} alt="BayanBoard Logo" />
              <h1>BayanBoard</h1>
            </div>
          </div>
          <div className="title-bar">
            <Link to="/" className="back-button">← BACK</Link>
            <h2 className="main-title">
              <span className="title-line1">COMMUNITY DIGITAL</span><br />
              <span className="title-line2">BULLETIN BOARD</span>
            </h2>
          </div>
        </header>
        <div className="content-container">
          <p className="loading-message">Loading bulletin board...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="board-container">
        <header className="fixed-header">
          <div className="logo-section">
            <div className="logo">
              <img src={logo} alt="BayanBoard Logo" />
              <h1>BayanBoard</h1>
            </div>
          </div>
          <div className="title-bar">
            <Link to="/" className="back-button">← BACK</Link>
            <h2 className="main-title">
              <span className="title-line1">COMMUNITY DIGITAL</span><br />
              <span className="title-line2">BULLETIN BOARD</span>
            </h2>
          </div>
        </header>
        <div className="content-container">
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="board-container">

      <header className="fixed-header">
        <div className="logo-section">
          <div className="logo">
            <img src={logo} alt="BayanBoard Logo" />
            <h1>BayanBoard</h1>
          </div>
        </div>
        <div className="title-bar">
          <Link to="/" className="back-button">← BACK</Link>
          <h2 className="main-title">
            <span className="title-line1">COMMUNITY DIGITAL</span><br />
            <span className="title-line2">BULLETIN BOARD</span>
          </h2>
        </div>
      </header>
      <div className="content-container">
        {categories.map((category) => {
          const categoryPosts = postsWithImages.filter((post) => post.category === category.name);
          if (categoryPosts.length === 0) return null;

          return (
            <section key={category.id} className="category-section">
              <h3>
                {getIcon(category.name)} {category.name}
              </h3>
              <div className={`category-grid category-${category.id}`}>
                {categoryPosts.length === 0 ? (
                  <p className="no-posts-message">No posts in this category currently.</p>
                ) : (
                  categoryPosts.map((post) => (
                    <div key={post.id} className="post-box">
                      {renderPostContent(post)}
                    </div>
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default ViewBulletin;