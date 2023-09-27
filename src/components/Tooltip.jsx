import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { icons } from "../utils/Icons";
import "../styles/Tooltip.css";

const Tooltip = ({ data }) => {
  const [tooltip, setTooltip] = useState(false);
  const tooltipRef = useRef(null);

  const toggleTooltip = () => {
    setTooltip((prev) => !prev);
  };

  const handleOutsideClick = (e) => {
    if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
      setTooltip(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <>
      {data.map((item, i) => (
        <div key={i}>
          <div className="Tooltip" onClick={toggleTooltip}>
            <FontAwesomeIcon icon={icons.v} />
          </div>
          {tooltip && (
            <div className="Tooltip__Body" ref={tooltipRef}>
              <div key={i}>
                <ul onClick={toggleTooltip} className="Tooltip__Buttons">
                  {item.buttons}
                </ul>
              </div>
            </div>
          )}
        </div>
      ))}
    </>
  );
};

export default Tooltip;
