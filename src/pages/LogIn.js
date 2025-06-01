import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminIllustration from '../assets/AdminLogIn.png';
import logo from '../assets/BayadBoardLogo.png';
import { auth } from '../firebase'; 
import '../styles/LogIn.css';

const LogIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/Dashboard');
    } catch (err) {
      setError('Invalid email or password.');
    }
  };

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

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && (<div className="error"><span className="error-icon"></span>{error}</div>)}

            <div className="login-buttons">
              <button type="button" className="btn dark" onClick={() => navigate('/')}>
                GO BACK
              </button>
              <button type="submit" className="btn blue">
                LOG IN
              </button>
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
