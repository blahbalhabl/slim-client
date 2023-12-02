import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { icons } from './Icons';
import { roles } from './userRoles';

const role = roles.role

const links = {
  all: '/records/ordinances/all',
  draft: '/records/ordinances/draft',
  enacted: '/records/ordinances/enacted',
  approved: '/records/ordinances/approved',
  amended: '/records/ordinances/amended',
  vetoed: '/records/ordinances/vetoed',
  proceedings: '/proceedings',
};

export const sidebarAccordion = [
  {
    title: 'Reports',
    roles: [role.adn, role.usr], // Roles that can access this item
    contents: [
      {
        title: (
          <Link 
            className={`Sidebar__Button`}
            to={links.all}>
            <FontAwesomeIcon icon={icons.reports} />
            <p>List of Ordinances</p>
          </Link>
        ),
      },
      {
        title: (
          <Link 
            className={`Sidebar__Button`}
            to={links.draft}>
            <FontAwesomeIcon icon={icons.pencil} />
            <p>List of Draft Ordinances</p>
          </Link>
        ),
      },
      {
        title:  <Link
                  className={`Sidebar__Button`}
                  to={links.enacted}>
                    <FontAwesomeIcon icon={icons.like} />
                    <p>List of Enacted Ordinances</p>
                </Link>
      },
      {
        title:  <Link
                  className={`Sidebar__Button`}
                  to={links.approved}>
                    <FontAwesomeIcon icon={icons.check} />
                    <p>List of Approved Ordinances</p>
                </Link>
      },
      {
        title:  <Link
                  className={`Sidebar__Button`}
                  to={links.amended}>
                    <FontAwesomeIcon icon={icons.pencil} />
                    <p>List of Amended Ordinances</p>
                </Link>
      },
      {
        title:  <Link
                  className={`Sidebar__Button`}
                  to={links.vetoed}>
                    <FontAwesomeIcon icon={icons.eye} />
                    <p>List of Vetoed Ordinances</p>
                </Link>
      },
    ],
  },
  {
    title: 'Calendar',
    roles: [role.adn], // Roles that can access this item
    contents: [
      {
        title: (
          <Link 
            className={`Sidebar__Button`}
            to={links.proceedings}>
            <FontAwesomeIcon icon={icons.horn} />
            <p>Proceedings</p>
          </Link>
        ),
      },
    ],
  },
];
