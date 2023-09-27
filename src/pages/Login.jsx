import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { icons } from "../utils/Icons";
import axios from "../api/axios";
import Alert from "../components/Alert";
import OtpInput from 'react-otp-input';
import '../styles/Login.css'

const Login = () => {
  const [otp, setOtp] = useState();
  const [visible, setVisible] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [serverMessage, setServerMessage] = useState('');
  const inputType = visible ? "text" : "password";
  const toggleIcon = visible ? <FontAwesomeIcon icon={icons.eye} /> : <FontAwesomeIcon icon={icons.eyeslash} />;

  const { setAuth, persist } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from.pathname || '/';

  const [inputs, setInputs] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => {
      return { ...prev, [name]: value };
    });
  };

  const userLogin = async (e) => {
    e.preventDefault();
    try {
      const userData = {
        email: inputs.email,
        password: inputs.password,
        otp: otpValue || null,
      };

      const res = await axios.post('/login', userData, {
        headers: {"Content-Type": "application/json"},
      });

      const data = await res.data;

      if (res.status === 200) {
        setAuth(data);
        navigate(from, { replace: true });
        return data;
      } else if (res.status === 201) {
        setOtp(true);
      } else {
        setServerMessage(data.message);
      }

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
        }
      }
    } catch (err) {
      setServerMessage("Incorrect Credentials!"); 
    }
  };

  useEffect(() => {
    localStorage.setItem('persist', persist);
    document.title = 'SLIM | Login';
  },[persist]);

  return (
    <div className="Login">
      <form onSubmit={userLogin}>
        <div className="Login__Container">
          <h4>Login</h4>
          <input 
            type="email"
            name="email"
            onChange={handleChange}
            placeholder="Email"
            required
          />
          <input 
            type={inputType}
            name="password"
            onChange={handleChange}
            placeholder="Password" 
            required
          />
          <span
            className="Login__Password__Toggle"
            onClick={() => setVisible(visible => !visible)}>
              {toggleIcon}
          </span>
          <br />
          { otp && (
            <label htmlFor="otp">Google Authenticator OTP
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
            onClick={() => navigate('/forgot-password')}
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
