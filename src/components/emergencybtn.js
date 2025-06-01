import { Button, Modal, message } from 'antd';
import { addDoc, collection } from 'firebase/firestore';
import { useState } from 'react';
import { db } from '../firebase';
import '../styles/EmergencyBtn.css';

export default function EmergencyModal({
  visible,
  onClose,
  selectedDisaster,
  setSelectedOption,
}) {
  const [selectedLevel, setSelectedLevel] = useState(null);

  const mapDisasterToKeyFormat = (disaster) => {
    switch (disaster) {
      case 'rainfall':
        return 'Rainfall';
      case 'floodTyphoon':
        return 'Flood/Typhoon';
      case 'earthquake':
        return 'Earthquake';
      case 'volcanicEruption':
        return 'VolcanicEruption';
      case 'landslide':
        return 'Landslide';
      default:
        return disaster;
    }
  };

  const disasterMessages = {
    RainfallRed: {
      type: 'emergency',
      category: 'Emergency Alerts',
      level: 'red',
      title: 'Heavy Rain Red Warning',
      content: 'Heavy rain starting! Move to safe shelters now. Stay away from flooded roads.',
    },
    RainfallYellow: {
      type: 'emergency',
      category: 'Emergency Alerts',
      level: 'yellow',
      title: 'Heavy Rain Yellow Warning',
      content: 'Very heavy rain coming! Watch updates and prepare for floods.',
    },
    RainfallGreen: {
      type: 'emergency',
      category: 'Emergency Alerts',
      level: 'green',
      title: 'Heavy Rain Green Warning',
      content: 'Rain slowing down. Resume normal activities',
    },
    'Flood/TyphoonRed': {
      type: 'emergency',
      category: 'Emergency Alerts',
      level: 'red',
      title: 'Flood/Typhoon Red Warning',
      content: 'Flood covering anytime. All residents should have been evacuated. Stay safe!',
    },
    'Flood/TyphoonYellow': {
      type: 'emergency',
      category: 'Emergency Alerts',
      level: 'yellow',
      title: 'Flood/Typhoon Yellow Warning',
      content: 'Flood or typhoon risk growing. Watch updates and prepare to evacuate.',
    },
    'Flood/TyphoonGreen': {
      type: 'emergency',
      category: 'Emergency Alerts',
      level: 'green',
      title: 'Flood/Typhoon Green Warning',
      content: 'Flood/typhoon has passed. It’s safe to resume normal activities but stay alert for updates.',
    },
    EarthquakeRed: {
      type: 'emergency',
      category: 'Emergency Alerts',
      level: 'red',
      title: 'Earthquake Red Warning',
      content: 'Earthquake happening! Drop, Cover, and Hold. Go to open areas when safe.',
    },
    EarthquakeYellow: {
      type: 'emergency',
      category: 'Emergency Alerts',
      level: 'yellow',
      title: 'Earthquake Yellow Warning',
      content: 'Aftershocks may happen. Stay alert!',
    },
    EarthquakeGreen: {
      type: 'emergency',
      category: 'Emergency Alerts',
      level: 'green',
      title: 'Earthquake Green Warning',
      content: 'No more aftershocks. Resume normal activities.',
    },
    VolcanicEruptionRed: {
      type: 'emergency',
      category: 'Emergency Alerts',
      level: 'red',
      title: 'Volcanic Eruption Red Warning',
      content: 'Volcano erupting soon! Leave danger areas now and follow evacuation routes.',
    },
    VolcanicEruptionYellow: {
      type: 'emergency',
      category: 'Emergency Alerts',
      level: 'yellow',
      title: 'Volcanic Eruption Yellow Warning',
      content: 'Increased volcanic activity detected. A possible eruption may occur soon. Prepare for evacuation, avoid ashfall-prone areas, and stay updated through official alerts.',
    },
    VolcanicEruptionGreen: {
      type: 'emergency',
      category: 'Emergency Alerts',
      level: 'green',
      title: 'Volcanic Eruption Green Warning',
      content: 'Volcano activity stopped. You can do normal activities now.',
    },
    LandslideRed: {
      type: 'emergency',
      category: 'Emergency Alerts',
      level: 'red',
      title: 'Landslide Red Warning',
      content: 'Landslide danger high! Leave hilly areas now and go to safe zones.',
    },
    LandslideYellow: {
      type: 'emergency',
      category: 'Emergency Alerts',
      level: 'yellow',
      title: 'Landslide Yellow Warning',
      content: 'Ground movement observed. A possible landslide may occur. Monitor conditions closely, avoid elevated areas, and be ready to evacuate.',
    },
    LandslideGreen: {
      type: 'emergency',
      category: 'Emergency Alerts',
      level: 'green',
      title: 'Landslide Green Warning',
      content: 'Landslide risk gone. You can do normal activities now.',
    },
  };

  const handleEmergencySelect = async (level) => {
    setSelectedLevel(level);
    setSelectedOption(level);

    if (!selectedDisaster) {
      message.error('No disaster selected. Please select a disaster first.');
      setSelectedLevel(null);
      setSelectedOption(null);
      return;
    }

    try {
      const formattedDisaster = mapDisasterToKeyFormat(selectedDisaster);
      const docId = `${formattedDisaster}${level.charAt(0).toUpperCase() + level.slice(1)}`;
      const messageData = disasterMessages[docId];

      if (!messageData) {
        message.error(`Emergency post ${docId} does not exist.`);
        setSelectedLevel(null);
        setSelectedOption(null);
        return;
      }

      await addDoc(collection(db, 'posts'), {
        type: messageData.type,
        category: messageData.category,
        title: messageData.title,
        content: messageData.content,
        timestamp: new Date().toISOString(),
      });

      if (level === 'red') {
        message.warning(messageData.content || '🚨 Red Warning: Immediate action required!');
      } else if (level === 'yellow') {
        message.info(messageData.content || '⚠️ Yellow Warning: Monitor the situation closely.');
      } else if (level === 'green') {
        message.success(messageData.content || '✅ Green Warning: Situation is under control.');
      }

      message.success(`Emergency post "${formattedDisaster} ${level}" created`);
      setTimeout(() => {
        setSelectedLevel(null);
        onClose();
      }, 200);
    } catch (error) {
      message.error(`Failed to create emergency post: ${error.message}`);
      setSelectedLevel(null);
      setSelectedOption(null);
    }
  };

  const handleCancel = () => {
    setSelectedLevel(null);
    setSelectedOption(null);
    onClose();
  };

  return (
    <Modal
      title={`${selectedDisaster ? mapDisasterToKeyFormat(selectedDisaster) : 'Emergency'} Action Required`} 
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
          className={`emergency-option-button yellow-button ${selectedLevel === 'yellow' ? 'selected' : ''}`}
          onClick={() => handleEmergencySelect('yellow')}
        >
          YELLOW WARNING
        </Button>
        <Button
          className={`emergency-option-button green-button ${selectedLevel === 'green' ? 'selected' : ''}`}
          onClick={() => handleEmergencySelect('green')}
        >
          GREEN WARNING
        </Button>
      </div>
    </Modal>
  );
}