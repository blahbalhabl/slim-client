import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../hooks/useAxiosPrivate"
import useAuth from "../hooks/useAuth";
import BreadCrumbs from "../components/BreadCrumbs";
import '../styles/Attendance.css'

const Attendance = () => {
  const { auth } = useAuth();
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
      const proceedings = await axiosPrivate.get(`/proceedings?level=${auth.level}`);
      return proceedings.data;
    } catch(err) {
      console.error(err) //SetServerMessage Here
    }
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
      Attendance
      {proceedings && proceedings.map((proceeding, i) => (
        <div 
          key={i}
          className="Attendance__Proceedings"
          onClick={() => nav(`${proceeding._id}/${proceeding.proceedings.split('T')[0]}`)}>
          <p>{proceeding.title}</p>
        </div>
      ))}
    </div>
  )
}

export default Attendance