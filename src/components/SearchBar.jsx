import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { icons } from "../utils/Icons";
import "../styles/SearchBar.css";

const SearchBar = ({ data, fn }) => {
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState();
  const [unfiltered, setUnfiltered] = useState(data); // Initialize with all ordinances

  const handleChange = (e) => {
    const searchTerm = e.target.value;
    setSearch(searchTerm);
    const filteredItems = data.filter(
      (data) =>
        data.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        data.number.includes(searchTerm)
    );
    setFiltered(filteredItems);
  };

  useEffect(() => {
    if (search === "") {
      fn(unfiltered);
    } else {
      fn(filtered);
    }
  }, [ search ]);

  return (
    <div className="Search">
      <input
        type="text"
        id="search"
        name="search"
        className="Search__Inputbox"
        placeholder="Search Ordinance"
        onChange={handleChange}
      />
      <span>
        <FontAwesomeIcon icon={icons.search} />
      </span>
    </div>
  );
};

export default SearchBar;
