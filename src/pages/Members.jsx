import { useEffect, useState } from 'react';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import BreadCrumbs from '../components/BreadCrumbs';
import Modal from '../components/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { icons } from '../utils/Icons';
import '../styles/Members.css';

const Members = () => {
  const axiosPrivate = useAxiosPrivate();
  const [members, setMembers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {setIsModalOpen(false); setDropdown(false)}
  const [inputs, setInputs] = useState({
    email: '',
    name: '',
    position: '',
    branch: '',
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

  const handleNewMember = async () => {
    try {
      await axiosPrivate.post('/new-member', inputs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => {
      return { ...prev, [name]: value };
    });
  };

  useEffect(() => {
    document.title = 'SLIM | Sanggunian Members';
    sendRequest()
  }, []);
  
  return (
    <div className='Members'>
      <BreadCrumbs items={breadcrumbs} />
      <div className="Members__Header">
        <h1>Sanggunian Members</h1>
        <div>
          <button
          className='Members__Header__Button'
          onClick={openModal}
          >
            <FontAwesomeIcon icon={icons.plus}/> New
          </button>
        </div>
      </div>
      <div className='Members__Card__Container'>
        {members}
      </div>
      <Modal isOpen={isModalOpen} closeModal={closeModal}>
        {/* Handle Here all Logic and Inputs for new Sanggunian Bayan Member */}
        Hello I am A Modal
      </Modal>
    </div>
  )
}

export default Members