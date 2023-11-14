import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { icons } from "../utils/Icons";
import '../styles/Accordion.css';

const Accordion = ({ data, collapse, userRole }) => {
  const location = useLocation();

  const [selected, setSelected] = useState(null);
  const [collapsed, setCollapsed] = useState('');

  const links = {
    rec: '/records',
    cal: '/proceedings',
  };

  const toggleAccordion = (i) => {
    if (selected === i) {
      return setSelected(null);
    }
    setSelected(i);
  };

  const isActive = (i) => {
    if (i === 0 && location.pathname.includes(links.rec)) {
      return ' active color';
    } else if (i === 1 && location.pathname.includes(links.cal)) {
      return ' active color';
    } else {
      return '';
    };
  };

  useEffect(() => {
    collapse ? setCollapsed(' collapsed') : setCollapsed('');
  }, [collapse]);

  return (
    <>
      {userRole && data.map((item, i) => (
        <div key={i}>
          {item.roles.includes(userRole) && (
            <div>
              <div
                className={`Accordion${collapsed}${isActive(i)}`}
                onClick={() => toggleAccordion(i)}
              >
                <div className="Accordion__Title">
                  <FontAwesomeIcon icon={icons[item.title.toLowerCase()]} />
                  {!collapse && (
                    <>
                      <div className="Accordion__Text">{item.title}</div>
                      <span className="Accordion__Icon">
                        {selected === i ? <FontAwesomeIcon icon={icons.left} /> : <FontAwesomeIcon icon={icons.down} />}
                      </span>
                    </>
                  )}
                </div>
                {/* Mobile Accordion */}
                <span>
                  <div
                    className={
                      selected === i
                        ? 'Accordion__Mobile__Content active'
                        : 'Accordion__Mobile__Content'
                    }
                  >
                    {item.contents.map((content, j) => (
                      <div key={j}>
                        <div>{content.title}</div>
                      </div>
                    ))}
                  </div>
                </span>
                {/* End of Mobile Accordion */}
              </div>
              <div
                className={
                  selected === i
                    ? 'Accordion__Content active'
                    : 'Accordion__Content'
                }
              >
                {item.contents.map((content, j) => (
                  <div key={j}>
                    {!collapse && (
                      <div>{content.title}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </>
  );
};

export default Accordion;
