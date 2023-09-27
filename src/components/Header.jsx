import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useLogout from "../hooks/useLogout";
import Tooltip from "./Tooltip";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { icons } from '../utils/Icons'
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import logo from '../assets/site-logo.png';
import "../styles/Header.css";

const Header = () => {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const logout = useLogout();
  const { auth } = useAuth();
  // const [ logo, setLogo ] = useState();
  const [imageSrc, setImageSrc] = useState(null);

  const signOut = async () => {
    await logout();
    navigate('/login');
  }

  const headerTooltip = [
    {
      buttons: [
        <li
          className="Header__Tooltip"
          key="profile" 
          onClick={() => {
            navigate(`/profile/${auth.id}`)
        }}>
          <FontAwesomeIcon className="Header__Tooltip__Icon" icon={icons.user} />
          Profile
        </li>,
        <li
          className="Header__Tooltip"
          key="logout" 
          onClick={signOut}>
            <FontAwesomeIcon className="Header__Tooltip__Icon" icon={icons.logout} />
          Logout
        </li>,
      ],
    },
  ]

  useEffect(() => {
    if (auth) {
      axiosPrivate
        .get(`/uploads/images/${auth.avatar}`, {
          responseType: 'arraybuffer',
        })
        .then((response) => {
          const base64Image = btoa(
            new Uint8Array(response.data).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ''
            )
          );
          const dataURL = `data:${response.headers['content-type']};base64,${base64Image}`;
          setImageSrc(dataURL);
        })
        .catch((error) => {
          console.error('Error fetching image:', error);
        });

      // axiosPrivate.get(`uploads/images/site-logo.png`, {
      //     responseType: 'arraybuffer',
      //   })
      //   .then((response) => {
      //     const base64Image = btoa(
      //       new Uint8Array(response.data).reduce(
      //         (data, byte) => data + String.fromCharCode(byte),
      //         ''
      //       )
      //     );
      //     const dataURL = `data:${response.headers['content-type']};base64,${base64Image}`;
      //     setLogo(dataURL);
      //   })
      //   .catch((error) => {
      //     console.error('Error fetching image:', error);
      //   });
    }
  }, [auth]);

  return (
    <div className="Header">
      <div className="Header__Title">
        { logo ? <img className="Header_Logo" src={logo} style={{ width: '70px', height: '70px' }} /> : <FontAwesomeIcon icon={icons.user} />}
        <h3>SLIM: Sanggunian Legislative Information Management</h3>
      </div>
      <div className="Header__Container">
        {auth && (
          <div className="Header__Info">
            {imageSrc ? (
              <img className="Header__Avatar" src={imageSrc}  />
            ) : (<FontAwesomeIcon icon={icons.user} />)}
            <p>
              {auth.name.toUpperCase()}
            </p>
            <div>
              <Tooltip data={headerTooltip}/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
