import { Link } from 'react-router-dom';
import logo from '../assets/BayadBoardLogo.png';
import '../styles/ViewBulletin.css';
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase'; 

const ViewBulletin = () => {
  const [allPosts, setAllPosts] = useState([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  const [generalAnnouncements, setGeneralAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);

  // Fetch posts from Firestore
  useEffect(() => {
    console.log("useEffect: Setting up Firestore listener for posts...");
    const postsCollectionRef = collection(db, 'posts');
    const q = query(postsCollectionRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      console.log("onSnapshot: Data received from Firestore!");
      console.log("Query Snapshot:", querySnapshot);

      const fetchedPosts = [];
      if (querySnapshot && querySnapshot.docs) {
        querySnapshot.docs.forEach((doc) => {
          console.log("  Document ID:", doc.id, "Data:", doc.data());
          fetchedPosts.push({ id: doc.id, ...doc.data() });
        });
      } else {
        console.log("Query Snapshot has no 'docs' property or is null/undefined.");
      }

      console.log("Fetched Posts Array (before filtering):", fetchedPosts);

      const alerts = fetchedPosts.filter(post => post.category === 'Emergency Alerts');
      const announcements = fetchedPosts.filter(post => post.category === 'General Announcements');

      console.log("Filtered Emergency Alerts:", alerts);
      console.log("Filtered General Announcements:", announcements);

      setAllPosts(fetchedPosts);
      setEmergencyAlerts(alerts);
      setGeneralAnnouncements(announcements);
      setLoading(false);
      console.log("State updated. Loading set to false.");
    }, (err) => {
      console.error("onSnapshot: Error fetching posts:", err);
      setError("Failed to load posts. Please check your internet connection or try again later.");
      setLoading(false);
    });

    return () => {
      console.log("useEffect cleanup: Unsubscribing from Firestore posts listener.");
      unsubscribe();
    };
  }, []);

  // Fetch images from Firestore
  useEffect(() => {
    console.log("useEffect: Setting up Firestore listener for imageUrls...");
    const imageUrlsCollectionRef = collection(db, 'imageUrls');
    const q = query(imageUrlsCollectionRef);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      console.log("onSnapshot: Image URLs received from Firestore!");
      const fetchedImageUrls = [];
      if (querySnapshot && querySnapshot.docs) {
        querySnapshot.docs.forEach((doc) => {
          console.log("  Image Document ID:", doc.id, "Data:", doc.data());
          fetchedImageUrls.push({ id: doc.id, ...doc.data() });
        });
      } else {
        console.log("Query Snapshot for imageUrls has no 'docs' or is null/undefined.");
      }
      console.log("Fetched Image URLs:", fetchedImageUrls);
      setImageUrls(fetchedImageUrls);
    }, (err) => {
      console.error("onSnapshot: Error fetching imageUrls:", err);
      setError("Failed to load images. Please check your internet connection or try again later.");
    });

    return () => {
      console.log("useEffect cleanup: Unsubscribing from Firestore imageUrls listener.");
      unsubscribe();
    };
  }, []);

  const renderPostContent = (post) => {
    return (
      <>
        <h4>{post.title || 'No Title'}</h4>
        <p className="posted-date">
          Posted on {post.timestamp ? new Date(post.timestamp).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }) : 'N/A'}
        </p>
        <p className="post-main-content">
          {post.content || post.description || 'No content provided.'}
        </p>
        {post.imageUrl && <img src={post.imageUrl} alt={post.title || "Post image"} className="post-image" />}
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
      {/* Fixed Header and Title */}
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
        {/* Image Gallery */}
        <section className="image-gallery-section">
          <h3>Image Gallery 🖼️</h3>
          <div className="image-grid">
            {imageUrls.length === 0 ? (
              <p className="no-posts-message">No images available.</p>
            ) : (
              imageUrls.map((image) => (
                <div key={image.id} className="image-box">
                  <img src={image.url} alt="Gallery image" className="gallery-image" />
                </div>
              ))
            )}
          </div>
        </section>

        {/* Emergency Alerts */}
        <section className="alerts-section">
          <h3>Emergency Alerts 📛</h3>
          <div className="emergency-grid">
            {emergencyAlerts.length === 0 ? (
              <p className="no-posts-message">No emergency alerts currently.</p>
            ) : (
              emergencyAlerts.map((alert) => (
                <div key={alert.id} className="alert-box">
                  {renderPostContent(alert)}
                </div>
              ))
            )}
          </div>
        </section>

        {/* General Announcements */}
        <section className="announcements-section">
          <h3>General Announcements 📢</h3>
          <div className="announcement-grid">
            {generalAnnouncements.length === 0 ? (
              <p className="no-posts-message">No general announcements currently.</p>
            ) : (
              generalAnnouncements.map((announcement) => (
                <div key={announcement.id} className="announcement-card">
                  {renderPostContent(announcement)}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ViewBulletin;