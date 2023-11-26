import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField } from '@mui/material';
import axios from '../api/axios';
import Alert from '../components/Alert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { icons } from '../utils/Icons';
import '../styles/ForgotPass.css';

const ForgotPass = () => {
  const navigate = useNavigate();
  const [send, setSend] = useState(false);
  const [viewPassword, setViewPassword] = useState(false);
  const [viewConfirm, setViewConfirm] = useState(false);
  const [inputError, setInputError] = useState({
    email: false,
    password: false,
    otp: false,
    confirm: false,
  });
  const [verify, setVerify] = useState(false);
  const [serverMessage, setServerMessage] = useState('');
  const [inputs, setInputs] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => {
      return { ...prev, [name]: value };
    });
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    try {
      const userData = {
        email: inputs.email,
        password: inputs.password,
        confirmPassword: inputs.confirmPassword,
      };

      const res = await axios.post('/reset-password', userData, {
        headers: {"Content-Type": "application/json"},
      });

      const data = await res.data;

      if (res.status === 200) {
        setServerMessage(data.message);
        navigate('/login');
        console.log('Password Reset Successfully');
      } else {
        console.log('Password Reset Failed');
      }

    } catch (err) {
      switch(err.response.status) {
        case 401:
          setInputError({password: true});
          break;
        default:
          null
      };
    };
  };

  const verifyCode = async () => {
    try {
      const res = await axios.get('/verify-otp', {
        email: inputs.email,
        otp: inputs.otp,
      });

      if(res.status === 200) {
        setVerify(true);
        setInputError(false);
      } else {
        setInputError({otp: true})
      }
    } catch (err) {
      setInputError({otp: true});
    }
  };

  const sendEmail = async () => {
    try {
      const res = await axios.post(`/forgot-password/${inputs.email}`);
      
      if(res.status === 200) {
        setInputError(false);
        setSend(true);

        const emailData = {
          email: inputs.email,
          subject: `Forgot Password on SLIM`,
        };

        await axios.post('/forgot-email', emailData, {
          headers: {'Content-Type': 'application/json'}
        }).catch((err) => {
          console.log('Error sending email:', err);
        });
      }
    } catch (err) {
        setInputError({email: true});
    }
  };

  useEffect(() => {
    if (inputs.password !== inputs.confirmPassword) {
      setInputError({confirm: true});
    } else if (inputs.password === inputs.confirmPassword) {
      setInputError({confirm: false});
    }
  }, [inputs.confirmPassword]);

  useEffect(() => {
    document.title = 'SLIM | Reset Password';
  }, [])
  
  return (
    <div className="ForgotPass">
      <div className="ForgotPass__Main">
        <div className="ForgotPass__Container">
          <span className='ForgotPass__Header'>
            <button
              className='ForgotPass__Back__Button'
              onClick={() => navigate('/login')}
            >
              <FontAwesomeIcon icon={icons.chevLeft}/> Back
            </button>
          </span>
          <h4>Reset Password</h4>
          <TextField
            error={inputError.email}
            className="ForgotPass__Input" 
            id="email"
            name="email"
            label="Email Address" 
            variant="outlined"
            margin="normal"
            helperText={inputError.email && 'Invalid Email.'}
            onChange={handleChange}
            required
          />
          <button
            className='ForgotPass__Send__Button'
            onClick={sendEmail}
            disabled={send}
          >
            Send Email
          </button>
          {send && (
            <div className='ForgotPass__OTP__Container'>
              <TextField
                error={inputError.otp}
                className="ForgotPass__Input" 
                id="otp"
                name="otp"
                label="OTP" 
                variant="outlined"
                margin="normal"
                helperText={inputError.otp && 'Incorrect OTP.'}
                onChange={handleChange}
                required
              />
              <button
                className='ForgotPass__Verify__Button'
                onClick={verifyCode}>
                Verify
              </button>
            </div>
          )}
        </div>
        {verify && (
        <div className='ForgotPass__ResetPass'>
          <div>
            <p></p>
          </div>
          <TextField
            error={inputError.password}
            className="ForgotPass__Input" 
            id="password"
            name="password"
            label="New Password" 
            variant="outlined"
            margin="normal"
            type={viewPassword}
            helperText={inputError.password && "New Password can't be the same with Old Password."}
            onChange={handleChange}
            required
          />
          <TextField
            error={inputError.confirm}
            className="ForgotPass__Input" 
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm New Password" 
            variant="outlined"
            margin="normal"
            type={viewConfirm}
            helperText={inputError.confirm && 'New Password must be the same'}
            onChange={handleChange}
            required
          />
          <button
            className='ForgotPass__Reset__Button'
            onClick={resetPassword}>
            Reset Password
          </button>
        </div>
        )}
      </div>
      {serverMessage && (
        <Alert
          message={serverMessage}
          onClose={() => setServerMessage('')}
          // type="error"
        />
      )}
    </div>
  )
}

export default ForgotPass