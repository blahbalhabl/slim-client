import { useEffect, useState } from 'react';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import useAuth from '../hooks/useAuth';
import BreadCrumbs from '../components/BreadCrumbs';
import Modal from '../components/Modal';
import { roles } from '../utils/userRoles';
import { icons } from '../utils/Icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../styles/Members.css';

const Members = () => {
  const role = roles.role;
  const positions = Object.entries(roles.position);
  
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const [members, setMembers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isInputEditing, setInputEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const [inputs, setInputs] = useState({
    name: '',
    position: '',
    startTerm: '',
    endTerm: '',
  });

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

  // const handleNewMember = async () => {
  //   try {
  //     await axiosPrivate.post('/new-member', inputs, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     });
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => {
      return { ...prev, [name]: value };
    });
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

  const handleEditing = (e, user, action) => {
    e.preventDefault();
    if( action === 'edit') {
      user === isInputEditing ? setInputEditing(!isInputEditing) : setInputEditing(user);
    } else {
    user === isEditing ? (
      setIsEditing(!isEditing), 
      setInputEditing(!isInputEditing),
      setInputs({
        name: '',
        position: '',
        startTerm: '',
        endTerm: '',
      })
      ) : setIsEditing(user);
    }
  };

  console.log(isEditing)
  console.log(isInputEditing)

  useEffect(() => {
    document.title = 'SLIM | Sanggunian Members';
    sendRequest();
  }, []);

  // useEffect(() => {
  //   const calculateDefaultEndTerm = () => {
  //     const { startTerm } = inputs;
  //     if (startTerm) {
  //       const startDate = new Date(startTerm);
  //       const endDate = new Date(startDate);
  //       endDate.setFullYear(startDate.getFullYear() + 6); // Add 6 years
  //       const formattedEndDate = endDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  //       setInputs((prev) => ({
  //         ...prev,
  //         endTerm: formattedEndDate,
  //       }));
  //     }
  //   };

  //   calculateDefaultEndTerm();
  // }, [inputs.startTerm])

  return (
    <div className='Members'>
      <BreadCrumbs items={breadcrumbs} />
      <div className="Members__Header">
        <h1>Sanggunian Members</h1>
        <div>
          {/* {(auth.role === role.spr) && (
            <button
              className='Members__Header__Button'
              onClick={openModal}
            > 
              <FontAwesomeIcon icon={icons.plus}/> New
            </button>
          )} */}
        </div>
      </div>
      <div className='Members__Card__Container'>
        <table className='Members__Table'>
          <thead>
            <tr>
              <th>Name</th>
              <th>Position</th>
              <th>Start Term</th>
              <th>End Term</th>
              <th></th>
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
                  <td onClick={(e) => handleEditing(e, member, 'actions')}>
                    <FontAwesomeIcon icon={icons.ellipsis} />
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
      {/* <Modal isOpen={isModalOpen} closeModal={closeModal}>
        // Handle Here all Logic and Inputs for new Sanggunian Bayan Member
        <div className="Modal__Members__Container">
          <label htmlFor="email"> Email
            <input 
              type="email"
              name='email'
              onChange={handleChange}
            />
          </label>
          <label htmlFor="name"> Name
            <input 
              type="text"
              name='name'
              onChange={handleChange}
            />
          </label>
          <label htmlFor="position"> Position
            <select 
              name="position" 
              id="position"
              onChange={handleChange}
            >
              <option value="">Select Position</option>
              { positions.map(([key, value]) => {
                return (
                  <option key={ key } value={ value }>
                    { value }
                  </option> 
                )
              })}
            </select>
            <label htmlFor="start-term"> Start Term
              <input 
                type="date"
                name="startTerm"
                onChange={handleChange}
              />
            </label>
            <label htmlFor="end-term"> End Term
              <input 
                type="date"
                name="endTerm"
                onChange={handleChange}
                value={inputs.endTerm}
              />
            </label>
            <button
              className='Modal__Members__Button'
              onClick={handleNewMember}
            >
              Upload
            </button>
          </label>
        </div>
      </Modal> */}
    </div>
  )
}

export default Members