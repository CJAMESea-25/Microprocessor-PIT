import { PlusOutlined } from '@ant-design/icons';
import { Button, Form, Image, Input, Select, Space, Upload, message } from 'antd';
import { addDoc, collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import '../styles/Dashboard.css';
import Sidebar from '../components/sidebar';

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
  const [imageUrls, setImageUrls] = useState([]);
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

  // Fetch image URLs from Firestore in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'imageUrls'), (snapshot) => {
      const fetchedImageUrls = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log('Fetched imageUrls:', fetchedImageUrls);
      setImageUrls(fetchedImageUrls);
    }, (error) => {
      console.error('Error fetching imageUrls:', error.message, 'Code:', error.code);
      message.error('Failed to load imageUrls');
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
      // Save post to Firestore first
      const categoryName = categories.find((cat) => cat.id === values.category)?.name || '';
      const newPost = {
        category: categoryName,
        title: values.title,
        content: values.description,
        timestamp: new Date().toISOString(),
      };

      console.log('Saving post to Firestore:', newPost);
      const postRef = await addDoc(collection(db, 'posts'), newPost).catch((error) => {
        throw new Error(`Firestore write failed: ${error.message}`);
      });
      console.log('Post saved successfully with ID:', postRef.id);

      // Convert all images to Base64 and save to 'imageUrls' collection
      if (fileList.length > 0) {
        const imageUrlPromises = fileList.map(async (file) => {
          const base64Image = await getBase64(file.originFileObj);
          const imageUrlDoc = {
            postId: postRef.id,
            imageUrl: base64Image,
            timestamp: new Date().toISOString(),
          };
          return addDoc(collection(db, 'imageUrls'), imageUrlDoc);
        });

        await Promise.all(imageUrlPromises);
        console.log('Image URLs saved successfully for post ID:', postRef.id);
      }

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
      // Delete the post
      await deleteDoc(doc(db, 'posts', postId));

      // Delete associated image URLs
      const imageUrlsToDelete = imageUrls.filter((imageUrl) => imageUrl.postId === postId);
      const deleteImageUrlPromises = imageUrlsToDelete.map((imageUrl) =>
        deleteDoc(doc(db, 'imageUrls', imageUrl.id))
      );
      await Promise.all(deleteImageUrlPromises);

      message.success('Post and associated image URLs deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error.message, 'Code:', error.code);
      message.error('Failed to delete post');
    }
  };

  const filteredPosts = posts
    .filter((post) =>
      post?.title ? post.title.toLowerCase().includes(searchTerm.toLowerCase()) : false
    )
    .map((post) => ({
      ...post,
      images: imageUrls.filter((imageUrl) => imageUrl.postId === post.id).map((img) => img.imageUrl),
    }));

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  return (
    <div className="manage-container">
      <Sidebar activePage="Dashboard" />
      <main className="main-content">
        <div className="container">
          <h1>DASHBOARD</h1>
          <div className="post">
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
          </div>
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
                {getIcon(post.category)} {post.title} (
                {categories.find((cat) => cat.name === post.category)?.name || 'Unknown'})
              </strong>
              <p>{post.content.substring(0, 40)}...</p>
              {post.images && post.images.length > 0 && (
                <div>
                  {post.images.map((imageUrl, index) => (
                    <img
                      key={index}
                      src={imageUrl}
                      alt="Post image"
                      style={{ width: '50px', height: '50px', marginRight: '5px' }}
                    />
                  ))}
                </div>
              )}
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