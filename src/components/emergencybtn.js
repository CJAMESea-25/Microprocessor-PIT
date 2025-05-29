// components/EmergencyModal.jsx
import { Modal, message, Button } from 'antd';
import { useEffect } from 'react';
import '../styles/emergencybtn.css';

export default function EmergencyModal({
  visible,
  onClose,
  selectedOption,
  setSelectedOption,
}) {
  useEffect(() => {
    if (selectedOption === 'red') {
      message.warning('🚨 Red Warning: Immediate action required!');
    } else if (selectedOption === 'yellow') {
      message.info('⚠️ Yellow Warning: Monitor the situation closely.');
    } else if (selectedOption === 'green') {
      message.success('✅ Green Warning: Situation is under control.');
    }
  }, [selectedOption]);

  const handleEmergencySelect = (value) => {
    setSelectedOption(value);
  };

  return (
    <Modal
      title="🚨 Emergency Action Required"
      open={visible}
      onCancel={onClose}
      cancelText="Cancel"
      className="emergency-modal"
      centered
      width={500}
      styles={{ body: { padding: '24px' } }}
    >
      <div className="emergency-button-group">
        <Button
          className={`emergency-option-button red-button ${selectedOption === 'red' ? 'selected' : ''}`}
          onClick={() => handleEmergencySelect('red')}
        >
          RED WARNING
        </Button>
        <Button
          className={`emergency-option-button green-button ${selectedOption === 'green' ? 'selected' : ''}`}
          onClick={() => handleEmergencySelect('green')}
        >
          GREEN WARNING
        </Button>
        <Button
          className={`emergency-option-button yellow-button ${selectedOption === 'yellow' ? 'selected' : ''}`}
          onClick={() => handleEmergencySelect('yellow')}
        >
          YELLOW WARNING
        </Button>
      </div>
    </Modal>
  );
}
