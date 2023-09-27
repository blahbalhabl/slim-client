import { useEffect } from 'react';
import '../styles/Unauthorized.css';

const Unauthorized = () => {

  useEffect(() => {
    document.title = 'SLIM | Unauthorized';
  }, []);

  return (
    <div 
      className="Unauthorized">
        <p>Unauthorized</p>
    </div>
  )
}

export default Unauthorized