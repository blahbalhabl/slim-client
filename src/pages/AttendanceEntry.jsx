import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import Alert from "../components/Alert";
import '../styles/AttendanceEntry.css'

const AttendanceEntry = () => {
  const { id, past } = useParams();
  // Get query parameters using useLocation
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const prodId = queryParams.get('prodId');

  const axiosPrivate = useAxiosPrivate();
  const [proceeding, setProceeding] = useState(null);
  const [isCurrent, setIsCurrent] = useState(false);
  const [members, setMembers] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendancePosted, setAttendancePosted] = useState(false);
  const [pastProceedings, setPastProceedings] = useState([]);
  const [severity, setSeverity] = useState('');
  const [serverMessage, setServerMessage] = useState('');

  const formatDate = (date) => {
    const newDate = new Date(date);
    const options = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    const formattedDate = newDate.toLocaleDateString(undefined, options);
    return formattedDate;
  };

  const getData = async () => {
    try {
      const proceeding = await axiosPrivate.get(`/proceeding?id=${id}`); //ordinance related to proceeding data
      const members = await axiosPrivate.get('/sanggunian-members');

      return { proceedings: proceeding.data, members: members.data};
    } catch(err) {
      console.error(err); //SetServerMessage
    };
  };

  const getPastData = async () => {
    try {
      const past = await axiosPrivate.get(`/past-proceeding?id=${prodId}`); //past proceeding data
      
      return { past: past.data};
    } catch (err) {
      console.error(err);
    }
  };

  const postAttendance = async (e, filename) => {
    try {
      e.preventDefault();
      const data = {
        proceedingId: proceeding._id,
        attended: attendanceData,
        startTime: proceeding.proceedings,
        endTime: new Date(),
      }

      // Send the attendance data to the server
      const res = await axiosPrivate.post('/attendance', data, {
        headers: {'Content-Type': 'application/json'} 
      });

      await axiosPrivate.post(`/update-proceedings/${filename}`, {endTime: data.endTime}, {
        headers: {'Content-Type': 'application/json'}
      });
      setServerMessage(res.data.message);
      setSeverity(res.status);

    } catch (err) {
      setServerMessage(err.response.data.message);
      setSeverity(err.response.status);

    }
  };

  const isPresent = (name) => {
    // Use the Array.some() method to check if any element in the array matches the condition
    console.log(pastProceedings)
    return pastProceedings.attended.some(present => present?.name === name && present?.isChecked);
  };

  const handleChange = (e, index, name) => {
    const { checked } = e.target;
    // Update the attendanceData state based on the checked status of the checkbox
    setAttendanceData((prevData) => {
      const newData = [...prevData];
      newData[index] = { name: name, isChecked: checked, timePresent: checked ? new Date() : null };
      return newData;
    });
  };

  useEffect(() => {
    document.title = 'SLIM | Attendance';
    getData()
      .then(({ proceedings, members }) => {
        setProceeding(proceedings); // Ordinance Info
        setMembers(members);  //Members Info
      });
    if(prodId) {
      getPastData()
        .then(({past}) => {
          setPastProceedings(past); // Past Proceedings Info
        })
    }
  }, []);

  useEffect(() => {
    const getCurrentDate = () => {
      const currentTime = new Date();

      if (currentTime >= new Date(proceeding?.proceedings) && currentTime <= new Date(proceeding?.endTime)) {
        setIsCurrent(true);
      } else {
        setIsCurrent(false);
      }
    };

    getCurrentDate();

    const intervalId = setInterval(getCurrentDate, 1000); // Update every second

    // Clear the interval on unmount to avoid memory leaks
    return () => clearInterval(intervalId);
  }, [proceeding, attendancePosted]);

  return (
    <div className="AttendanceEntry">
      {/* <BreadCrumbs items={breadcrumbs} /> */}
      {proceeding && (
        <>
        <h1>Attendance: {formatDate(proceeding.proceedings)}</h1>
          <div className="AttendanceEntry__Header">
            <p>Ordinance No.{proceeding.number}, Series of {proceeding.series} {proceeding.title}</p>
            <p>Status: {proceeding.status.toUpperCase()}</p>
          </div>
        </>
      )}
      {proceeding && prodId ? (
        <div>
        {/* Render the table for past proceedings */}
        <table className="AttendanceEntry__Table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Position</th>
              <th>Time Present</th>
              <th>Present</th>
            </tr>
          </thead>
          <tbody>
            {members &&
              members.map((member, i) => (
                <tr key={i}>
                  <td>{member.name}</td>
                  <td>{member.position}</td>
                  <td>
                    {/* Render 'N/A' if no attendance data for the member */}
                    {isPresent(member.name) ? (
                        formatDate(pastProceedings.attended[i].timePresent)
                      ) : (
                        'N/A'
                      )}
                  </td>
                  <td>
                  <p>{isPresent(member.name) ? 'Present' : 'Absent'}</p>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      ) : (
        // if not, render this part
        <>
          <table className="AttendanceEntry__Table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Position</th>
                <th>Time Present</th>
                <th>Present</th>
              </tr>
            </thead>
            <tbody>
                {members && members.map((member, i) => (
                  <tr key={i}>
                    <td>{member.name}</td>
                    <td>{member.position}</td>
                    <td>{attendanceData[i]?.timePresent ? formatDate(attendanceData[i]?.timePresent) : 'N/A'}</td>
                    <td>
                      <input 
                        type="checkbox"
                        disabled={!isCurrent}
                        onChange={(e) => handleChange(e, i, member.name)} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <button 
            className={`AttendanceEntry__Button ${isCurrent}`}
            disabled={!isCurrent}
            onClick={(e) => postAttendance(e, proceeding.file)}>
              Post Attendance
          </button>
        </>
      )}
      <Alert severity={severity} message={serverMessage} onClose={() => setServerMessage('')}/>
    </div>
  )
}

export default AttendanceEntry