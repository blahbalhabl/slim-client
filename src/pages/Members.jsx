import { useEffect, useState } from 'react';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import BreadCrumbs from '../components/BreadCrumbs';
import { icons } from '../utils/Icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../styles/Members.css';

const Members = () => {
  const axiosPrivate = useAxiosPrivate();
  const [members, setMembers] = useState([]);

  const pathnames = location.pathname.split('/').filter((item) => item !== '');
  const breadcrumbs = pathnames.map((name, index) => ({
    label: name,
    url: `/${pathnames.slice(0, index + 1).join('/')}`,
  }));

  const sendRequest = async () => {
    try {
      const members = await axiosPrivate.get('/sanggunian-members');
      setMembers(members.data);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (date) => {
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return formattedDate;
  };

  useEffect(() => {
    document.title = 'SLIM | Sanggunian Members';
    sendRequest();
  }, []);

  return (
    <div className='Members'>
      <BreadCrumbs items={breadcrumbs} />
      <div className="Members__Header">
        <h1>Sanggunian Members</h1>
      </div>
      <div className='Members__Card__Container'>
        <table className='Members__Table'>
          <thead>
            <tr>
              <th>Name</th>
              <th>Position</th>
              <th>Start Term</th>
              <th>End Term</th>
            </tr>
          </thead>
          <tbody className='Members__Data'>
            {members.map((member, i) => (
                <tr key={i}>
                  <td data-cell='name'>
                    <p>{member.name}</p>
                  </td>
                  <td data-cell='position'>
                    <p>{member.position}</p>
                  </td>
                  <td data-cell='start Term'>
                    <p>{formatDate(member.startTerm)}</p>
                  </td>
                  <td data-cell='end Term'>
                    <p>{formatDate(member.endTerm)}</p>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Members