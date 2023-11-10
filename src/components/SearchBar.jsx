import { useEffect, useState } from "react";
import { TextField } from "@mui/material";
import { axiosPrivate } from "../api/axios";
import "../styles/SearchBar.css";

const SearchBar = ({ data, fn }) => {
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState(null);
  const [ordinances, setOrdinances] = useState(null);
  const [unfiltered, setUnfiltered] = useState(data); // Initialize with 10 ordinances

  const getOrdinances = async () => {
    try {
      const ordinances = await axiosPrivate.get(`/search-ordinances`);

      return ordinances.data;
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearch(searchTerm);
    const filteredItems = ordinances.filter(
      (data) => 
        data.title.toLowerCase().includes(searchTerm) ||
        data.number.includes(searchTerm) ||
        data.status.toLowerCase().includes(searchTerm)
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
