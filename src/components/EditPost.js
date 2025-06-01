import { PlusOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
import { addDoc, collection, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
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
        setCategories([
          { id: 'cat1', name: 'Emergency Alerts' },
          { id: 'cat2', name: 'General Announcements' },
          { id: 'cat3', name: 'Community Events' },
          { id: 'cat4', name: 'Reminders or Notices' },
        ]);
      }
    }, (error) => {
      console.error('Error fetching categories:', error.message, 'Code:', error.code);
      message.error('Failed to load categories.');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'imageUrls'), (snapshot) => {
      const fetchedImageUrls = snapshot.docs
        .filter((doc) => doc.data().postId === post.id)
        .map((doc) => ({
          id: doc.id,
          uid: doc.id, 
          name: `image-${doc.id}.png`, 
          status: 'done',
          url: doc.data().url, 
        }));

      console.log('Fetched imageUrls for post:', fetchedImageUrls);

      setFileList((prevFileList) => {
        const localImages = prevFileList.filter((file) => !file.id);
        const updatedFileList = [
          ...fetchedImageUrls,
          ...localImages.filter(
            (localFile) => !fetchedImageUrls.some((fetchedFile) => fetchedFile.uid === localFile.uid)
          ),
        ];
        return updatedFileList;
      });

      setImageUrls(fetchedImageUrls.map((img) => ({ id: img.id, url: img.url })));
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
        await deleteDoc(doc(db, 'imageUrls', file.id));
        console.log('Image deleted from Firestore:', file.id);
        message.success('Image deleted successfully');
      }
      return true;
    } catch (error) {
      console.error('Error deleting image:', error.message, 'Code:', error.code);
      message.error('Failed to delete image');
      return false;
    }
  };

  const handleSave = async () => {
    try {
      if (!editedPost.category || !editedPost.title || !editedPost.content) {
        message.error('Please fill out all required fields');
        return;
      }

      const postRef = doc(db, 'posts', editedPost.id);
      const updatedPostData = {
        category: editedPost.category,
        title: editedPost.title,
        content: editedPost.content,
        timestamp: new Date().toISOString(),
      };
      await updateDoc(postRef, updatedPostData);
      console.log('Post updated successfully in Firestore:', editedPost.id);

      const newImages = fileList.filter((file) => !file.id && file.originFileObj);
      if (newImages.length > 0) {
        const imageUrlPromises = newImages.map(async (file) => {
          const base64Image = file.url || file.preview || (await getBase64(file.originFileObj));
          const imageUrlDoc = {
            postId: editedPost.id,
            url: base64Image,
            createdAt: new Date().toISOString(),
          };
          return addDoc(collection(db, 'imageUrls'), imageUrlDoc);
        });
        await Promise.all(imageUrlPromises);
        console.log('New images saved to Firestore for post ID:', editedPost.id);
      }
      onSave({
        ...editedPost,
        images: fileList.map((file) => file.url || file.preview), 
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

          <div>
            <div className="label-text">Photos</div>
            <Upload
              listType="picture-card"
              fileList={fileList}
              beforeUpload={() => false}
              onChange={handleUploadChange}
              onRemove={handleRemove}
            >
              {fileList.length >= 5 ? null : uploadButton}
            </Upload>
          </div>
        </div>

        <div className="button-container">
          <button className="update-btn" onClick={handleSave}>
            UPDATE
          </button>
        </div>
      </div>
    </div>
  );
}