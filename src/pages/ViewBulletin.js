import React from 'react';
import '../styles/ViewBulletin.css';
import logo from '../assets/BayadBoardLogo.png';
import { Link } from 'react-router-dom';


const ViewBulletin = () => {
  return (
    <div className="board-container">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <img src={logo} alt="BayanBoard Logo" />
          <h1>BayanBoard</h1>
        </div>
         <Link to="/landing-page" className="back-button">← BACK</Link>
      </header>

      {/* Title */}
      <h2 className="main-title">COMMUNITY DIGITAL<br />BULLETIN BOARD</h2>

      {/* Emergency Alerts */}
      <section className="alerts-section">
        <h3 className="section-title">Emergency Alerts 📛</h3>
        <div className="alert-box">
          <h4>Flood Warning in Barangay Zone 2</h4>
          <p className="posted-date">Posted on May 5, 2025</p>
          <p>
            Due to continuous heavy rainfall, a flood alert has been issued for Barangay Zone 2.
            Residents in low-lying areas are advised to evacuate immediately and move to higher ground.
            Stay tuned to official channels for further updates.
          </p>
        </div>
      </section>

      {/* General Announcements */}
      <section className="announcements-section">
        <h3 className="section-title">General Announcements 📢</h3>
        <div className="announcement-grid">
          <div className="announcement-card">
            <h4>Barangay Hall Closed on Monday for Maintenance</h4>
          </div>
          <div className="announcement-card">
            <h4>Free Medical Check-Up This Friday</h4>
            <p className="posted-date">Posted on May 5, 2025</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ViewBulletin;
