import { Modal, Button, message } from 'antd';
import '../styles/EmergencyBtn.css';

export default function DisasterModal({
  visible,
  onClose,
  onDisasterSelect,
}) {
  const disasters = [
    { id: 'rainfall', label: 'Heavy Rain' },
    { id: 'floodTyphoon', label: 'Flood/Typhoon' },
    { id: 'earthquake', label: 'Earthquake' },
    { id: 'volcanicEruption', label: 'Volcanic Eruption' },
    { id: 'landslide', label: 'Landslide' },
  ];

  const handleDisasterClick = (disasterId) => {
    onDisasterSelect(disasterId);
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal
      title="🚨 Select Disaster Type"
      open={visible}
      onCancel={handleCancel}
      className="disaster-modal"
      centered
      width={500}
      styles={{ body: { padding: '24px' } }}
      footer={[
        <Button key="cancel" onClick={handleCancel} className="disaster-cancel-button">
          Cancel
        </Button>,
      ]}
    >
      <div className="disaster-button-group">
        {disasters.map((disaster) => (
          <Button
            key={disaster.id}
            className="disaster-option-button"
            onClick={() => handleDisasterClick(disaster.id)}
          >
            {disaster.label}
          </Button>
        ))}
      </div>
    </Modal>
  );
}