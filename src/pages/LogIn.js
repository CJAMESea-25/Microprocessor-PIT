// src/pages/LogIn.js
import React from 'react';
import '../styles/LogIn.css';
import logo from '../assets/BayadBoardLogo.png';
import adminIllustration from '../assets/AdminLogIn.png';
import { Link } from 'react-router-dom';

const LogIn = () => {
  return (
    <div>
      <header>
        <div className="logo">
          <img src={logo} alt="BayanBoard Logo" />
          <span>BayanBoard</span>
        </div>
      </header>

      <main className="login-page">
        <section className="login-form">
          <h1>ADMIN LOGIN</h1>
          <p>
            For security and accuracy, only authorized administrators are allowed to post on the
            Community Digital Bulletin Board. Please log in to manage and publish official announcements.
          </p>

          <form>
            <input type="text" placeholder="Username" required />
            <input type="password" placeholder="Password" required />
            <div className="buttons">
              <Link to="/" className="btn dark">GO BACK</Link>
              {/* Temporarily go to landing page until dashboard exists */}
              <Link to="/" className="btn blue">LOG IN</Link>
            </div>
          </form>
        </section>

        <section className="admin-illustration">
          <img src={adminIllustration} alt="Admin Login Illustration" />
          <a href="https://storyset.com/online" target="_blank" rel="noopener noreferrer">
            Online Illustrations by Storyset
          </a>
        </section>
      </main>
    </div>
  );
};

export default LogIn;
