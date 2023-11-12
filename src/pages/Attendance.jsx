import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../hooks/useAxiosPrivate"
import BreadCrumbs from "../components/BreadCrumbs";
import '../styles/Attendance.css'

const Attendance = () => {
  const nav = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const [proceedings, setProceedings] = useState([]);

  const pathnames = location.pathname.split('/').filter((item) => item !== '');
  const breadcrumbs = pathnames.map((name, index) => ({
    label: name,
    url: `/${pathnames.slice(0, index + 1).join('/')}`,
  }));

  const getProceedings = async () => {
    try {
      const proceedings = await axiosPrivate.get(`/proceedings`);
      return proceedings.data;
    } catch(err) {
      console.error(err) //SetServerMessage Here
    }
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

  useEffect(() => {
    document.title = 'SLIM | Attendance';
    getProceedings()
      .then((data) => {
        setProceedings(data);
      });
  },[]);

  return (
    <div className="Attendance">
      <BreadCrumbs items={breadcrumbs}/>
      <h1>Attendance</h1>
      <div className="Attendance__Content__Container">
        {proceedings && proceedings.map((proceeding, i) => (
          <div 
            key={i}
            className="Attendance__Proceedings"
            onClick={() => nav(`${proceeding._id}/${proceeding.proceedings.split('T')[0]}-${formatTime(proceeding.proceedings)}`)}>
            <p>{proceeding.title}</p>
            <p>{formatDate(proceeding.proceedings)}</p>
            <p>{proceeding.status}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Attendance