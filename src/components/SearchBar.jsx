import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TextField } from "@mui/material";
import { icons } from "../utils/Icons";
import "../styles/SearchBar.css";
import { axiosPrivate } from "../api/axios";
import useAuth from "../hooks/useAuth";

const SearchBar = ({ data, fn }) => {
  const { auth } = useAuth();
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState();
  const [ordinances, setOrdinances] = useState();
  const [unfiltered, setUnfiltered] = useState(data); // Initialize with 10 ordinances

  const getOrdinances = async () => {
    try {
      const ordinances = await axiosPrivate.get(`/search-ordinances?level=${auth.level}`);

      return ordinances.data;
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const searchTerm = e.target.value;
    setSearch(searchTerm);
    const filteredItems = ordinances.filter(
      (data) => 
        data.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        data.number.includes(searchTerm)
    )
    setFiltered(filteredItems);
  };

  useEffect(() => {
    getOrdinances()
      .then((data) => {
        setOrdinances(data);
      })
  }, [])

  useEffect(() => {
    if (search === "") {
      fn(unfiltered);
    } else {
      fn(filtered);
    }
  }, [ search ]);

  return (
    <div className="Search">
      <TextField
       label="Search"
       name="search"
       className="Search__Inputbox"
       size="small"
       onChange={handleChange}
       variant="outlined"
      />
    </div>
  );
};

export default SearchBar;
