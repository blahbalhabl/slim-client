import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Loader from "./Loader";
import { icons } from "../utils/Icons";

import '../styles/Admin.css'

const Users = () => {

  const { auth } = useAuth();
  const navigate = useNavigate();
  const [users, setUser] = useState();
  const [ordinances, setOrdinances] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosPrivate = useAxiosPrivate();

  const sendRequest = async () => {
    try {
      const usersRes = await axiosPrivate.get('/users');
      const ordinanceRes = await axiosPrivate.get(`/count-ordinances?level=${auth.level}`);
      return { 
        users: usersRes.data, 
        ordinances: ordinanceRes.data,
      };
    } catch (err) {
      setError("An error occurred while fetching data.");
      throw err;
    }
  };

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    sendRequest()
      .then(({
        users, 
        ordinances,
      }) => { 
        if ( isMounted ) {
          setUser(users);
          setOrdinances(ordinances);
        }
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });

      return () => {
        isMounted = false;
        controller.abort();
      }
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="Admin">
      <div className="Admin__Container">
        <div className="Admin__Card" onClick={() => navigate('/records/ordinances/all')}>
          <div className="Admin__Card__Info">
            <p>Number of Ordinances</p>
            <p>{ ordinances.all }</p>
          </div>
          <span><FontAwesomeIcon icon={icons.reports}/></span>
        </div>
        <div className="Admin__Card draft" onClick={() => navigate('/records/ordinances/draft')}>
          <div className="Admin__Card__Info">
            <p>Total Draft Ordinances</p>
            <p>{ ordinances.draft }</p>
          </div>
          <span><FontAwesomeIcon icon={icons.pencil}/></span>
        </div>
        <div className="Admin__Card pending" onClick={() => navigate('/records/ordinances/pending')}>
          <div className="Admin__Card__Info">
            <p>Total Pending Ordinances</p>
            <p>{ ordinances.pending }</p>
          </div>
          <span><FontAwesomeIcon icon={icons.comments}/></span>
        </div>
        <div className="Admin__Card vetoed" onClick={() => navigate('/records/ordinances/vetoed')}>
          <div className="Admin__Card__Info">
            <p>Total Vetoed Ordinances</p>
            <p>{ ordinances.vetoed }</p>
          </div>
          <span><FontAwesomeIcon icon={icons.eye}/></span>
        </div>
        <div className="Admin__Card approved" onClick={() => navigate('/records/ordinances/approved')}>
          <div className="Admin__Card__Info">
            <p>Total Approved Ordinances</p>
            <p>{ ordinances.approved }</p>
          </div>
          <span><FontAwesomeIcon icon={icons.check}/></span>
        </div>
        <div className="Admin__Card enacted" onClick={() => navigate('/records/ordinances/enacted')}>
          <div className="Admin__Card__Info">
            <p>Total Enacted Ordinances</p>
            <p>{ ordinances.enacted }</p>
          </div>
          <span><FontAwesomeIcon icon={icons.like}/></span>
        </div>
      </div>
    </div>
  );
};

export default Users