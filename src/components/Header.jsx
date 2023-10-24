import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useLogout from "../hooks/useLogout";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import Tooltip from "./Tooltip";
import Accordion from './Accordion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { icons } from '../utils/Icons'
import { sidebarAccordion, sidebarAccordion2 } from '../utils/sidebarAccordion';
import { roles } from '../utils/userRoles';
import logo from '../assets/site-logo.svg';
import "../styles/Header.css";
import '../styles/MobileNav.css'

const Header = () => {
  const role = roles.role;
  const levels = roles.level;

  const links = {
    dash: '/',
    sign: '/users',
    mem: '/sanggunian-members',
  };

  const axiosPrivate = useAxiosPrivate();
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useLogout();
  const { auth } = useAuth();
  // const [ logo, setLogo ] = useState();
  const [collapsed, setCollapsed] = useState(true);
  const [imageSrc, setImageSrc] = useState(null);

  const toggleMobileNav = () => {
    setCollapsed(!collapsed);
  };

  const isActive = (link) => location.pathname === link;

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
          onClick={() => navigate(`/profile/${auth.id}`)}>
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
    <>
    <div className="Header">
      <div className="Header__Title">
        { logo ? <img className="Header_Logo" src={logo} style={{ width: '70px', height: '70px' }} /> : <FontAwesomeIcon icon={icons.user} />}
        <h3>SLIM</h3>
        <h4>Sanggunian Legislative Information Management</h4>
      </div>
      <div className="Header__Container">
        {auth && (
          <div className="Header__Info">
            {imageSrc ? (
              <img
                onClick={() => navigate(`/profile/${auth.id}`)}
                className="Header__Avatar" src={imageSrc}  />
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
    {/* Mobile Navigation Bar */}
    { auth && (
    <div className={`MobileNav ${collapsed ? 'collapsed' : ''}`}>
      <div className="MobileNav__Links">
        {/* Render All Navigational Links here */}
        <Link
          className={`MobileNav__Button ${isActive(links.dash) ? 'active' : ''}`}
          to={links.dash}
        >
          <FontAwesomeIcon icon={icons.chart} />
          <p>Dashboard</p>
        </Link>
        {auth.role === role.adn && (
          <Accordion data={sidebarAccordion} />
        )}
        {auth.role === role.spr && (
        <Link
          className={`MobileNav__Button ${isActive(links.sign) ? 'active' : ''}`}
          to={links.sign}
        >
          <FontAwesomeIcon icon={icons.user} />
          {!collapsed && <p>Users</p>}
        </Link>
        )}
        {(auth.role === role.spr || auth.role === role.adn) && (
          <>
            <Accordion data={sidebarAccordion2} collapse={collapsed} />
            <Link
              className={`MobileNav__Button ${isActive(links.mem) ? 'active' : ''}`}
              to={links.mem}
            >
              <FontAwesomeIcon icon={icons.user} />
              {!collapsed && <p>Sanggunian Members</p>}
            </Link>
          </>
        )}
      </div>
      <button 
        onClick={toggleMobileNav}
        className="MobileNav__Dropdown__Button"
      >
        <FontAwesomeIcon icon={icons.down} />
      </button>
    </div>
    )}
    </>
  );
};

export default Header;
