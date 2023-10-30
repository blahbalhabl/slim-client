import { useEffect, useState } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Switch, TextField } from "@mui/material";
import { icons } from '../utils/Icons'
import Modal from '../components/Modal';
import Loader from "../components/Loader";
import useAuth from "../hooks/useAuth";
import Alert from "../components/Alert";
import { 
  deviceDetect, 
  browserName, 
  browserVersion,  
  osName, 
  osVersion } from 'react-device-detect';

import '../styles/Profile.css'

const UserProfile = () => {
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth()
  const [user, setUser] = useState();
  const [avatar, setAvatar] = useState();
  const [isChecked, setIsChecked] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [audit, setAudit] = useState([]);
  const [serverMessage, setServerMessage] = useState('');
  const [severity, setSeverity] = useState('');
  const [disabled, setDisabled] = useState(true);
  const [inputs, setInputs] = useState({});
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState(false);
  const [newPassErr, setNewPassErr] = useState(false);
  const inputType = visible ? "text" : "password";
  const toggleIcon = visible ? <FontAwesomeIcon icon={icons.eye} /> : <FontAwesomeIcon icon={icons.eyeslash} />;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const sendRequest = async () => {
    try {
      const res = await axiosPrivate.get('/user');
      const audit = await axiosPrivate.get(`/profile-audit/${auth.id}`);
      setIsChecked(res.data.otp);
      setAudit(audit.data);

      return res.data;
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

  const handleCheckboxChange = async () => {
    try {
      const is2faOn = !isChecked;

      // Send an API request to update the user's data
      const res = await axiosPrivate.put('/update-2fa', { is2faOn }, {
        headers: {'Content-Type': 'application/json'}
      });
      if (res.status === 200) {
        setIsChecked(is2faOn); // Update the state locally
        setServerMessage(res.data.message);
        setSeverity(res.status);
      }
    } catch (error) {
      setServerMessage('Error updating user data:', error);
      setSeverity(error.status);
    }
  };

  const handleAvatarChange = (e) => {
    const photo = e.target.files[0];
    setAvatar(photo);
    setDisabled(false);
  };

  const formData = new FormData();
  const handleUpload = () => {
    formData.append('avatar', avatar);
    uploadAvatar();
  };

  const uploadAvatar = async () => {
    try {
      // Upload the new avatar
      await axiosPrivate.post('/avatar-upload', formData, {
        headers: {'Content-Type': 'multipart/form-data'}
      })

      // Delete the previous avatar if it exists
      if (user.avatar) {
        await axiosPrivate.delete(`/delete-avatar/${user.avatar}`);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleChangePass = async (e) => {
    e.preventDefault();
    try {
      const passData = {
        oldpass: inputs.oldpass,
        newpass: inputs.newpass,
        confirm: inputs.confirm,
      };

      const res = await axiosPrivate.post('/change-password', passData, {
        headers: {"Content-Type": "application/json"}
      })
      if (res.status === 200) {
        setServerMessage(res.data.message);
        setSeverity(res.status);
      };
    } catch (err) {
      const res = err.response;
      setServerMessage(res.data.message);
      setSeverity(res.status);
      setError(true);
    }
  }

  const handleAvatarUpdate = () => {
    setIsButtonVisible(true);
  };
  
  const handleAvatarLeave = () => {
    setIsButtonVisible(false);
  };

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  useEffect(() => {
    document.title = 'SLIM | Profile';
    sendRequest()
    .then((data) => {
      setUser(data);
    })
  },[])

  useEffect(() => {
    if (inputs.newpass !== inputs.confirm) { 
      return setNewPassErr(true);
    }
    setNewPassErr(false);
  }, [inputs.confirm, inputs.newpass]);

  useEffect(() => {
    if (auth) {
      // Fetch the image using Axios when auth data is available
      axiosPrivate
        .get(`/uploads/images/${auth.avatar}`, {
          responseType: 'arraybuffer', // Specify the response type as arraybuffer
        })
        .then((response) => {
          const base64Image = btoa(
            new Uint8Array(response.data).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ''
            )
          );
          const dataURL = `data:${response.headers['content-type']};base64,${base64Image}`;
          setImageSrc(dataURL);
        })
        .catch((error) => {
          console.error('Error fetching image:', error);
        });
    }
  }, [auth]);
  
  return (
    <div className="Profile">
      { user ? (
      <div className="Profile__Container">
        <div className="Profile__Card">
          <div className="Profile__Avatar" onMouseEnter={handleAvatarUpdate}
            onMouseLeave={handleAvatarLeave}>
            {user.avatar ? (
              <>
                <img className="Profile__Avatar__Img" src={imageSrc} />
              </>
            ) : (
              <FontAwesomeIcon className="Profile__Avatar__Img" icon={icons.user} />
            )}
            {isButtonVisible && 
                <div className="Profile__Avatar__Change">
                  <label htmlFor="avatar-input">Upload Avatar</label>
                  <input
                    type="file" 
                    name="avatar-input" 
                    id="avatar-input" 
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                  <button
                    className="Profile__Avatar__Button"
                    onClick={handleUpload}
                    disabled={disabled}>
                      Upload
                  </button>
                </div>
                }
          </div>
          <div className="Profile__Information">
            <h2>{user.name}</h2>
            <p>{user.role}</p>
          </div>
        </div>
        <div className="Profile__Container__Card">
          <div className="Profile__Card__Right">
            <h2>Security</h2>
            <button 
              className="Profile__Card__Right__Button"
              onClick={openModal}>
                Change Password
            </button>
            <div className="Profile__Google__Auth">
              <h3>Enable Two Factor Authentication</h3>
              <div>
                <label>Google Authenticator</label>
                <Switch
                checked={isChecked}
                onChange={handleCheckboxChange}
                />
              </div>
              
            </div>
            <div className="Profile__Card__Info">
              {/* <p>{browserName}</p>
              <p>{browserVersion}</p>
              <p>{osName}</p>
              <p>{osVersion}</p> */}
            </div>
          </div>
          <div className="Profile__Card__Right">
            <h2>Actions</h2>
            <div className="Profile__Table__Container">
            <table className="Profile__Audit__Table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {audit && audit.map((event, i) => {
                  return (
                    <tr key={i}>
                      <td>{event.type}</td>
                      <td>{formatDate(event.createdAt)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            </div>
          </div>
        </div>
        <Modal 
          isOpen={isModalOpen}
          closeModal={closeModal}
        >
          <div className="Profile__Modal">
            <form className="Profile__Modal__Form">
              <TextField
                error={error}
                type={inputType}
                name="oldpass"
                label="Old Password" 
                variant="outlined"
                onChange={handleChange}
                helperText={error && 'Incorrect Password.'}
                required
              />
              <TextField
                error={error}
                type={inputType}
                name="newpass"
                label="New Password"
                variant="outlined"
                onChange={handleChange}
                helperText={error && 'Must contain atleast 8 characters.'}
                required
              />
              <TextField
                error={newPassErr}
                type={inputType}
                name="confirm"
                label="Confirm Password"
                variant="outlined"
                onChange={handleChange}
                helperText={newPassErr && 'Must be the same with New Password.'}
                required
              />
              {/* <span
                className="Profile__Password__Toggle"
                onClick={() => setVisible(visible => !visible)}>
                  {toggleIcon}
              </span> */}
              <button
                className="Profile__Modal__Button"
                onClick={handleChangePass}
                disabled={
                  ( inputs.oldpass == undefined &&
                    inputs.newpass == undefined &&
                    inputs.confirm == undefined ) || newPassErr
                }>
                  Change Password
              </button>
            </form>
          </div>
        </Modal>
      </div>
    ) : (
        <Loader />
      )}
      <Alert severity={severity} message={serverMessage} onClose={() => setServerMessage('')}/>
    </div>
  );
};

export default UserProfile;