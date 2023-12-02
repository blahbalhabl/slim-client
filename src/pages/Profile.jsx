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
  const [isEditing, setIsEditing] = useState({});
  const [otpAuthUrl, setOtpAuthUrl] = useState({
    url: null,
    secret: null,
  });
  const inputType = visible ? "text" : "password";
  const toggleIcon = visible ? <FontAwesomeIcon icon={icons.eye} /> : <FontAwesomeIcon icon={icons.eyeslash} />;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const [otpModal, setOtpModal] = useState(false);
  const openOtp = () => setOtpModal(true);
  const closeOtp = () => setOtpModal(false);

  const [tfaModal, setTfaModal] = useState(false);
  const openTfa = () => setTfaModal(true);
  const closeTfa = () => {
    setTfaModal(false);
    setInputs({otp: null});
    setOtpAuthUrl({url: null, secret: null});
  }

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
      // Send an API request to update the user's data
      const res = await axiosPrivate.put('/enable-2fa');

      setIsChecked(true); // Update the state locally
      setServerMessage(res.data.message);
      setSeverity(res.status);
    } catch (error) {
      setServerMessage('Error updating user data:', error);
      setSeverity(error.status);
    }
  };

  const handleDisableAuth = async () => {
    try {
      if (inputs.otp) {
        const res = await axiosPrivate.put('/disable-2fa', { otp: inputs.otp }, {
          headers: {'Content-Type': 'application/json'}
        });

        setIsChecked(false);
        setServerMessage(res.data.message);
        setSeverity(res.status);
        closeOtp();
      }
    } catch (err) {
      setServerMessage('Error updating user data:', err);
      setSeverity(err.status);
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

  const newTfa = async () => {
    try {
      const res = await axiosPrivate.get(`/new-tfa?email=${auth.email}`);
      setOtpAuthUrl({url: res.data.qrCode, secret: res.data.secret});
    } catch (err) {
      setServerMessage(err.response.data.message);
      setSeverity(err.response.status);
    }
  };

  const handleUpdateAuth = async () => {
    try {
      const res = await axiosPrivate.put('/update-2fa', { otp: inputs.otp, secret: otpAuthUrl.secret }, {
        headers: {'Content-Type': 'application/json'}
      });

      setIsChecked(true);
      setServerMessage(res.data.message);
      setSeverity(res.status);
      closeTfa();
    } catch(err) {
      setServerMessage(err.response.data.message);
      setSeverity(err.response.status);
    }
  }

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
    const fetchData = async () => {
      try {
        await newTfa();
      } catch (err) {
        console.log(err);
      }
    };

    tfaModal && fetchData();
  }, [tfaModal]);

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
          <div 
            className="Profile__Avatar" 
            onMouseEnter={handleAvatarUpdate}
            onMouseLeave={handleAvatarLeave}>
            {user.avatar ? (
                <img className="Profile__Avatar__Img" src={imageSrc} />
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
          <ul className="Profile__Nav">
            <li>Profile</li>
            <li>Security</li>
          </ul>
        </div>
        <div className="Profile__Container__Card">
          <div className="Profile__Card__Right">
          <h2>Profile</h2>
          <div className="Profile__Info">
            <div className="Profile__Info__Item">
              <p>Contact Email</p>
              <input
                className={`Profile__Info__Input ${isEditing.email ? '' : 'disabled'}`}
                name="email"
                placeholder={auth.email}
                onChange={handleChange}
                disabled={!isEditing.email}
                type="text" />
                { isEditing.email ? (
                  <button 
                    className="Profile__Info__Cancel__Button"
                    onClick={() => {setIsEditing({email: false}); setInputs({})}}>
                    Cancel
                  </button>
                ) : (
                  <button
                    className="Profile__Info__Edit__Button"
                    onClick={() => setIsEditing({email: true})}>
                    Edit
                  </button>
                )}
            </div>
            <div className="Profile__Info__Item">
              <p>Full Name</p>
              <input
                className={`Profile__Info__Input`}
                placeholder={auth.username}
                onChange={handleChange}
                type="text" />
            </div>
            {auth?.isMember && (
              <div className="Profile__Info__Item">
                <p>Position</p>
                <p>{auth?.position}</p>
              </div>
            )}
            <div className="Profile__Info__Item">
              <p>Role</p>
              <p>{auth.role}</p>
            </div>
            <div className="Profile__Info__Item">
              <p>Access Level</p>
              <p>{auth.level}</p>
            </div>
            <div className="Profile__Card__Info">
              <p>{browserName},{browserVersion}</p>
              <p>{osName},{osVersion}</p>
            </div>
          </div>
          </div>
          <div className="Profile__Card__Right">
            <h2>Security</h2>
            <div className="Profile__Items">
              <h4>Password</h4>
              <button 
                className="Profile__Card__Right__Button"
                onClick={openModal}>
                  Change Password
              </button>
            </div>
            <div className="Profile__Google__Auth">
              <div className="Profile__Google__Auth__Con">
                <p style={{fontWeight: '500'}}>Two-Factor Authentication</p>
                <p>SLIM uses time-based one-time passcodes (TOTP) that are compliant with all major authenticator apps including 1Password, Authy, and Google Authenticator.</p>
              </div>
              <div className="Profile__Google__Auth__Toggle">
                  <p>{isChecked ? 'Enabled' : 'Disabled'}</p>
                  <Switch
                  checked={isChecked}
                  onChange={isChecked ? openOtp : handleCheckboxChange}
                  />
              </div>
            </div>
            <div className="Profile__Authenticator__Container">
              <div className='Profile__Authenticator__Item'>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="w-10 h-10"><rect x="8" y="3" width="24" height="34" rx="4" fill="#F2F2FE" stroke="#D6D6FF" stroke-width="2"></rect><circle cx="14" cy="18.5" r="1.5" fill="#5A50EB"></circle><circle cx="20" cy="18.5" r="1.5" fill="#5A50EB"></circle><circle cx="26" cy="18.5" r="1.5" fill="#5A50EB"></circle><path d="M14 3H25V3C25 4.10457 24.1046 5 23 5H16C14.8954 5 14 4.10457 14 3V3Z" fill="#D6D6FF"></path></svg>
                <div>
                  <p style={{fontWeight: '500'}}>Authenticator App</p>
                  <p>Use your authenticator app to get two-factor authentication codes.</p>
                </div>
              </div>
              <button
                className='Profile__Card__Right__Button'
                onClick={openTfa}
              >
                Update Method
              </button>
            </div>
          </div>
          {/* <div className="Profile__Card__Right">
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
          </div> */}
        </div>
        <Modal 
          isOpen={isModalOpen}
          closeModal={closeModal}
        >
          <div className="Profile__Modal">
            <h2>Change Password</h2>
            <form className="Profile__Modal__Form">
              <TextField
                error={error}
                type={inputType}
                name="oldpass"
                label="Old Password" 
                variant="outlined"
                margin="dense"
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
                margin="dense"
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
                margin="dense"
                onChange={handleChange}
                helperText={newPassErr && 'Must be the same with New Password.'}
                required
              />
              {/* <span
                className="Profile__Password__Toggle"
                onClick={() => setVisible(visible => !visible)}>
                  {toggleIcon}
              </span> */}
              <div className='Profile__Modal__Button__Group'>
                <button
                  className="Profile__Modal__Cancel__Button"
                  onClick={closeModal}>
                    Cancel
                </button>
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
              </div>
            </form>
          </div>
        </Modal>
        <Modal 
          isOpen={otpModal}
          closeModal={closeOtp}
        >
          <div className='Profile__Otp__Modal__Container'>
            <span className="Profile__Otp__Modal__Title">
              <FontAwesomeIcon className="Profile__Otp__Modal__Icon" icon={icons.danger} />
              <h2>Disable Two-Factor Authentication</h2>
            </span>
            <div className="Profile__Otp__Modal__Text">
              <p>Two-factor authentication significantly increases the security of your account and reduces the risk of unauthorized logins.</p>
              <p>Are you sure you want to disable it?</p>
            </div>
            <div className="Profile__Otp__Modal__Input">
              <TextField
                type='number'
                name="otp"
                label="Authentication Code"
                variant="outlined"
                margin="dense"
                fullWidth
                onChange={handleChange}
                helperText='e.g. 000000'
              />
            </div>
            <div className="Profile__Otp__Modal__Buttons">
              <button
                className="Profile__Modal__Cancel__Button"
                onClick={closeOtp}>
                Cancel
              </button>
              <button
                className="Profile__Otp__Modal__Disable__Button"
                onClick={handleDisableAuth}>
                Disable
              </button>
            </div>
          </div>
        </Modal>
        <Modal 
          isOpen={tfaModal}
          closeModal={closeTfa}
        >
          <div className='Profile__Otp__Modal__Container'>
            <span className="Profile__Otp__Modal__Title">
              <h2>Update Two-Factor Authentication</h2>
            </span>
            <div className="Profile__Otp__Modal__Text">
              <p>Scan the QR code in your authenticator app and enter the authentication code below.</p>
            </div>
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              <img src={otpAuthUrl.url} alt={otpAuthUrl.secret} />
            </div>
            <div className="Profile__Otp__Modal__Input">
              <TextField
                type='number'
                name="otp"
                label="Authentication Code"
                variant="outlined"
                margin="dense"
                fullWidth
                onChange={handleChange}
                helperText='e.g. 000000'
              />
            </div>
            <div className="Profile__Otp__Modal__Buttons">
              <button
                className="Profile__Modal__Cancel__Button"
                onClick={closeTfa}>
                Cancel
              </button>
              <button
                className="Profile__Modal__Button"
                onClick={handleUpdateAuth}>
                Update 2FA
              </button>
            </div>
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