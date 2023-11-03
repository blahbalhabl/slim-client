import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";
import '../styles/AttendanceEntry.css'

const AttendanceEntry = () => {
  const { auth } = useAuth();
  const { id, date } = useParams();
  const axiosPrivate = useAxiosPrivate();
  const [proceeding, setProceeding] = useState(null);

  const formatDate = (date) => {
    const newDate = new Date(date);
    const options = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
    };
    const formattedDate = newDate.toLocaleDateString(undefined, options);
    return formattedDate;
  };

  const getProceeding = async () => {
    try {
      const proceedings = await axiosPrivate.get(`/proceeding?level=${auth.level}&id=${id}`);
      return proceedings.data;
    } catch(err) {
      console.error(err); //SetServerMessage
    };
  };

  useEffect(() => {
    getProceeding()
      .then((data) => {
        setProceeding(data);
      });
  }, []);

  console.log(proceeding);

  return (
    <div className="AttendanceEntry">
      {proceeding && (
        <div className="AttendanceEntry__Header">
          <p>Title: {proceeding.title}</p>
          <p>Attendance: {formatDate(date) }</p>
        </div>
      )}
    </div>
  )
}

export default AttendanceEntry