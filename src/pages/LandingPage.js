import React from 'react';
import '../styles/LandingPage.css';
import logo from '../assets/BayadBoardLogo.png';
import title from '../assets/title.png';
import illustration from '../assets/LandingPage.png';

const LandingPage = () => {
  return (
    <div>
      <header>
        <div className="logo">
          <img src={logo} alt="BayanBoard Logo" />
          <span>BayanBoard</span>
        </div>
      </header>

      <main className="landing">
        <section className="text-content">
          <img src={title} alt="title" />
          <p>
            Stay informed with real-time updates from your local barangay, school, subdivision, or office.
            This centralized digital bulletin board ensures you never miss important announcements, emergency
            alerts, or community news. All posts are managed and verified by authorized administrators to
            guarantee accurate and timely information for everyone.
          </p>
          <div className="buttons">
            <a href="#" className="btn dark">VIEW BULLETIN</a>
            <a href="/login" className="btn blue">ADMIN LOGIN</a>
          </div>
        </section>

        <section className="illustration">
          <img src={illustration} alt="Digital Bulletin Illustration" />
          <a href="https://storyset.com/app">App illustrations by Storyset</a>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
