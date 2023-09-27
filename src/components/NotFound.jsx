import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { icons } from '../utils/Icons'
import '../styles/NotFound.css'

const NotFound = () => {
  return (
    <div className='Notfound'>
      <h1>404</h1>
      <h2>Not Found</h2>
      <p>The resource requested could not be found on this server!</p>
    </div>
  )
}

export default NotFound