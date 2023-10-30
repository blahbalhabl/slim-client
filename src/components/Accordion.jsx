import { useEffect, useState } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { icons } from "../utils/Icons"
import '../styles/Accordion.css'

const Accordion = ({ data, collapse }) => {

	const [selected, setSelected] = useState(null);
  const [collapsed, setCollapsed] = useState('');

	const toggleAccordion = (i) => {
		if (selected === i) {
			return setSelected(null);
		}
		setSelected(i);
	};

  useEffect(() => {
    collapse ? setCollapsed('collapsed') : setCollapsed('');
  }, [collapse]);

  return (
		<>
      {data.map((item, i) => (
        <div key={i}>
          <div
            key={i}
            className={`Accordion ${collapsed}`}
            onClick={() => toggleAccordion(i)}
          >
            <div className="Accordion__Title">
                <FontAwesomeIcon icon={icons[item.title.toLowerCase()]} />
								{ !collapse && (
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
                { !collapse && (
                <div>{content.title}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
	)
};

export default Accordion