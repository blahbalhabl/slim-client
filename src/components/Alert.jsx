import { useEffect, useState } from 'react';
import '../styles/Alert.css';

const Alert = ({ message, severity, onClose }) => {
  const [type, setType] = useState('');

  const handleSeverity = (severity) => {
    if (severity >= 200 && severity < 300) {
      return 'Success';
    }
    if(severity >= 400) {
      return 'Error';
    }
  };

  useEffect(() => {
    if (message) {
      const type = handleSeverity(severity);
      setType(type);
      // Set a Timer where the Alert automatically closes after some time
      const timer = setTimeout(() => {
        onClose(); 
      }, 3000); // Set a fixed duration of 3 seconds

      return () => {
        clearTimeout(timer); // Clear the timer if the component unmounts
      };
    }
  }, [message, severity, onClose]);

  return (
    message && 
    (
    <div className={`Alert ${type}`}>
      <h1>{type}</h1>
      <p>{message}</p>
    </div>
    )
  );
}

export default Alert;
