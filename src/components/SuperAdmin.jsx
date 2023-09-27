import { useState, useEffect } from 'react';
import Loader from './Loader';
import LineGraph from './LineGraph';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { icons } from '../utils/Icons';

const SuperAdmin = () => {
	const axiosPrivate = useAxiosPrivate();
  const [users, setUsers] = useState({});
	const [loading, setLoading] = useState(true);

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
          {/* <LineGraph chartData={users}/> */}
         </div>
        <span><FontAwesomeIcon icon={icons.user}/></span>
      </div>
  </div>
  )
}

export default SuperAdmin