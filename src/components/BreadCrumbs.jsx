import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { icons } from "../utils/Icons";
import '../styles/BreadCrumbs.css'

const BreadCrumbs = ({ items }) => {
  const nav = useNavigate();
  return (
    <nav className="BreadCrumbs">
      <ul>
        <li onClick={() =>  nav('/')}>
          <FontAwesomeIcon icon={icons.house} />
        </li>
        {items.map((item, index) => (
          <li key={index} className="BreadCrumbs__Content">
            <p className="BreadCrumbs__List">
              <FontAwesomeIcon icon={icons.chevRight} />
              <label>{item.label}</label>
            </p> 
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default BreadCrumbs;
