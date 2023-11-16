import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../hooks/useAxiosPrivate"
import BreadCrumbs from "../components/BreadCrumbs";
import Loader from "../components/Loader";
import '../styles/Attendance.css'

const Attendance = () => {
  const nav = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const [loading, setLoading] = useState(false);
  const [proceedings, setProceedings] = useState({
    current: [],
    upcoming: [],
  });
  const [pastProceedings, setPastProceedings] = useState([]);
  const [ordinances, setOrdinances] = useState([]);

  const pathnames = location.pathname.split('/').filter((item) => item !== '');
  const breadcrumbs = pathnames.map((name, index) => ({
    label: name,
    url: `/${pathnames.slice(0, index + 1).join('/')}`,
  }));

  const getProceedings = async () => {
    try {
      const proceedings = await axiosPrivate.get(`/proceedings`);
      const pastProceedings = await axiosPrivate.get('/past-proceedings');
      
      return { data: proceedings.data, pastProceedings: pastProceedings.data };
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
    const fetchDataForProceeding = async (proceedingId) => {
      try {
        const response = await axiosPrivate.get(`/ordinance?id=${proceedingId}`);
        return response.data; // Assuming the response is an array of objects
      } catch (error) {
        console.error(`Error fetching data for proceeding ${proceedingId}:`, error);
        return null; // or handle the error in a way that makes sense for your application
      }
    };
    getProceedings()
      .then(async ({ pastProceedings }) => {
        setPastProceedings({ pastProceedings });
        const fetchRequests = pastProceedings.map(proceeding => fetchDataForProceeding(proceeding.proceedingId));
        
        // Wait for all fetch requests to complete
        const ordinanceDataArray = await Promise.all(fetchRequests);
  
        // ordinanceDataArray now contains the data fetched for each proceeding
        setOrdinances(ordinanceDataArray);
      })
      .catch(error => console.error('Error fetching past proceedings:', error));
  }, []);

  useEffect(() => {
    document.title = 'SLIM | Proceedings';
    setLoading(true);
    getProceedings().then(({ data }) => {
      // Filter and sort the data based on conditions
      const getCurrentDate = () => {
        const currentTime = new Date();

        const currentProceedings = data.filter(item => {
          const endTime = new Date(item.endTime);
          return (currentTime >= new Date(item.proceedings) && currentTime <= endTime)
        });
    
        const upcomingProceedings = data.filter(item => {
          return (currentTime < new Date(item.proceedings));
        });
    
        setProceedings({
          current: currentProceedings,
          upcoming: upcomingProceedings,
        });
      };

      getCurrentDate();
      setLoading(false);

      const intervalId = setInterval(getCurrentDate, 1000); // Update every second
      // Clear the interval on unmount to avoid memory leaks
      return () => clearInterval(intervalId);
    });
  }, []);

  if(loading) {
    return (
      <Loader />
    )
  };

  return (
    <div className="Attendance">
      <BreadCrumbs items={breadcrumbs}/>
      <h1>Proceedings</h1>
      <div className="Attendance__Content__Container">
        <div className="Attendance__Card">
          <h2>Currently Happening</h2>
          {proceedings.current && proceedings.current.length > 0 ? (
            proceedings.current.map((proceeding, i) => (
              <div
                key={i}
                className="Attendance__Proceedings"
                onClick={() => nav(`current/${proceeding._id}/${proceeding.proceedings.split('T')[0]}-${formatTime(proceeding.proceedings)}`)}
              >
                <p>Ordinance No.{proceeding.number}, Series of {proceeding.series} {proceeding.title}</p>
                <p>{formatDate(proceeding.proceedings)}</p>
                <p>{formatDate(proceeding.endTime).split(',')[3]}</p>
                <p>{proceeding?.status?.toUpperCase()}</p>
              </div>
            ))
          ) : (
            <p>No Current Proceedings</p>
          )}
        </div>
        <div className="Attendance__Card">
          <h2>Upcoming Proceedings</h2>
          {proceedings.upcoming && proceedings.upcoming.length > 0 ? (
            proceedings.upcoming.map((proceeding, i) => (
              <div
                key={i}
                className="Attendance__Proceedings"
                onClick={() => nav(`current/${proceeding._id}/${proceeding.proceedings.split('T')[0]}-${formatTime(proceeding.proceedings)}`)}
              >
                <p>Ordinance No.{proceeding.number}, Series of {proceeding.series} {proceeding.title}</p>
                <p>{formatDate(proceeding.proceedings)}</p>
                <p>{formatDate(proceeding.endTime).split(',')[3]}</p>
                <p>{proceeding?.status?.toUpperCase()}</p>
              </div>
            ))
          ) : (
            <p>No Upcoming Proceedings</p>
          )}
        </div>
        <div className="Attendance__Card">
          <h2>Past Proceedings</h2>
          {ordinances && ordinances.length > 0 ? (
            ordinances
              .map((ordinance, i) => ({
                ordinance,
                pastProceeding: pastProceedings.pastProceedings[i],
              }))
              .sort((a, b) => new Date(b.ordinance.proceedings) - new Date(a.ordinance.proceedings))
              .map(({ ordinance, pastProceeding }, i) => (
                <div
                  key={i}
                  className="Attendance__Proceedings"
                  onClick={() => nav(`past/${ordinance._id}/${ordinance.proceedings.split('T')[0]}-${formatTime(ordinance.proceedings)}?prodId=${pastProceeding._id}`)}
                >
                  <p>Ordinance No.{ordinance.number}, Series of {ordinance.series} {ordinance.title}</p>
                  <p>{formatDate(pastProceeding.startTime)}</p>
                  <p>{formatDate(pastProceeding.endTime).split(',')[3]}</p>
                  <p>{ordinance?.status?.toUpperCase()}</p>
                </div>
              ))
          ) : (
            <p>No Past Proceedings</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Attendance