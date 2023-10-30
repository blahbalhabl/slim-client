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
  const [otp, setOtp] = useState(null);
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

  const verifyCode = () => {
    if(inputs.otp === otp) {
      // if OTP Code is correct. Invalidate the OTP code by setting it to null.
      setOtp(null);
      setVerify(true);
      setInputError(false);
    } else {
      setInputError({otp: true})
    }
  };

  const sendEmail = async () => {
    try {
      const res = await axios.post(`/forgot-password/${inputs.email}`);
      
      if(res.status === 200) {
        setOtp(res.data.otp);
        setInputError(false);
        setSend(true);
        // Set a timer to invalidate OTP after 5 minutes (300,000 milliseconds)
        setTimeout(() => {
          setOtp(null);
        }, 300000);

        const emailData = {
          email: inputs.email,
          subject: `Forgot Password on SLIM`,
          html: `
            <h1>Verification Code:</h1> 
            <h3>Verify this code if you requested the forgot password</h3>
            </br>
            </br>
            <h2>${res.data.otp}</h2>
            <p>This code will only be valid for 5 minutes</p>
            <p>If you did not make this request please contact support.</p>`,
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
    
  }, [inputs.password]);

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