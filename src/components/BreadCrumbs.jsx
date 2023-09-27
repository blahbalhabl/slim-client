import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { icons } from "../utils/Icons";
import '../styles/BreadCrumbs.css'

const BreadCrumbs = ({ items }) => {
  return (
    <nav className="BreadCrumbs">
      <ul>
        <li><FontAwesomeIcon icon={icons.house} /></li>
        {items.map((item, index) => (
          <li key={index}>
            <p> <FontAwesomeIcon icon={icons.right} /> {item.label}</p> 
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default BreadCrumbs;
