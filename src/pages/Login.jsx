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
  const [emailError, setEmailError] = useState(false);
  const [passError, setPassError] = useState(false);
  const [serverMessage, setServerMessage] = useState('');
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
        };
      };
    } catch (err) {
      // Handle Error response statuses accccordingly.
      switch(err?.response?.status) {
        case 400:
          setEmailError(true)
          break;
        case 401:
          setPassError(true);
          break;
        default:
          null;
      };
    };
  };

  useEffect(() => {
    localStorage.setItem('persist', persist);
    document.title = 'SLIM | Login';
  },[persist]);

  return (
    <div className="Login">
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
              >Google Authenticator OTP
              <OtpInput
              id="otp"
              className="Login__OTP__Input"
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
      <Alert message={serverMessage} onClose={() => setServerMessage('')}/>
    </div>
  );
};

export default Login;
