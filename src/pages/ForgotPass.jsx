import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import Alert from '../components/Alert';
import '../styles/ForgotPass.css';

const ForgotPass = () => {
  const navigate = useNavigate();
  const [send, setSend] = useState(false);
  const [otp, setOtp] = useState(null);
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

  const resetPassword = async () => {
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
      console.error(err);
    }
  };

  const verifyCode = () => {
    if(inputs.otp === otp) {
      setOtp(null);
      setVerify(true);
      console.log('Correct Code');
    } else {
      console.log('Incorrect Code');
    }
  };

  const sendEmail = async () => {
    try {
      const res = await axios.post(`/forgot-password/${inputs.email}`);
      
      if(res.status === 200) {
        setOtp(res.data.otp)
        setSend(true);
        // Set a timer to clear OTP after 5 minutes (300,000 milliseconds)
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
      console.error(err);
    }
  };

  useEffect(() => {
    document.title = 'SLIM | Reset Password';
  }, [])
  

  return (
    <div className="ForgotPass">
      <div className="ForgotPass__Container">
        <h4>Forgot Password</h4>
        <label> Email:
          <input 
            type="email"
            name='email'
            id='email'
            onChange={handleChange}
            placeholder="Email"
          />
        </label>
        <button
          onClick={sendEmail}
          disabled={send}
        >
          Send Email
        </button>
        <button
        onClick={navigate('/login')}>
          Back
        </button>
        {send && (
          <div>
            <label htmlFor="otp">Verification Code:
            <input 
              type="number"
              name='otp'
              id='otp'
              onChange={handleChange}
              placeholder="Verification Code"
            />
            </label>
            <button
              onClick={verifyCode}>
              Submit
            </button>
          </div>
        )}
      </div>
      {verify && (
        <div className='ForgotPass__ResetPass'>
        <label htmlFor="password">New Password:
          <input 
            type="password"
            name='password'
            id='password'
            onChange={handleChange}
            placeholder="New Password"
          />
        </label>
        <label htmlFor="confirmPassword">Confirm Password:
          <input 
            type="password"
            name='confirmPassword'
            id='confirmPassword'
            onChange={handleChange}
            placeholder="Confirm Password"
          />
        </label>
        <button
          onClick={resetPassword}>
          Reset Password
        </button>
      </div>
      )}
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