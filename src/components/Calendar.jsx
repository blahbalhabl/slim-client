import { useState } from 'react';
import useAuth from '../hooks/useAuth'
import { roles } from '../utils/userRoles';
import { TextField } from '@mui/material';
import '../styles/Calendar.css'

const Calendar = () => {
  const { auth } = useAuth();
  const role = roles.role;
  const [addSched, setAddSched] = useState(false);
  const [cancel, setCancel] = useState('');

  const addSchedule = () => {
    setAddSched(!addSched);
    addSched !== true ? setCancel(' cancel') : setCancel('')
  };

  const submitSchedule = () => {
    console.log('Hello');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => {
      return { ...prev, [name]: value };
    });
  };

  return (
    <div className='Calendar'>
      <div className="Calendar__Header">
        <h1>Calendar</h1>
        {auth?.role === role.adn && (
          <button
            className={`Calendar__Header__Button${cancel}`}
            onClick={addSchedule}>
              {!addSched ? (
                <p>Add Event</p>
              ) : (
                <p>Cancel</p>
              )}
          </button>
        )}
      </div>
      <div className="Calendar__Container">
        {addSched && (
          <div className='Calendar__Add__Schedule'>
            <form onSubmit={submitSchedule}>
              <TextField
                // error={emailError}
                className="Calendar__Input" 
                name="title"
                label="Title" 
                variant="outlined"
                margin="normal"
                // helperText={emailError && 'Invalid Email.'}
                onChange={handleChange}
                required
              />
              <TextField
                // error={emailError}
                className="Calendar__Input" 
                name="agenda"
                label="Agenda" 
                variant="outlined"
                margin="normal"
                // helperText={emailError && 'Invalid Email.'}
                onChange={handleChange}
                required
              />
              <button
                className='Calendar__Form__Button'
                onClick={submitSchedule}>
                  Submit
              </button>
            </form>
          </div>
        )}
        <div className="Calendar__Content__Container">
          {/* Map all Schedules in the database here */}
          <div className="Calendar__Content">
            <h3>Title</h3>
            <p>Agenda</p>
            <p>Date & Time</p>
            <p>Status</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Calendar