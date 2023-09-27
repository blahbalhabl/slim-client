import { useEffect } from 'react';
import '../styles/Alert.css';

const Alert = ({ message, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose(); 
      }, 3000); // Set a fixed duration of 3 seconds

      return () => {
        clearTimeout(timer); // Clear the timer if the component unmounts
      };
    }
  }, [message, onClose]);

  return (
    message && (
    <div className="Alert">
      <p>{message}</p>
    </div>
    )
  );
}

export default Alert;
