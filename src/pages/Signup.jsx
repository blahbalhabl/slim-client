import { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import Loader from "../components/Loader";
import Modal from "../components/Modal";
import Alert from "../components/Alert";
import { icons } from "../utils/Icons";
import { roles } from "../utils/userRoles";
import '../styles/Signup.css'

const Signup = () => {
  const role = Object.entries(roles.role);
  const levels = Object.entries(roles.level);

  const axiosPrivate = useAxiosPrivate();
  const [otpAuthUrl, setOtpAuthUrl] = useState();
  const [createAccount, setCreateAccount] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isInputEditing, setInputEditing] = useState(false);
  const [users, setUsers] = useState([]);
  const [serverMessage, setServerMessage] = useState('');
  const [inputs, setInputs] = useState({
    email: "",
    username: "",
    role: "",
    level: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = (user) => {
    setIsModalOpen(true);
  }
  const closeModal = () => setIsModalOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => {
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Send Request to Server API
    userSignup();
    setIsLoading(true); 
  }

  const userSignup = async () => {
    try {
      const userData = {
        email: inputs.email,
        username: inputs.username,
        role: inputs.role,
        level: inputs.level,
      };

      const res = await axiosPrivate.post('/signup', userData, {
        headers: {'Content-Type': 'application/json'}
      });

      if (res.status === 200) {
        const defaultPassword = res.data.defaultPassword;
        setOtpAuthUrl(res.data.qrCode);

        const emailData = {
          email: inputs.email,
          subject: `SLIM Account Creation`,
          html: `
            <h1>Welcome to SLIM.</h1> 
            <h3>Here are your account details:</h3>
            </br>
            </br>
            <p>email: ${inputs.email}</p>
            <p>password: ${defaultPassword}</p>
            <p>Enter this code to Google Authenticator:</p>
            <p>${res.data.secret}</p>
            <p>Make sure once logged in to change password right away.</p>`,
        };

        await axiosPrivate.post('/send-email', emailData, {
          headers: {'Content-Type': 'application/json'}
        }).catch((err) => {
          console.log('Error sending email:', err);
        });
      }
    } catch (err) {
      console.log('Error:', err);
    }
  };

  const sendRequest = async () => {
   try {
    setIsLoading(true);
    const users = await axiosPrivate.get('/users');
    const data = await users.data.users;
    return data;
   } catch (err) {
    console.error(err);
   }
  };

  const handleEditing = (e, user, action) => {
    e.preventDefault()
    if( action === 'edit') {
      user === isInputEditing ? setInputEditing(!isInputEditing) : setInputEditing(user);
    } else {
    user === isEditing ? (
      setIsEditing(!isEditing), 
      setInputEditing(!isInputEditing),
      setInputs({
        username: '',
        role: '',
        level: '',
      })
      ) : setIsEditing(user);
    }
  };

const handleUpdateUser = async (e, user) => {
  try {
    e.preventDefault()
    const res = await axiosPrivate.put('/update-user', {id: user._id, inputs}, {
      headers: {'Content-Type': 'application/json'}
    })
    setServerMessage(res.data.message);
  } catch (err) {
    console.error(err);
  }
}

  const renderUsers = () => {
    return users.map((user, i) => {
      let color;
      switch(user.role){
        case 'Superadmin':
          color = 'red';
          break;
        case 'Admin':
          color = 'blue';
          break;
        case 'User':
          color = 'green';
          break;
        default:
          color = 'black';
      }
      // Chek if Any Input Values has changed
      const isUsernameChanged = inputs.username !== user.username && inputs.username !== '';
      const isRoleChanged = inputs.role !== user.role && inputs.role !== '';
      const isLevelChanged = inputs.level !== user.level && inputs.level !== '';
      const isAnyInputChange = isUsernameChanged || isRoleChanged || isLevelChanged;
      // Check if the user is editing and should be the button disabled or not
      const isEditingThisUser = user === isEditing;
      const isButtonDisabled = isEditingThisUser && isAnyInputChange;
    
      return (
        <tr key={i}> 
          <td>
            { user === isInputEditing ? (
            <select 
              name="level" 
              id="level"
              onChange={handleChange}
              >
              {levels.map(([key, value]) => (
                <option key={key} value={value}>
                  {value}
                </option>
              ))}
            </select>
            ) : (user.level)}
          </td>
          <td>
            { user === isInputEditing ? (
              <input 
                type="text"
                name="username"
                id="username"
                onChange={handleChange}
                placeholder={user.username}
              />
            ) : (user.username)}
          </td>
          <td
            style={{ fontWeight: 'bold', color }}
          >
            {user === isInputEditing ? (
              <select 
                name="role" 
                id="role"
                onChange={handleChange}
                >
                  {role.map(([key, value]) => (
                    <option 
                      key={key} 
                      value={value}
                    >
                      {value}
                    </option>
                  ))}
              </select>
            ) : (
              user.role
            )}
          </td>
          <td style={{display: 'flex', justifyContent: 'flex-end'}}>
            { isEditingThisUser && (
              <div>
                <button
                  onClick={(e) => handleEditing(e, user, 'edit')}
                >
                  Edit
                </button>
                <button
                >
                  Delete
                </button>
                <button 
                  disabled={!isButtonDisabled}
                  onClick={(e) => {handleUpdateUser(e, user), handleEditing(e, user)}}
                >
                  Update
                </button>
              </div>
            )}
            <button
              className="Signup__Users__Table__Button"
              onClick={(e) => handleEditing(e, user, 'actions')}
            >
              <FontAwesomeIcon icon={icons.ellipsis} />
            </button>
          </td>
        </tr>
      );
    });
  };

  useEffect(() => {
    document.title = 'SLIM | Users';
    sendRequest()
    .then((data) => setUsers(data));
    setIsLoading(false);
  }, [isLoading, serverMessage])

  if(isLoading) return (<Loader />);

  return (
    <div className="Signup">
      <div className="Signup__Users">
        <div className="Signup__Users__Title">
          <h3>SLIM USERS</h3>
          <button
            className="Signup__Users__Button"
            onClick={() => setCreateAccount(true)}>
              <FontAwesomeIcon icon={icons.plus}/> Create New Account
          </button>
        </div>
        <table className="Signup__Users__Table">
          <thead>
            <tr>
              <th>Level</th>
              <th>Username</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {renderUsers()}
          </tbody>
        </table>
      </div>
      {createAccount && (
      <div className="Signup__Create__Account">
        <form onSubmit={handleSubmit}> 
          <div className="Signup__Container">
            <h4>Create New Account</h4>
            <label htmlFor="email">Email:
              <input
                className="Signup__Input"
                type="email"
                name="email"
                value={inputs.email}
                onChange={handleChange}
                placeholder="eg. xxxxxxxx@gmail.com" 
                required
                />
            </label>
            <label htmlFor="username">Name:
              <input
                className="Signup__Input"
                type="text"
                name="username"
                value={inputs.username}
                onChange={handleChange}
                placeholder="eg. John Doe L. Smith"
                required
              />
            </label>
            <label htmlFor="role">Access Level:</label>
            <select
              className="Signup__Input__Select"
              name="role" 
              id="role"
              onChange={handleChange}>
                <option value="">Select Access Level</option>
                <option value="Admin">Admin</option>
                <option value="Superadmin">Superadmin</option>
                <option value="User">User</option>
            </select>
            <label htmlFor="level">Divison Level:</label>
            <select
              className="Signup__Input__Select"
              name="level" 
              id="level"
              onChange={handleChange}>
                <option value="">Select Level</option>
                <option value="BARANGAY">Barangay</option>
                <option value="DILG">DILG</option>
                <option value="LGU">LGU</option>
            </select>
            <div className="Signup__Button__Container">
              <button className="Signup__Button"
                type="submit" 
                > Create Account
              </button>
              <button 
                className="Signup__Button__Cancel"
                onClick={() => {
                  setCreateAccount(false);
                  setInputs('');
                }}
                > Cancel
              </button>
            </div>
          </div>
        </form>
        {otpAuthUrl && (
          <div className="QRCodeContainer">
            <h3>Scan this QR code with your authenticator app</h3>
            <img src={otpAuthUrl} alt="QR Code for 2FA" />
          </div>
        )}
      </div>
      )}
      <Modal 
        isOpen={isModalOpen} 
        closeModal={closeModal}
      >
        <div className="Modal__Container">
          <h3>Confirm Action?</h3>
          <div className="Modal__Container__Details">
            <button>Confirm</button>
            <button>Cancel</button>
          </div>
        </div>
      </Modal>
      <Alert message={serverMessage} onClose={() => setServerMessage('')}/>
    </div>
  );
};

export default Signup;
