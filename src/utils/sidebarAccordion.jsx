import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { icons } from './Icons';
import { roles } from './userRoles';

const role = roles.role

export const sidebarAccordion = [
  {
    title: 'Reports',
    roles: [role.adn], // Roles that can access this item
    contents: [
      {
        title: (
          <Link className='Sidebar__Button' to={'/records/ordinances/all'}>
            <FontAwesomeIcon icon={icons.reports} />
            <p>List of Ordinances</p>
          </Link>
        ),
      },
      {
        title: (
          <Link className='Sidebar__Button' to={'/records/ordinances/draft'}>
            <FontAwesomeIcon icon={icons.pencil} />
            <p>List of Draft Ordinances</p>
          </Link>
        ),
      },
      {
        title:  <Link
                  className='Sidebar__Button'
                  to={'/records/ordinances/enacted'}>
                    <FontAwesomeIcon icon={icons.like} />
                    <p>List of Enacted Ordinances</p>
                </Link>
      },
      {
        title:  <Link
                  className='Sidebar__Button'
                  to={'/records/ordinances/approved'}>
                    <FontAwesomeIcon icon={icons.check} />
                    <p>List of Approved Ordinances</p>
                </Link>
      },
      {
        title:  <Link
                  className='Sidebar__Button'
                  to={'/records/ordinances/amended'}>
                    <FontAwesomeIcon icon={icons.pencil} />
                    <p>List of Amended Ordinances</p>
                </Link>
      },
      {
        title:  <Link
                  className='Sidebar__Button'
                  to={'/records/ordinances/vetoed'}>
                    <FontAwesomeIcon icon={icons.eye} />
                    <p>List of Vetoed Ordinances</p>
                </Link>
      },
    ],
  },
  {
    title: 'Calendar',
    roles: [role.adn, role.spr], // Roles that can access this item
    contents: [
      {
        title: (
          <Link className='Sidebar__Button' to={'/attendance'}>
            <FontAwesomeIcon icon={icons.horn} />
            <p>Attendance</p>
          </Link>
        ),
      },
    ],
  },
];
