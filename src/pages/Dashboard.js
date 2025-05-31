import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Dropdown, Form, Image, Input, Menu, Select, Space, Upload, message } from "antd";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FaBell, FaEllipsisV } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DisasterModal from "../components/DisasterBtn";
import EmergencyModal from "../components/EmergencyBtn";
import Sidebar from "../components/sidebar";
import { auth, db } from "../firebase";
import "../styles/Dashboard.css";

const { TextArea, Search } = Input;
const { Option } = Select;

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const SubmitButton = ({ form, isEditMode }) => {
  const [submittable, setSubmittable] = useState(false);
  const values = Form.useWatch([], form);

  useEffect(() => {
    form
      .validateFields({ validateOnly: true })
      .then(() => setSubmittable(true))
      .catch(() => setSubmittable(false));
  }, [form, values]);

  return (
    <Button
      className="post-button"
      type="primary"
      htmlType="submit"
      disabled={!submittable}
    >
      {isEditMode ? "UPDATE POST" : "ADD POST"}
    </Button>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [fileList, setFileList] = useState([]);
  const [posts, setPosts] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [form] = Form.useForm();
  const [isDisasterModalVisible, setIsDisasterModalVisible] = useState(false);
  const [isEmergencyModalVisible, setIsEmergencyModalVisible] = useState(false);
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentMenuKey, setCurrentMenuKey] = useState("");
  const [editedPost, setEditedPost] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        message.error("Please log in");
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "categories"),
      (snapshot) => {
        const fetchedCategories = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setCategories(fetchedCategories);
        if (!fetchedCategories.length) {
          message.warning("No categories found in Firestore. Using defaults.");
          setCategories([
            { id: "cat1", name: "Emergency Alerts" },
            { id: "cat3", name: "General Announcements" },
            { id: "cat4", name: "Community Events" },
            { id: "cat5", name: "Reminders or Notices" },
          ]);
        }
      },
      (error) => {
        message.error("Failed to load categories. Using defaults.");
        setCategories([
          { id: "cat1", name: "Emergency Alerts" },
          { id: "cat3", name: "General Announcements" },
          { id: "cat4", name: "Community News" },
          { id: "cat5", name: "Reminders or Notices" },
        ]);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "posts"),
      (snapshot) => {
        const fetchedPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(fetchedPosts);
      },
      (error) => {
        message.error("Failed to load posts");
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "imageUrls"),
      (snapshot) => {
        const fetchedImageUrls = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setImageUrls(fetchedImageUrls);
      },
      (error) => {
        message.error("Failed to load imageUrls");
      }
    );
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
      message.error("Failed to preview image");
    }
  };

  const handleChange = async ({ fileList: newFileList }) => {
    const updatedFileList = await Promise.all(
      newFileList.map(async (file) => {
        if (file.originFileObj && !file.url && !file.preview) {
          const preview = await getBase64(file.originFileObj);
          return { ...file, preview };
        }
        return file;
      })
    );
    setFileList(updatedFileList);
  };

  const handleRemove = async (file) => {
    try {
      if (file.id) {
        await deleteDoc(doc(db, "imageUrls", file.id));
        message.success("Image deleted successfully");
      }
      return true;
    } catch (error) {
      message.error("Failed to delete image");
      return false;
    }
  };

  const getIcon = (cat) => {
    if (!cat) return "📌";
    if (cat.includes("Emergency Alerts")) return "🚨";
    if (cat.includes("General Announcements")) return "📢";
    if (cat.includes("Community News") || cat.includes("Community Events")) return "📅";
    if (cat.includes("Reminders or Notices")) return "📝";
    return "📌";
  };

  const handleFormFinish = async (values) => {
    if (!values.category || !values.title || !values.description) {
      message.error("Please fill out all required fields");
      return;
    }

    try {
      const categoryName = categories.find((cat) => cat.id === values.category)?.name || "";
      const postData = {
        category: categoryName,
        title: values.title,
        content: values.description,
        timestamp: new Date().toISOString(),
      };

      if (isEditMode && editedPost) {
        const postRef = doc(db, "posts", editedPost.id);
        await updateDoc(postRef, postData);

        // Handle image updates
        const existingImages = imageUrls.filter((img) => img.postId === editedPost.id);
        const currentImageUrls = fileList.map((file) => file.url).filter(Boolean);
        const imagesToDelete = existingImages.filter((img) => !currentImageUrls.includes(img.url));
        await Promise.all(imagesToDelete.map((img) => deleteDoc(doc(db, "imageUrls", img.id))));

        const newImages = fileList.filter((file) => !file.id && file.originFileObj);
        if (newImages.length > 0) {
          const imagePromises = newImages.map(async (file) => {
            const base64Image = file.url || file.preview || (await getBase64(file.originFileObj));
            return addDoc(collection(db, "imageUrls"), {
              postId: editedPost.id,
              url: base64Image,
              createdAt: new Date().toISOString(),
            });
          });
          await Promise.all(imagePromises);
        }

        message.success("Post updated successfully");
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === editedPost.id ? { ...post, ...postData } : post
          )
        );
      } else {
        const postRef = await addDoc(collection(db, "posts"), postData);
        if (fileList.length > 0) {
          const imagePromises = fileList.map(async (file) => {
            const base64Image = file.url || file.preview || (await getBase64(file.originFileObj));
            return addDoc(collection(db, "imageUrls"), {
              postId: postRef.id,
              url: base64Image,
              createdAt: new Date().toISOString(),
            });
          });
          await Promise.all(imagePromises);
        }
        message.success("Post added successfully");
      }

      setIsEditMode(false);
      setEditedPost(null);
      setSelectedPost(null);
      form.resetFields();
      setFileList([]);
    } catch (error) {
      message.error(`Failed to ${isEditMode ? "update" : "add"} post: ${error.message}`);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await deleteDoc(doc(db, "posts", postId));
      const imageUrlsToDelete = imageUrls.filter((imageUrl) => imageUrl.postId === postId);
      const deleteImageUrlPromises = imageUrlsToDelete.map((imageUrl) =>
        deleteDoc(doc(db, "imageUrls", imageUrl.id))
      );
      await Promise.all(deleteImageUrlPromises);
      message.success("Post and associated image URLs deleted successfully");
      setSelectedPost(null);
    } catch (error) {
      message.error("Failed to delete post");
    }
  };

  const handleEditPost = (post) => {
    if (post) {
      setIsEditMode(true);
      setSelectedPost(null);
      setEditedPost(post);
      form.setFieldsValue({
        category: categories.find((cat) => cat.name === post.category)?.id,
        title: post.title,
        description: post.content,
      });
      const postImages = imageUrls
        .filter((img) => img.postId === post.id)
        .map((img, index) => ({
          id: img.id,
          uid: img.id,
          name: `image-${index + 1}.png`,
          status: "done",
          url: img.url,
        }));
      setFileList(postImages);
    } else {
      message.error("No post selected for editing");
    }
  };

  const menu = (post) => (
    <Menu>
      <Menu.Item key="edit" onClick={() => handleEditPost(post)}>
        Edit
      </Menu.Item>
      <Menu.Item key="delete" danger onClick={() => handleDeletePost(post.id)}>
        Delete
      </Menu.Item>
    </Menu>
  );

  const filteredPosts = posts
    .filter((post) => post?.type !== "emergency" && post?.title?.toLowerCase().includes(searchTerm.toLowerCase()))
    .map((post) => ({
      ...post,
      images: imageUrls.filter((img) => img.postId === post.id).map((img) => img.url),
    }));

  const uploadButton = (
    <div className="upload-card">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const showDisasterModal = () => {
    setIsDisasterModalVisible(true);
    setSelectedOption(null);
    setSelectedDisaster(null);
  };

  const handleDisasterModalClose = () => {
    setIsDisasterModalVisible(false);
    setSelectedDisaster(null);
  };

  const handleDisasterSelect = (disasterId) => {
    setSelectedDisaster(disasterId);
    setIsDisasterModalVisible(false);
    setIsEmergencyModalVisible(true);
  };

  const handleEmergencyModalClose = () => {
    setIsEmergencyModalVisible(false);
    setSelectedOption(null);
    setSelectedDisaster(null);
  };

  const handleCancelEdit = () => {
    form.resetFields();
    setFileList([]);
    setIsEditMode(false);
    setEditedPost(null);
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setIsEditMode(false);
    form.resetFields();
    setFileList([]);
    setEditedPost(null);
  };

  const handleBack = () => {
    setSelectedPost(null);
    setIsEditMode(false);
    form.resetFields();
    setFileList([]);
    setEditedPost(null);
  };

  return (
    <div className="manage-container">
      <Sidebar
        activePage="Dashboard"
        logo={<span className="logo-text">BayanBoard</span>}
        user="admin123"
        menuItems={[
          { label: "Dashboard", onClick: () => {} },
          { label: "Manage All Post", onClick: () => {} },
          { label: "View Bulletin", onClick: () => {} },
          { label: "Log Out", onClick: () => navigate("/logout") },
        ]}
      />
      <main className="main-content">
        <div className="container">
          <h1>DASHBOARD</h1>
          {selectedPost ? (
            <div className="post">
                <h2>👁️ Preview Post</h2>
                <Dropdown overlay={() => menu(selectedPost)} trigger={["click"]}>
                  <Button type="link" icon={<FaEllipsisV />} className="ant-dropdown-trigger" />
                </Dropdown>
              <p>
                You're currently viewing a published post. Use the three-dot menu to edit or delete this post.
              </p>
              <div className="preview-form">
                <div className="form-item-spacing">
                  <label className="ant-form-item-label">Category</label>
                  <Input className="custom-select" value={selectedPost.category} readOnly />
                </div>
                <div className="form-item-spacing">
                  <label className="ant-form-item-label">Title</label>
                  <Input className="custom-title" value={selectedPost.title} readOnly />
                </div>
                <div className="form-item-spacing">
                  <label className="ant-form-item-label">Description</label>
                  <TextArea
                    className="custom-description"
                    value={selectedPost.content}
                    autoSize={{ minRows: 3, maxRows: 10 }}
                    readOnly
                  />
                </div>
                {selectedPost.images && selectedPost.images.length > 0 && (
                  <div className="form-item-spacing">
                    <label className="ant-form-item-label">Images</label>
                    <div className="preview-images">
                      <div className="image-container">
                        {selectedPost.images.map((imageUrl, index) => (
                          <img
                            key={index}
                            src={imageUrl}
                            alt={`Post image ${index + 1}`}
                            className="preview-image"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div className="form-item-spacing">
                  <Button type="primary" onClick={handleBack} className="post-button">
                    GO BACK
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="post">
              <h2>{isEditMode ? "✍️ Edit Post" : "📝 Create New Post"}</h2>
              <p>
                {isEditMode
                  ? "Edit the post details below. All changes will be updated on the public board after submission."
                  : "Fill out the form below to publish a new bulletin post. All posts will be displayed on the public board after submission. Photo upload is optional."}
              </p>
              <Form form={form} layout="vertical" autoComplete="off" onFinish={handleFormFinish}>
                <div className="form-item-spacing">
                  <label className="ant-form-item-label">Category</label>
                  <Form.Item
                    name="category"
                    rules={[{ required: true, message: "Category is required" }]}
                  >
                    <Select className="custom-select" placeholder="Select a category" loading={!categories.length}>
                      {categories.map((category) => (
                        <Option key={category.id} value={category.id}>
                          {category.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
                <div className="form-item-spacing">
                  <label className="ant-form-item-label">Title</label>
                  <Form.Item
                    name="title"
                    rules={[{ required: true, message: "Title is required" }]}
                  >
                    <Input className="custom-title" placeholder="Title" />
                  </Form.Item>
                </div>
                <div className="form-item-spacing">
                  <label className="ant-form-item-label">Description</label>
                  <Form.Item
                    name="description"
                    rules={[{ required: true, message: "Description is required" }]}
                  >
                    <TextArea
                      className="custom-description"
                      placeholder="Description..."
                      autoSize={{ minRows: 3, maxRows: 10 }}
                    />
                  </Form.Item>
                </div>
                <Form.Item className="form-item-spacing">
                  <div className="label-text">Photos</div>
                  <Upload
                    listType="picture-card"
                    fileList={fileList}
                    beforeUpload={() => false}
                    onPreview={handlePreview}
                    onChange={handleChange}
                    onRemove={handleRemove}
                  >
                    {fileList.length >= 5 ? null : uploadButton}
                  </Upload>
                  {previewImage && (
                    <Image
                      wrapperClassName="hidden-image"
                      preview={{
                        visible: previewOpen,
                        onVisibleChange: (visible) => setPreviewOpen(visible),
                        afterOpenChange: (visible) => !visible && setPreviewImage(""),
                      }}
                      src={previewImage}
                    />
                  )}
                </Form.Item>
                <Form.Item className="form-item-spacing">
                  <Space direction="horizontal" align="start" size={16}>
                    {isEditMode && (
                      <Button className="cancel-button1" type="primary" onClick={handleCancelEdit}>
                        CANCEL
                      </Button>
                    )}
                    <SubmitButton form={form} isEditMode={isEditMode} />
                  </Space>
                </Form.Item>
              </Form>
            </div>
          )}
        </div>
      </main>
      <section className="post-section">
        <div className="emerg-button">
          <h1>EMERGENCY</h1>
          <button className="emergency-btn" onClick={showDisasterModal} type="button">
            <FaBell />
          </button>
        </div>
        <h2>All Posts</h2>
        <p>Click on a post title below to view or edit its full content.</p>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Search
            className="search-bar"
            placeholder="Search title"
            allowClear
            enterButton="Search"
            size="middle"
            prefix={<SearchOutlined />}
            onSearch={(value) => setSearchTerm(value)}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Space>
        <ul className="post-list">
          {filteredPosts.map((post) => (
            <li key={post.id}>
              <div className="post-item">
                <span>{getIcon(post.category)}</span>
                <strong className="post-title" onClick={() => handlePostClick(post)}>
                  {post.title}
                </strong>
              </div>
              <p>{post.content.substring(0, 40)}...</p>
              {post.images && post.images.length > 0 && (
                <div className="post-images">
                  {post.images.map((imageUrl, index) => (
                    <img
                      key={index}
                      src={imageUrl}
                      alt={`Post image ${index + 1}`}
                      className="post-list-image"
                    />
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
        <DisasterModal
          visible={isDisasterModalVisible}
          onClose={handleDisasterModalClose}
          onDisasterSelect={handleDisasterSelect}
        />
        <EmergencyModal
          visible={isEmergencyModalVisible}
          onClose={handleEmergencyModalClose}
          selectedDisaster={selectedDisaster}
          setSelectedOption={setSelectedOption}
        />
      </section>
    </div>
  );
}