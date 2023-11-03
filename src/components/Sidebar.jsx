import { useState } from 'react';
import useAuth from '../hooks/useAuth';
import { Link, useLocation } from 'react-router-dom';
import Accordion from './Accordion';
import { sidebarAccordion } from '../utils/sidebarAccordion';
import { roles } from '../utils/userRoles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { icons } from '../utils/Icons';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const { auth } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const role = roles.role;
  const levels = roles.level;

  const links = {
    dash: '/',
    sign: '/users',
    mem: '/sanggunian-members',
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const isActive = (link) => location.pathname === link;

  return auth && (
    <div className={`Sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className='Sidebar__Top'>
        <FontAwesomeIcon
          className='Sidebar__Burger'
          onClick={toggleSidebar}
          icon={icons.burger}
        />
      </div>
      <div className="Sidebar__Buttons">
        <Link
          className={`Sidebar__Button ${collapsed ? 'collapsed' : ''} ${isActive(links.dash) ? 'active' : ''}`}
          to={links.dash}
        >
          <FontAwesomeIcon icon={icons.chart} />
          {!collapsed ? <p>Dashboard</p> : <span>Dashboard</span>}
        </Link>
        {auth.role === role.spr && (
          <Link
            className={`Sidebar__Button ${collapsed ? 'collapsed' : ''} ${isActive(links.sign) ? 'active' : ''}`}
            to={links.sign}
          >
            <FontAwesomeIcon icon={icons.user} />
            {!collapsed ? <p>Users</p> : <span>Users</span>}
          </Link>
        )}
        <Accordion data={sidebarAccordion} collapse={collapsed} userRole={auth.role}/>
        {(auth.role === role.spr || auth.role === role.adn) && (
          <>
            <Link
              className={`Sidebar__Button ${collapsed ? 'collapsed' : ''} ${isActive(links.mem) ? 'active' : ''}`}
              to={links.mem}
            >
              <FontAwesomeIcon icon={icons.user} />
              {!collapsed ? <p>Sanggunian Members</p> : <span>Sanggunian Members</span>}
            </Link>
          </>
        )}
      </div>
    </div>
  )
};

export default Sidebar;
