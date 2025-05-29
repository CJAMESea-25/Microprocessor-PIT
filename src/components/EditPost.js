import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { message, Upload, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { db } from '../firebase'; // Ensure this path matches your project structure
import '../styles/EditPost.css';

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

export default function EditPost({ post, onClose, onSave }) {
  const [editedPost, setEditedPost] = useState({ ...post });
  const [categories, setCategories] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);

  // Fetch categories from Firestore in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const fetchedCategories = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      console.log('Fetched categories for EditPost:', fetchedCategories);
      setCategories(fetchedCategories);
      if (!fetchedCategories.length) {
        message.warning('No categories found in Firestore.');
      }
    }, (error) => {
      console.error('Error fetching categories:', error.message, 'Code:', error.code);
      message.error('Failed to load categories.');
    });
    return () => unsubscribe();
  }, []);

  // Fetch existing image URLs from Firestore for this post
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'imageUrls'), (snapshot) => {
      const fetchedImageUrls = snapshot.docs
        .filter((doc) => doc.data().postId === post.id)
        .map((doc) => ({
          id: doc.id,
          uid: doc.id, // For Upload component
          name: `image-${doc.id}.png`, // Placeholder name
          status: 'done',
          url: doc.data().imageUrl,
        }));

      console.log('Fetched imageUrls for post:', fetchedImageUrls);

      // Merge fetched images with locally added (but not yet saved) images
      setFileList((prevFileList) => {
        // Keep locally added images (those without an id)
        const localImages = prevFileList.filter((file) => !file.id);
        // Combine with fetched images, avoiding duplicates by uid
        const updatedFileList = [
          ...fetchedImageUrls,
          ...localImages.filter((localFile) =>
            !fetchedImageUrls.some((fetchedFile) => fetchedFile.uid === localFile.uid)
          ),
        ];
        return updatedFileList;
      });

      setImageUrls(fetchedImageUrls.map((img) => ({ id: img.id, imageUrl: img.url })));
    }, (error) => {
      console.error('Error fetching imageUrls:', error.message, 'Code:', error.code);
      message.error('Failed to load images.');
    });
    return () => unsubscribe();
  }, [post.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedPost({ ...editedPost, [name]: value });
  };

  const handleUploadChange = async ({ fileList: newFileList }) => {
    console.log('Updated fileList:', newFileList);

    // Generate Base64 preview for new uploads
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
        // Delete from Firestore if the image exists in the database
        await deleteDoc(doc(db, 'imageUrls', file.id));
        console.log('Image deleted from Firestore:', file.id);
        message.success('Image deleted successfully');
      }
      return true; // Allow removal from fileList
    } catch (error) {
      console.error('Error deleting image:', error.message, 'Code:', error.code);
      message.error('Failed to delete image');
      return false;
    }
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!editedPost.category || !editedPost.title || !editedPost.content) {
        message.error('Please fill out all required fields');
        return;
      }

      // Update the post in Firestore
      const postRef = doc(db, 'posts', editedPost.id);
      const updatedPostData = {
        category: editedPost.category,
        title: editedPost.title,
        content: editedPost.content,
        timestamp: new Date().toISOString(),
        imageUrl: fileList.length > 0 ? [fileList[0].url || fileList[0].preview] : [], // Update first image for compatibility with ManagePosts
      };
      await updateDoc(postRef, updatedPostData);
      console.log('Post updated successfully in Firestore:', editedPost.id);

      // Handle new image uploads
      const newImages = fileList.filter((file) => !file.id && file.originFileObj);
      if (newImages.length > 0) {
        const imageUrlPromises = newImages.map(async (file) => {
          const base64Image = file.url || file.preview || (await getBase64(file.originFileObj));
          const imageUrlDoc = {
            postId: editedPost.id,
            imageUrl: base64Image,
            timestamp: new Date().toISOString(),
          };
          return addDoc(collection(db, 'imageUrls'), imageUrlDoc);
        });
        await Promise.all(imageUrlPromises);
        console.log('New images saved to Firestore for post ID:', editedPost.id);
      }

      // Call the parent's onSave with updated post data
      onSave({
        ...editedPost,
        photo: fileList.length > 0 ? fileList[0].url || fileList[0].preview : null,
      });
      message.success('Post updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating post:', error.message, 'Code:', error.code);
      message.error('Failed to update post');
    }
  };

  const uploadButton = (
    <div className="field-box">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <div className="preview-overlay" onClick={onClose}>
      <div className="preview-popup" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
        <h2 className="preview-title">Edit Post</h2>

        <div className="preview-details">
          {/* Category Dropdown */}
          <div>
            <div className="label-text">Category</div>
            <div className="field-box">
              <select
                name="category"
                value={editedPost.category}
                onChange={handleChange}
                className="field-input"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title Input */}
          <div>
            <div className="label-text">Title</div>
            <div className="field-box">
              <input
                type="text"
                name="title"
                value={editedPost.title}
                onChange={handleChange}
                className="field-input"
              />
            </div>
          </div>

          {/* Content Textarea */}
          <div>
            <div className="label-text">Content</div>
            <div className="field-box">
              <textarea
                name="content"
                value={editedPost.content}
                onChange={handleChange}
                className="field-input"
                rows="5"
              />
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <div className="label-text">Photos</div>
            <Upload
              listType="picture-card"
              fileList={fileList}
              beforeUpload={() => false} // Prevent automatic upload, let onChange handle it
              onChange={handleUploadChange}
              onRemove={handleRemove}
            >
              {fileList.length >= 5 ? null : uploadButton}
            </Upload>
          </div>
        </div>

        {/* Button container aligns button to lower right */}
        <div className="button-container">
          <button className="update-btn" onClick={handleSave}>
            UPDATE
          </button>
        </div>
      </div>
    </div>
  );
}