import Modal from './Modal';
import { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { roles } from '../utils/userRoles';
import '../styles/CreateOrdinances.css'

const CreateOrdinances = () => {
  const role = roles.role;
  const level = roles.level;
  const { auth, setReload } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const [message, setMessage] = useState();
  const [uploading, setUploading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [members, setMembers ] = useState(null);
  const [inputs, setInputs] = useState({
    number: "",
    series: "",
    title: "",
    author: "",
  });
  const [file, setFile] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => {
      return { ...prev, [name]: value };
    });
  };

  const getAuthors = async () => {
    try {
      const res = await axiosPrivate.get('/sanggunian-members');
      const members = res.data;
      return {
        members: members,
      }
    } catch (err) {
      console.error(err);
    }
  };  

  const handleFileChange = (e) => {
    e.preventDefault();
    console.log(e.target.files[0]);
    const file = e.target.files[0];
    setFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await uploadFile()
      .then(() => setReload(true))
    setUploading(false);
  };

  const uploadFile = async () => {
    try {
      const formData = new FormData();
      formData.append('number', inputs.number);
      formData.append('series', inputs.series);
      formData.append('title', inputs.title);
      formData.append('status', 'draft');
      formData.append('level', auth.level);
      formData.append('author', inputs.author);
      formData.append('file', file);
      const res = await axiosPrivate.post('/upload/ordinance/draft?type=ordinances', formData, {
        headers: {'Content-Type': 'multipart/form-data'}
      })

      if (res.status === 200 || 401) {
        setMessage(res.data.message);
      } else {
        setMessage('Error on Uploading Ordinance')
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getAuthors()
    .then(({ members }) => {
      setMembers(members);
    })
  }, []);

  useEffect(() => {
    if (message) {
      setShowAlert(true);

      // Hide the alert after 3 seconds (adjust the time as needed)
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 3000);

      // Clear the timer when the component unmounts
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="CreateOrdinances">
      <h1>List of Ordinances</h1>
      {auth.level !== level.dlg && (
        <button className="CreateOrdinances__Button" onClick={openModal}>Create New Ordinance</button>
      )}
      <Modal 
        isOpen={isModalOpen} 
        closeModal={closeModal}
      >
        <div className='CreateOrdinances__Container'>
          <h3>Submit a Draft {auth.level === level.lgu ? 'Municipal' : 'Barangay' } Level Ordinance</h3>
            <form onSubmit={handleSubmit}>
              <div className='CreateOrdinances__Title'>
                <label htmlFor="ordinance-number">Number:</label>
                <input 
                  className='CreateOrdinances__Input'
                  type="number"
                  name='number'
                  id='ordinance-number'
                  placeholder="e.g. '01'"
                  onChange={handleChange}
                />
                <label htmlFor="ordinance-series">Series:</label>
                <input 
                  className='CreateOrdinances__Input'
                  type="number"
                  name='series'
                  id='ordinance-series'
                  placeholder="e.g. '2021'"
                  onChange={handleChange}
                />
                <label htmlFor="ordinance-title">Title:</label>
                <input 
                  className='CreateOrdinances__Input'
                  type="text"
                  name='title'
                  id='ordinance-title'
                  placeholder="e.g. 'First Amendment'"
                  onChange={handleChange}
                />
                <label htmlFor="ordinance-title">Author:</label>
                <select 
                  name="author" 
                  id="author"
                  className='CreateOrdinances__Input'
                  onChange={handleChange}>
                   {members && members.map((member, i) => (
                    <option
                      key={i}
                      value={member.name}
                    >
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="CreateOrdinances__Content">
                { uploading === true ? (
                  <>
                    <label htmlFor="file">File:
                      <input
                        className='CreateOrdinances__File'
                        type="file"
                        name='file'
                        id='file'
                        onChange={handleFileChange}
                      />
                    </label>
                  </>) : (
                    <button 
                      className='CreateOrdinances__Button' 
                      onClick={() => setUploading(true)} >
                        Submit the PDF Ordinance File
                    </button>
                  ) }
              </div>
              <button className='CreateOrdinances__Button' type='submit'>Submit</button>
            </form>
            {showAlert && <div className="CreateOrdinances__Alert">{message}</div>}
        </div>
      </Modal>
    </div>
  )
}

export default CreateOrdinances