import { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import Loader from "../components/Loader";
import Modal from "../components/Modal";
import { icons } from "../utils/Icons";
import '../styles/Signup.css'

const Signup = () => {
  const axiosPrivate = useAxiosPrivate();
  const [otpAuthUrl, setOtpAuthUrl] = useState();
  const [createAccount, setCreateAccount] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState({});
  const [inputs, setInputs] = useState({
    email: "",
    username: "",
    role: "",
    level: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = (user) => {
    setIsModalOpen(true);
    setUser(user);
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
  }

  useEffect(() => {
    document.title = 'SLIM | Users';
    sendRequest()
    .then((data) => setUsers(data));
    setIsLoading(false);
  }, [isLoading])

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
              <th></th>
              <th>Division</th>
              <th>Name</th>
              <th>Access Level</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => {
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
              return (
                <tr 
                  key={i}
                  onClick={() => openModal(user)}>
                  <td></td>
                  <td>{user.level}</td>
                  <td>{user.username}</td>
                  <td 
                    style={{ fontWeight: 'bold', color }}>
                      {user.role}
                  </td>
                </tr>
              );
            })}
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
          <h3>Account Details</h3>
          <div className="Modal__Container__Details">
            <p>Name: {user.username}</p>
            <p>Access Level: {user.role}</p>
            <p>Division: {user.level}</p>
          </div>
          <div className="Modal__Container__Buttons">
            <button>Edit</button>
            <button>Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Signup;
