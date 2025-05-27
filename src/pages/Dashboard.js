import { PlusOutlined } from '@ant-design/icons';
import { Button, Form, Image, Input, Select, Space, Upload } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import sidebar from '../assets/BayadBoardLogo.png';
import '../styles/Dashboard.css';


const { TextArea, Search } = Input;
const { Option } = Select;

const getBase64 = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

const SubmitButton = ({ form, children }) => {
  const [submittable, setSubmittable] = useState(false);
  const values = Form.useWatch([], form);

  useState(() => {
    form
      .validateFields({ validateOnly: true })
      .then(() => setSubmittable(true))
      .catch(() => setSubmittable(false));
  }, [form, values]);

  return (
    <Button type="primary" htmlType="submit" disabled={!submittable}>
      {children}
    </Button>
  );
};


export default function Dashboard() {
  const navigate = useNavigate();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [fileList, setFileList] = useState([]);
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [form] = Form.useForm();

  const handlePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);

  const categoryOptions = [
    'Emergency Alerts 🚨',
    'Community Events 📅',
    'General Announcements 📢',
    'Reminders or Notices📝',
  ];

  const getIcon = (cat) => {
    if (cat.includes('Community Events')) return '📅';
    if (cat.includes('General Announcements')) return '📢';
    if (cat.includes('Reminders')) return '📝';
    if (cat.includes('Disaster') || cat.includes('Emergency')) return '🚨';
    if (cat.includes('Weather')) return '🌧️';
    return '📌';
  };

  const handleAddPost = values => {
    if (!values.category || !values.title || !values.description || fileList.length === 0) return;

    const newPost = {
      id: Date.now(),
      icon: getIcon(values.category),
      title: values.title,
      category: values.category,
      content: values.description,
    };

    setPosts([newPost, ...posts]);
    form.resetFields();
    setFileList([]);
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
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
            <li onClick={() => navigate('/manage-posts')}>Manage All Post</li>
            <li onClick={() => navigate('/view-bulletin')}>View Bulletin</li>
          </ul>
        </nav>
        <a href="/" className="logout">Log Out</a>
      </aside>

      <main className="main-content">
        <div className="container">
          {/* Left Section */}
          <section className="form-section">
            <h2>DASHBOARD</h2>
            <h2>📝 Create New Post</h2>
            <p>Fill out the form below to publish a new bulletin post. All posts will be displayed on the public board after submission.</p>

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
                <Select placeholder="Select a category">
                  {categoryOptions.map(option => (
                    <Option key={option} value={option}>{option}</Option>
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

              <Form.Item rules={[{
                validator: () =>
                  fileList.length > 0
                    ? Promise.resolve()
                    : Promise.reject(new Error('At least one image is required'))
              }]}>
                <Upload
                  listType="picture-circle"
                  fileList={fileList}
                  beforeUpload={() => false} // prevents automatic upload
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
                      onVisibleChange: visible => setPreviewOpen(visible),
                      afterOpenChange: visible => !visible && setPreviewImage(''),
                    }}
                    src={previewImage}
                  />
                )}
              </Form.Item>

              <Form.Item>
                <SubmitButton form={form}>ADD POST</SubmitButton>
              </Form.Item>
            </Form>
          </section>
        </div>
      </main>

          {/* Right Section */}
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
                onChange={e => setSearchTerm(e.target.value)}
              />
            </Space>

            <ul className="post-list">
              {filteredPosts.map(post => (
                <li key={post.id}>
                  <strong>{post.icon} {post.title}</strong>
                  <p>{post.content.substring(0, 40)}...</p>
                </li>
              ))}
            </ul>
          </section>
    </div>
  );
}