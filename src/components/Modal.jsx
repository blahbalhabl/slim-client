import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { icons } from '../utils/Icons';
import '../styles/Modal.css'

const Modal = ({ isOpen, closeModal, children }) => {
  if (!isOpen) return null;
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