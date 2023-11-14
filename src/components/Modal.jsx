import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { icons } from '../utils/Icons';
import '../styles/Modal.css'

const Modal = ({ isOpen, closeModal, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('active-modal');
    } else {
      document.body.classList.remove('active-modal');
    }

    // Clean up the styles on component unmount
    return () => {
      document.body.classList.remove('active-modal');
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="Modal">
      <div className="Modal__Container">
        <button 
          className="Modal__Close__Button" 
          onClick={closeModal} >
          <FontAwesomeIcon icon={icons.close} />
        </button>
        {children}
      </div>
      <div 
        onClick={closeModal} 
        className='Modal__Overlay'>
      </div>
    </div>
  );
};

export default Modal