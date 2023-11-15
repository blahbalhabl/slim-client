import Modal from './Modal';
import { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import Alert from './Alert';
import { roles } from '../utils/userRoles';
import { 
  TextField,
  FormControl, 
  InputLabel, 
  MenuItem, 
  Select } from '@mui/material';
import '../styles/CreateOrdinances.css'

const CreateOrdinances = () => {
  const role = roles.role;
  const level = roles.level;
  const { auth, setReload } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const [members, setMembers ] = useState(null);
  const [severity, setSeverity] = useState(null);
  const [serverMessage, setServerMessage] = useState(null);
  const [coAuthor, setCoAuthor] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [disabled, setDisabled] = useState(true);
  const [inputErr, setInputErr] = useState({
    series: false,
    number: false,
  });
  const [inputs, setInputs] = useState({
    author: '',
    coAuthor: '',
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
    setFileName(e.target.files[0].name);
    const file = e.target.files[0];
    setFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await uploadFile()
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
      formData.append('coAuthor', inputs.coAuthor);
      formData.append('file', file);
      const res = await axiosPrivate.post('/upload/ordinance/draft?type=ordinances', formData, {
        headers: {'Content-Type': 'multipart/form-data'}
      }).then(() => {
          setServerMessage(res.data.message);
          setSeverity(res.status);
        })
        .finally(() => setReload(true));

    } catch (err) {
      console.error(err);
    }
  };

  const addCoAuthor = (e) => {
    e.preventDefault();
    setCoAuthor(!coAuthor);
  
    if (!coAuthor) {
      setInputs((inputs) => ({ ...inputs, coAuthor: '' }));
    }
  };

  useEffect(() => {
    const currDate = new Date();
    const year = currDate.getFullYear();
    setInputErr((prevInputErr) => ({
      ...prevInputErr,
      number: inputs.number >= 100,
      series: inputs.series > year,
    }));
    const isAnyInputEmpty = (
      Object.keys(inputs)
        .filter((key) => key !== 'coAuthor')
        .some((key) => inputs[key] === '') ||
      !file
    );
    setDisabled(isAnyInputEmpty);
  }, [inputs, file]);

  useEffect(() => {
    getAuthors()
    .then(({ members }) => {
      setMembers(members);
    })
  }, []);

  return (
    <div className="CreateOrdinances">
      <h1>List of Ordinances</h1>
      {(auth.level !== level.dlg && auth.role === role.adn) && (
        <button className="CreateOrdinances__Button" onClick={openModal}>New Ordinance</button>
      )}
      <Modal 
        isOpen={isModalOpen} 
        closeModal={closeModal}
      >
        <div className='CreateOrdinances__Container'>
          <h3>{auth.level === level.lgu ? 'Municipal' : 'Barangay' } Level Ordinance</h3>
            <form onSubmit={handleSubmit}>
              <div className='CreateOrdinances__Title'>
                <TextField
                  error={inputErr.number}
                  className='CreateOrdinances__Input'
                  name='number'
                  label="Number"
                  margin='dense'
                  type='number'
                  required
                  helperText={inputErr.number && `e.g. 01`}
                  onChange={handleChange}
                  variant="outlined" />
                <TextField
                  error={inputErr.series}
                  className='CreateOrdinances__Input'
                  name='series' 
                  label="Series"
                  type='number'
                  margin='dense'
                  required
                  helperText={inputErr.series && `e.g. 2021`}
                  onChange={handleChange}
                  variant="outlined" />
                <TextField
                  className='CreateOrdinances__Input'
                  name='title' 
                  label="Title"
                  margin='dense'
                  required
                  onChange={handleChange}
                  variant="outlined" />
                <div className='CreateOrdinances__Select'>
                  <FormControl fullWidth>
                  <InputLabel id="author-id">Author</InputLabel>
                  <Select
                    labelId="author-id"
                    name='author'
                    id="author-id"
                    label="Author"
                    margin='dense'
                    required
                    value={inputs.author}
                    onChange={handleChange}
                  >
                    {members && members.map((member, i) => (
                      <MenuItem
                        key={i}
                        value={member.name}
                      >
                        {member.name}
                      </MenuItem>
                    ))}
                  </Select>
                  </FormControl>
                  <button
                    className='CreateOrdinances__Author'
                    disabled={inputs.author === ''}
                    onClick={(e) => addCoAuthor(e)}>
                      {coAuthor ? '-' : '+'}
                  </button>
                </div>
                {/* dynamically add input for co-author if applicable */}
                {coAuthor && (
                  <div className='CreateOrdinances__Select'>
                    <FormControl fullWidth>
                    <InputLabel id="co-author-id">Co-Author</InputLabel>
                    <Select
                      labelId="co-author-id"
                      name='coAuthor'
                      id="co-author-id"
                      label="Co-Author"
                      margin='dense'
                      value={inputs.coAuthor}
                      onChange={handleChange}
                    >
                      { members && members.filter((member) => member.name !== inputs.author).map((member, i) => (
                        <MenuItem key={i} value={member.name}>
                          {member.name}
                        </MenuItem>
                      ))}
                    </Select>
                    </FormControl>
                  </div>
                )}
              </div>
              <div className="CreateOrdinances__Content">
                <label 
                  className='CreateOrdinances__File__Button' 
                  htmlFor="file"
                >
                  Upload PDF File{fileName && (`:  ${fileName}`)}
                  <input
                    hidden
                    className='CreateOrdinances__File'
                    type="file"
                    name='file'
                    id='file'
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              <button 
                className={`CreateOrdinances__Submit__Button`} 
                onClick={handleSubmit}
                style={{ backgroundColor: disabled ? '#CCCCCC' : 'red' }}
                disabled={disabled}>
                  Upload
              </button>
            </form>
        </div>
      </Modal>
      <Alert severity={severity} message={serverMessage} onClose={() => setServerMessage('')}/>
    </div>
  )
}

export default CreateOrdinances