import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
// import BreadCrumbs from "../components/BreadCrumbs";
import '../styles/AttendanceEntry.css'

const AttendanceEntry = () => {
  const { id } = useParams();
  const axiosPrivate = useAxiosPrivate();
  const [proceeding, setProceeding] = useState(null);

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

  const getProceeding = async () => {
    try {
      const proceedings = await axiosPrivate.get(`/proceeding?id=${id}`);
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
      {/* <BreadCrumbs items={breadcrumbs} /> */}
      {proceeding && (
        <div className="AttendanceEntry__Header">
          <p>Title: {proceeding.title}</p>
          <p>Attendance: {formatDate(proceeding.proceedings) }</p>
        </div>
      )}
    </div>
  )
}

export default AttendanceEntry