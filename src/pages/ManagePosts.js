import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../pages/firebase';
import '../styles/ManagePost.css';

export default function ManagePosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const querySnapshot = await getDocs(collection(db, 'posts'));
      const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(fetched.reverse());
    };
    fetchPosts();
  }, []);

  return (
      <main className="main-content">
        <div className="container">
          <h1>MANAGE ALL POSTS</h1>
          <table className="posts-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Date Posted</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id}>
                  <td><span className="emoji">{post.icon}</span> <strong>{post.title}</strong></td>
                  <td>{post.category}</td>
                  <td>{post.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
  );
}
