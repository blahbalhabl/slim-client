import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
// import BreadCrumbs from "../components/BreadCrumbs";
import '../styles/AttendanceEntry.css'

const AttendanceEntry = () => {
  const { id } = useParams();
  const axiosPrivate = useAxiosPrivate();
  const [proceeding, setProceeding] = useState(null);
  const [isCurrent, setIsCurrent] = useState(false);
  const [members, setMembers] = useState(null);
  const [isPresent, setIsPresent] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendancePosted, setAttendancePosted] = useState(false);
  const [inputs, setInputs] = useState({});

  // const pathnames = location.pathname.split('/').filter((item) => item !== '');
  // const breadcrumbs = pathnames.map((name, index) => ({
  //   label: name,
  //   url: `/${pathnames.slice(0, index + 1).join('/')}`,
  // }));

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
      const proceeding = await axiosPrivate.get(`/proceeding?id=${id}`);
      const members = await axiosPrivate.get('/sanggunian-members');

      return { proceedings: proceeding.data, members: members.data };
    } catch(err) {
      console.error(err); //SetServerMessage
    };
  };

  const postAttendance = async () => {
    try {
      const data = {
        proceedingId: proceeding._id,
        attended: attendanceData
      }

      // Send the attendance data to the server
      await axiosPrivate.post('/attendance', data, {
        headers: {'Content-Type': 'application/json'} 
      });
      console.log(data)
      console.log('Attendance posted');
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e, index, name) => {
    const { checked } = e.target;

    // Update the attendanceData state based on the checked status of the checkbox
    setAttendanceData((prevData) => {
      const newData = [...prevData];
      newData[index] = { name: name, isChecked: checked };
      return newData;
    });
  };

  useEffect(() => {
    getData()
      .then(({proceedings, members}) => {
        setProceeding(proceedings);
        setMembers(members);
      });
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
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Position</th>
                <th>Time Present</th>
              </tr>
            </thead>
            <tbody>
                {members && members.map((member, i) => (
                  <tr key={i}>
                    <td>{member.name}</td>
                    <td>{member.position}</td>
                    <td>
                      <input 
                        type="checkbox"
                        disabled={!isCurrent}
                        onChange={(e) => handleChange(e, i, member.name)} />
                    </td>
                  </tr>
                ))}
                <button onClickCapture={postAttendance}>Post Attendancec</button>
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

export default AttendanceEntry