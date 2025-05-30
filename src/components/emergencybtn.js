import { Button, Modal, message } from 'antd';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import '../styles/EmergencyBtn.css';

export default function EmergencyModal({
  visible,
  onClose,
  selectedDisaster,
  setSelectedOption,
}) {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [messages, setMessages] = useState({
    red: { title: '', content: '' },
    yellow: { title: '', content: '' },
    green: { title: '', content: '' },
  });

  useEffect(() => {
    if (!selectedDisaster) return;

    const fetchMessages = async () => {
      try {
        const redDoc = await getDoc(doc(db, 'emergencies', `${selectedDisaster}Red`));
        const yellowDoc = await getDoc(doc(db, 'emergencies', `${selectedDisaster}Yellow`));
        const greenDoc = await getDoc(doc(db, 'emergencies', `${selectedDisaster}Green`));

        setMessages({
          red: redDoc.exists() ? redDoc.data() : { title: '', content: '' },
          yellow: yellowDoc.exists() ? yellowDoc.data() : { title: '', content: '' },
          green: greenDoc.exists() ? greenDoc.data() : { title: '', content: '' },
        });
      } catch (error) {
        message.error(`Failed to fetch messages from Firestore: ${error.message}`);
      }
    };

    fetchMessages();
  }, [selectedDisaster]);

  useEffect(() => {
    if (selectedLevel === 'red') {
      message.warning(messages.red.content || '🚨 Red Warning: Immediate action required!');
    } else if (selectedLevel === 'yellow') {
      message.info(messages.yellow.content || '⚠️ Yellow Warning: Monitor the situation closely.');
    } else if (selectedLevel === 'green') {
      message.success(messages.green.content || '✅ Green Warning: Situation is under control.');
    }
  }, [selectedLevel, messages]);

  const handleEmergencySelect = async (level) => {
    setSelectedLevel(level);
    setSelectedOption(level);

    if (!selectedDisaster) {
      message.error('No disaster selected. Please select a disaster first.');
      setSelectedLevel(null);
      setSelectedOption(null);
      return; // Do not close modal yet to allow user to retry
    }

    try {
      // Deactivate all emergency messages
      const disasterIds = ['rainfall', 'floodTyphoon', 'earthquake', 'volcanicEruption', 'landslide'];
      const levels = ['Red', 'Yellow', 'Green'];
      for (const disaster of disasterIds) {
        for (const lvl of levels) {
          const docRef = doc(db, 'emergencies', `${disaster}${lvl}`);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            await updateDoc(docRef, { active: false });
          }
        }
      }

      // Activate the selected message
      const docId = `${selectedDisaster}${level.charAt(0).toUpperCase() + level.slice(1)}`;
      const docRef = doc(db, 'emergencies', docId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        message.error(`Emergency post ${docId} does not exist in Firestore.`);
        return; // Do not close modal to allow user to retry
      }

      await updateDoc(docRef, {
        active: true,      });

      message.success(`Activated ${selectedDisaster} ${level} warning`);
      setTimeout(() => {
        setSelectedLevel(null); // Reset selection
        onClose(); // Close modal after slight delay for feedback
      }, 200); // 500ms delay to ensure success message is visible
    } catch (error) {
      message.error(`Failed to update Firestore: ${error.message}`);
    }
  };
  const handleCancel = () => {
    setSelectedLevel(null); // Reset selection
    setSelectedOption(null); // Reset option in parent
    onClose(); // Close modal
  };

  return (
    <Modal
      title={`🚨 ${selectedDisaster ? selectedDisaster.charAt(0).toUpperCase() + selectedDisaster.slice(1) : 'Emergency'} Action Required`}
      open={visible}
      onCancel={handleCancel}
      className="emergency-modal"
      centered
      width={500}
      styles={{ body: { padding: '24px' } }}
      footer={[
        <Button key="cancel" onClick={handleCancel} className="emergency-cancel-button">
          Cancel
        </Button>,
      ]}
    >
      <div className="emergency-button-group">
        <Button
          className={`emergency-option-button red-button ${selectedLevel === 'red' ? 'selected' : ''}`}
          onClick={() => handleEmergencySelect('red')}
        >
          RED WARNING
        </Button>
        <Button
          className={`emergency-option-button green-button ${selectedLevel === 'green' ? 'selected' : ''}`}
          onClick={() => handleEmergencySelect('green')}
        >
          GREEN WARNING
        </Button>
        <Button
          className={`emergency-option-button yellow-button ${selectedLevel === 'yellow' ? 'selected' : ''}`}
          onClick={() => handleEmergencySelect('yellow')}
        >
          YELLOW WARNING
        </Button>
      </div>
    </Modal>
  );
}