import { PlusOutlined } from '@ant-design/icons';
import { Button, Form, Image, Input, Select, Space, Upload, message } from 'antd';
import { addDoc, collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import sidebar from '../assets/BayadBoardLogo.png';
import { db } from '../firebase';
import '../styles/Dashboard.css';

const { TextArea, Search } = Input;
const { Option } = Select;

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const SubmitButton = ({ form }) => {
  const [submittable, setSubmittable] = useState(false);
  const values = Form.useWatch([], form);

  useEffect(() => {
    form
      .validateFields({ validateOnly: true })
      .then(() => {
        console.log('Form validation passed, values:', values);
        setSubmittable(true);
      })
      .catch((errors) => {
        console.log('Form validation failed:', errors);
        setSubmittable(false);
      });
  }, [form, values]);

  return (
    <Button type="primary" htmlType="submit" disabled={!submittable}>
      ADD POST
    </Button>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [fileList, setFileList] = useState([]);
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [form] = Form.useForm();

  // Fetch categories from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const fetchedCategories = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      console.log('Fetched categories:', fetchedCategories);
      setCategories(fetchedCategories);
      if (!fetchedCategories.length) {
        message.warning('No categories found in Firestore. Using defaults.');
        setCategories([
          { id: 'cat1', name: 'Emergency Alerts' },
          { id: 'cat3', name: 'General Announcements' },
          { id: 'cat4', name: 'Community News' },
          { id: 'cat5', name: 'Reminders or Notices' },
        ]);
      }
    }, (error) => {
      console.error('Error fetching categories:', error.message, 'Code:', error.code);
      message.error('Failed to load categories. Using defaults.');
      setCategories([
          { id: 'cat1', name: 'Emergency Alerts' },
          { id: 'cat3', name: 'General Announcements' },
          { id: 'cat4', name: 'Community News' },
          { id: 'cat5', name: 'Reminders or Notices' },
      ]);
    });
    return () => unsubscribe();
  }, []);

  // Fetch posts from Firestore in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'posts'), (snapshot) => {
      const fetchedPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log('Fetched posts:', fetchedPosts);
      setPosts(fetchedPosts);
    }, (error) => {
      console.error('Error fetching posts:', error.message, 'Code:', error.code);
      message.error('Failed to load posts');
    });
    return () => unsubscribe();
  }, []);

  const handlePreview = async (file) => {
    try {
      if (!file.url && !file.preview) {
        file.preview = await getBase64(file.originFileObj);
      }
      setPreviewImage(file.url || file.preview);
      setPreviewOpen(true);
    } catch (error) {
      console.error('Error previewing image:', error);
      message.error('Failed to preview image');
    }
  };

  const handleChange = ({ fileList: newFileList }) => {
    console.log('Updated fileList:', newFileList);
    setFileList(newFileList);
  };

  const getIcon = (cat) => {
    if (!cat) return '📌';
    if (cat.includes('Emergency Alerts')) return '🚨';
    if (cat.includes('General Announcements')) return '📢';
    if (cat.includes('Community Events')) return '📅';
    if (cat.includes('Reminders or Notices')) return '📝';
    return '📌';
  };

  const handleAddPost = async (values) => {
    console.log('handleAddPost called with values:', values, 'fileList:', fileList);
    if (!values.category || !values.title || !values.description) {
      console.log('Validation failed: Missing fields');
      message.error('Please fill out all required fields');
      return;
    }

    try {
      // Convert all images to Base64 (if any)
      const imageUrls = fileList.length > 0 ? await Promise.all(fileList.map((file) => 
        getBase64(file.originFileObj))) : [];
      console.log('Images converted to Base64:', imageUrls);

      // Save post to Firestore with specified sequence
      const categoryName = categories.find((cat) => cat.id === values.category)?.name || '';
      const newPost = {
        category: categoryName,
        title: values.title,
        content: values.description,
        imageUrl: imageUrls,
        timestamp: new Date().toISOString(),
      };

      console.log('Saving post to Firestore:', newPost);
      const docRef = await addDoc(collection(db, 'posts'), newPost).catch((error) => {
        throw new Error(`Firestore write failed: ${error.message}`);
      });
      console.log('Post saved successfully with ID:', docRef.id);

      form.resetFields();
      setFileList([]);
      message.success('Post added successfully');
    } catch (error) {
      console.error('Error adding post:', error.message, 'Code:', error.code);
      message.error(`Failed to add post: ${error.message}`);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      message.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error.message, 'Code:', error.code);
      message.error('Failed to delete post');
    }
  };

  const filteredPosts = posts.filter((post) =>
    post?.title ? post.title.toLowerCase().includes(searchTerm.toLowerCase()) : false
  );

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  return (
    <div className="manage-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src={sidebar} alt="BayanBoard Logo" className="sidebar-logo" />
          <h2 className="logo-text">BayanBoard</h2>
        </div>
        <nav>
          <ul>
            <li className="active">Dashboard</li>
            <li onClick={() => navigate('/manage-posts')}>Manage All Posts</li>
            <li onClick={() => navigate('/admin-view')}>View Bulletin</li>
          </ul>
        </nav>
        <a href="/" className="logout">Log Out</a>
      </aside>

      <main className="main-content">
        <div className="container">
          <section className="form-section">
            <h2>DASHBOARD</h2>
            <h2>📝 Create New Post</h2>
            <p>Fill out the form below to publish a new bulletin post. All posts will be displayed
              on the public board after submission. Photo upload is optional.</p>

            <Form
              form={form}
              layout="vertical"
              autoComplete="off"
              onFinish={handleAddPost}
            >
              <Form.Item
                name="category"
                rules={[{ required: true, message: 'Category is required' }]}
              >
                <Select placeholder="Select a category" loading={!categories.length}>
                  {categories.map((category) => (
                    <Option key={category.id} value={category.id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="title"
                rules={[{ required: true, message: 'Title is required' }]}
              >
                <Input placeholder="Title" />
              </Form.Item>

              <Form.Item
                name="description"
                rules={[{ required: true, message: 'Description is required' }]}
              >
                <TextArea placeholder="Description..." autoSize={{ minRows: 3, maxRows: 6 }} />
              </Form.Item>

              <Form.Item>
                <Upload
                  listType="picture-circle"
                  fileList={fileList}
                  beforeUpload={() => false}
                  onPreview={handlePreview}
                  onChange={handleChange}
                >
                  {fileList.length >= 5 ? null : uploadButton}
                </Upload>
                {previewImage && (
                  <Image
                    wrapperStyle={{ display: 'none' }}
                    preview={{
                      visible: previewOpen,
                      onVisibleChange: (visible) => setPreviewOpen(visible),
                      afterOpenChange: (visible) => !visible && setPreviewImage(''),
                    }}
                    src={previewImage}
                  />
                )}
              </Form.Item>

              <Form.Item>
                <SubmitButton form={form} />
              </Form.Item>
            </Form>
          </section>
        </div>
      </main>

      <section className="post-section">
        <h2>All Posts</h2>
        <p>Click on a post title below to view or edit its full content.</p>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Search
            placeholder="Search title"
            allowClear
            enterButton="Search"
            size="middle"
            onSearch={(value) => setSearchTerm(value)}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Space>

        <ul className="post-list">
          {filteredPosts.map((post) => (
            <li key={post.id}>
              <strong>
                {post.icon || '📌'} {post.title} (
                {categories.find((cat) => cat.name === post.category)?.name || 'Unknown'})
              </strong>
              <p>{post.content.substring(0, 40)}...</p>
              <Button type="link" danger onClick={() => handleDeletePost(post.id)}>
                Delete
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}