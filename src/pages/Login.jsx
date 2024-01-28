import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { icons } from "../utils/Icons";
import axios from "../api/axios";
import Alert from "../components/Alert";
import OtpInput from 'react-otp-input';
import { TextField } from '@mui/material';
import '../styles/Login.css'

const Login = () => {
  const [otp, setOtp] = useState();
  const [visible, setVisible] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [severity, setSeverity] = useState();
  const [emailError, setEmailError] = useState(false);
  const [passError, setPassError] = useState(false);
  const [serverMessage, setServerMessage] = useState('');
  const [initialSetup, setInitialSetup] = useState(false);
  const [emailConfirmed, setEmailConfirmed] = useState(true);
  const inputType = visible ? "text" : "password";
  const toggleIcon = visible ? <FontAwesomeIcon icon={icons.eye} /> : <FontAwesomeIcon icon={icons.eyeslash} />;

  const { setAuth, persist } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from.pathname || '/';

  const [inputs, setInputs] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => {
      return { ...prev, [name]: value };
    });
  };

  const userLogin = async (e) => {
    e.preventDefault();
    try {
      // Append all Input Data into useData object.
      const userData = {
        email: inputs.email,
        password: inputs.password,
        otp: otpValue || null,
      };
      // Send Request to the Server API.
      const res = await axios.post('/login', userData, {
        headers: {"Content-Type": "application/json"},
      });
      // Await Server Response and save it in an object.
      const data = await res.data;
      // Authenticate or Handle Errors depending on the response status code.
      switch(res.status) {
        case 200:
          setAuth(data);
          navigate(from, { replace: true });
          break;
        case 201:
          setOtp(true);
          break;
        default:
          setServerMessage(data.message);
          setSeverity(res.status);
      };
      // If user uses OTP show OTP input box
      if (otp) {
        // If otp returned as true
        const res = await axios.post('/verify', userData, {
          headers: {"Content-Type": "application/json"},
        });
        if (res.status === 200) {
          const data = await res.data;
          setAuth(data);
          navigate(from, { replace: true });
          return data;
        } else {
          setServerMessage(data.message);
          setSeverity(res.status);
        };
      };
    } catch (err) {
      // Handle Error response statuses accccordingly.
      switch(err?.response?.status) {
        case 400:
          setEmailError(true);
          break;
        case 401:
          setPassError(true);
          break;
        case 402:
          setServerMessage(err.response.data.message);
          setSeverity(err.response.status);
          break;
        default:
          null;
      };
    };
  };

  const checkInitialUser = async () => {
    try {
      const res = await axios.get('/initial-user');
      if (res.status === 200) {
        setInitialSetup(true);
      };
    } catch (err) {
      console.log(err);
    };
  };

  const createFirstUser = async (e) => {
    e.preventDefault();
    try {
      const email = {
        email: inputs.email,
      };
      const res = await axios.post('/create-initial-user', email, {
        headers: {"Content-Type": "application/json"},
      });
      if (res.status === 201) {
        setInitialSetup(false);
        setServerMessage(res.data.message);
        setSeverity(res.status);
      };
    } catch (err) {
      setServerMessage(err.response.data.message);
      setSeverity(err.response.status);
    };
  };

  const sendEmail = async (e) => {
    try {
      e.preventDefault();
      const email = {
        email: inputs.email,
      };
      const res = await axios.post('/create-initial-user', email, {
        headers: {"Content-Type": "application/json"},
      });
      if (res.status === 200) {
        // setEmailConfirmed(true);
        setServerMessage(res.data.message);
        setSeverity(res.status);

        const defaultPassword = res.data.defaultPassword;

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
            <img src="${res.data.qrCode}" alt="QR Code for 2FA" />
            <p>${res.data.secret}</p>
            <p>Make sure once logged in to change password right away.</p>`,
        };

        await axios.post('/new-user-creds', emailData, {
          headers: {'Content-Type': 'application/json'}
        }).catch((err) => {
          console.log('Error sending email:', err);
        });
      };
    } catch (err) {
      setServerMessage(err.response.data.message);
      setSeverity(err.response.status);
    }
  };

  useEffect(() => {
    localStorage.setItem('persist', persist);
    document.title = 'SLIM | Login';
    checkInitialUser();
  },[persist]);

  return (
    <div className="Login">
      {initialSetup ? (
      <div className="Login__Container">
        <h4>Initial Setup</h4>
        <p>Create a Super admin Account to start</p>
        <form style={{width: '100%'}} onSubmit={createFirstUser}>
          <TextField
            error={emailError}
            className="Login__Input" 
            id="email"
            name="email"
            label="Email Address" 
            variant="outlined"
            margin="normal"
            helperText={emailError && 'Invalid Email.'}
            onChange={handleChange}
            required
          />
          <button
            className="Login__Button"
            type="submit"
            onClick={emailConfirmed ? createFirstUser : sendEmail}
            >
            {emailConfirmed ? 'Create Account' : 'Send Email'}
          </button>
        </form>
      </div>) : (
      <form onSubmit={userLogin}>
        <div className="Login__Container">
          <h4>Welcome to SLIM: Bacolor</h4>
          <p>Sign in to continue</p>
          <TextField
            error={emailError}
            className="Login__Input" 
            id="email"
            name="email"
            label="Email Address" 
            variant="outlined"
            margin="normal"
            helperText={emailError && 'Invalid Email.'}
            onChange={handleChange}
            required
          />
          <span className="Login__Input__Password">
            <TextField
              error={passError}
              className="Login__Input" 
              id="password"
              name="password"
              label="Password" 
              variant="outlined"
              margin="normal"
              helperText={passError && 'Incrrect Password.'}
              type={inputType}
              onChange={handleChange}
              required
            />
            <span
              className="Login__Password__Toggle"
              onClick={() => setVisible(visible => !visible)}>
                {toggleIcon}
            </span>
          </span>
          { otp && (
            <label 
              htmlFor="otp"
              className="Login__OTP__Container"
            >
              Google Authenticator OTP
              <OtpInput
                id="otp"
                inputStyle="Login__OTP"
                inputType="number"
                value={otpValue}
                onChange={setOtpValue}
                numInputs={6}
                renderInput={(props) => <input {...props} />}
              />
            </label>
          )}
          <button
            className="Login__Button"
            type="submit" 
            > {otp ? "Verify OTP" : "Login"}
          </button>
          <div
            onClick={() => navigate('/reset-password')}
            className="Login__Forgot__Password">
            Forgot Password
          </div>
        </div>
      </form>
      )}
      <Alert severity={severity} message={serverMessage} onClose={() => setServerMessage('')}/>
    </div>
  );
};

export default Login;
