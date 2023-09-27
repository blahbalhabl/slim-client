import { useEffect } from 'react';
import '../styles/Members.css';

const Members = () => {

  useEffect(() => {
    document.title = 'SLIM | Sanggunian Members';
  })
  return (
    <div className='Members'>
      <h1>Sanggunian Members</h1>
      <div className='Members__Card__Container'>
        
      </div>
    </div>
  )
}

export default Members