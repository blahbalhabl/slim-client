import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { roles } from '../utils/userRoles';
import Loader from './Loader';
import { TextField } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { icons } from '../utils/Icons';
import '../styles/Calendar.css'

const Calendar = () => {
  const nav = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const role = roles.role;
  const [inputs, setInputs] = useState({}); // For setting new schedules
  const [isLoading, setIsLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [proceedings, setProceedings] = useState([]);
  const [addSched, setAddSched] = useState(false);
  const [cancel, setCancel] = useState('');

  const getProceedings = async () => {
    try {
      const date =  new Date();
      const proceedings = await axiosPrivate.get(`/proceedings`);
      const newProceedings = proceedings.data.filter((proceeding, i) => {
        const endTime = new Date(proceeding?.endTime);
        return endTime >= date;
      });
      
      return newProceedings;
    } catch(err) {
      console.error(err); //SetServerMessage
    };
  };

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

  const formatDate = (date) => {
    const newDate = new Date(date);
    const options = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    const formattedDate = newDate.toLocaleDateString(undefined, options);
    return formattedDate;
  };

  const formatTime = (date) => {
    const newDate = new Date(date);
    const hours = newDate.getHours();
    const minutes = newDate.getMinutes();

    const formattedTime = new Date(0, 0, 0, hours, minutes).toLocaleTimeString();
    return formattedTime;
  };

  const isOngoing = (proceeding, endTime) => {
    const date = new Date(proceeding)
    const end = new Date(endTime);
    const currentDate = new Date();
    if (date > currentDate) {
      return "Upcoming";
    } else if (currentDate >= date && date <= end) {
      return "Ongoing";
    }
  };

  useEffect(() => {
    setIsLoading(true);
    getProceedings()
      .then((data) => {
        setProceedings(data);
        setIsLoading(false);
      })
  }, []);

  useEffect(() => {
    // Function to get the current date
    const getCurrentDate = () => {
      const today = new Date();
      const formattedDate = formatDate(today);
      setCurrentDate(formattedDate);
    };
    getCurrentDate();
    // isOngoing();
    // You can also set up an interval to update the date in real-time
    const intervalId = setInterval(getCurrentDate, 1000); // Update every second
    // Clear the interval on unmount to avoid memory leaks
    return () => clearInterval(intervalId);
  }, []);

  if(isLoading) {
    return (
      <Loader />
    )
  }

  return (
    <div className='Calendar'>
      <div className="Calendar__Header">
        <h3>{currentDate}</h3>
        {/* {auth?.role === role.adn && (
          <button
            className={`Calendar__Header__Button${cancel}`}
            onClick={addSchedule}>
              {!addSched ? (
                <p>Add Event</p>
              ) : (
                <p>Cancel</p>
              )}
          </button>
        )} */}
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
          {/* Map all proceedings in the database here */}
          {proceedings ? (
            <div className='Calendar__Content__Parent'>
              <span>
                <p className='Calendar__Proceedings'>Proceedings</p>
              </span>
              {proceedings
                .sort((a, b) => new Date(b.proceedings) - new Date(a.proceedings))
                .map((proceeding, i) => (
                <div
                  key={i} 
                  className={`Calendar__Content ${isOngoing(proceeding.proceedings, proceeding.endTime)}`}
                  onClick={() => nav(`/proceedings/current/${proceeding._id}/${proceeding.proceedings.split('T')[0]}-${formatTime(proceeding.proceedings)}`)}>
                  <div>
                    <p>{proceeding.title}</p>
                    {/* <p>{formatDate(proceeding.proceedings)}</p> */}
                    <p style={{fontWeight: 'bold'}}>{formatDate(proceeding.proceedings)}</p>
                    <p>{proceeding.status.toUpperCase()}</p>
                    <p>{isOngoing(proceeding.proceedings, proceeding.endTime)}</p>
                  </div>
                  <Link 
                    to={`/proceedings/current/${proceeding._id}/${proceeding.proceedings.split('T')[0]}-${formatTime(proceeding.proceedings)}`} 
                    className='Calendar__Link'>
                      <FontAwesomeIcon icon={icons.share}/>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className='Calendar__Null'>
              <label>No Upcoming Events</label>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Calendar