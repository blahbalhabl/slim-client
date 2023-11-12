import { useState, useEffect } from 'react';
import Loader from './Loader';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import useAuth from '../hooks/useAuth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { icons } from '../utils/Icons';
import { roles } from '../utils/userRoles';
import '../styles/SuperAdmin.css';

const SuperAdmin = () => {
  const { auth } = useAuth();
	const axiosPrivate = useAxiosPrivate();
  const [users, setUsers] = useState({});
	const [loading, setLoading] = useState(true);

  const level = roles.level;

  const sendRequest = async () => {
    try {
      const res = await axiosPrivate.get('/users');
      return { 
        users: res.data, 
      };
    } catch (err) {
       throw err;
    }
  };

	useEffect(() => {
		let isMounted = true;
    const controller = new AbortController();
    sendRequest()
      .then(({
        users, 
      }) => { 
        if ( isMounted ) {
          setUsers(users);
          graphData(users);
        }
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });

      return () => {
        isMounted = false;
        controller.abort();
      }
	}, []);

	if (loading) {
    return <Loader />;
  }

  return (
    <div className='SuperAdmin'>
      <div className="Admin__Card users">
        <div className="Admin__Card__Info">
          <p>Municipal Accounts</p>
          {users.lgu}
        </div>
        <span><FontAwesomeIcon icon={icons.user}/></span>
      </div>
      <div className="Admin__Card users">
        <div className="Admin__Card__Info">
          <p>DILG Accounts</p>
          {users.dilg}
        </div>
        <span><FontAwesomeIcon icon={icons.user}/></span>
      </div>
      <div className="Admin__Card users">
        <div className="Admin__Card__Info">
          <p>Barangay Accounts</p>
          {users.brgy}
        </div>
        <span><FontAwesomeIcon icon={icons.user}/></span>
      </div>
  </div>
  )
}

export default SuperAdmin