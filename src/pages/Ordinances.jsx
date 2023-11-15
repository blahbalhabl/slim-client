import { useEffect, useState } from 'react';
import { Form, useLocation, useParams } from 'react-router-dom';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import useAuth from '../hooks/useAuth';
import CreateOrdinances from '../components/CreateOrdinances';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import BreadCrumbs from '../components/BreadCrumbs';
import SearchBar from '../components/SearchBar';
import Alert from '../components/Alert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  Pagination, 
  TextField, 
  FormControl, 
  InputLabel, 
  MenuItem, 
  Select } from '@mui/material';
import { icons } from '../utils/Icons'
import '../styles/Ordinances.css'
import { roles } from '../utils/userRoles';

const Ordinances = () => {
  const { auth, reload, setReload } = useAuth();
  const { status } = useParams();
  const location = useLocation();
  const axiosPrivate = useAxiosPrivate();
  const [loading, setLoading] = useState(true);
  const [ordinances, setOrdinances] = useState();
  const [members, setMembers] = useState();
  const [isEditing, setIsEditing] = useState(true);
  const [pdfUrl, setPdfUrl] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [minutesUrl, setMinutesUrl] = useState('');
  const [minutes, setMinutes] = useState();
  const [file, setFile] = useState();
  const [addMinutes, setAddMinutes] = useState();
  const [collapsed, setCollapsed] = useState(true);
  const [minCollapsed, setMinCollapsed] = useState(true);
  const [selectedOrdinance, setSelectedOrdinance] = useState(null);
  const [isDateChanged, setDateChanged] = useState(false);
  const [delInputs, setDelInputs] = useState({});
  const [series, setSeries] = useState(null);
  const [currentSeries, setCurrentSeries] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [fileName, setFileName] = useState(null);
  const [serverMessage, setServerMessage] = useState('');
  const [severity, setSeverity] = useState(null);
  const [proceedingDate, setProceedingDate] = useState({});
  const [editingMinutes, setEditingMinutes] = useState(false);
  const [inputs, setInputs] = useState({
    date: "",
    agenda: "",
    description: "",
    speaker: "",
  });

  const level = roles.level;
  const role = roles.role;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [delModalOpen, setDelModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false); 
    setSelectedItem(null); 
    setEditingMinutes(false); 
    setFileName('');
  }
  const openDelModal = (e) => 
    {
      e.preventDefault();
      setDelModalOpen(true)
    }
  const closeDelModal = () => setDelModalOpen(false);
  const pathnames = location.pathname.split('/').filter((item) => item !== '');

  const breadcrumbs = pathnames.map((name, index) => ({
    label: name,
    url: `/${pathnames.slice(0, index + 1).join('/')}`,
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => {
      return { ...prev, [name]: value };
    });
  };

  const handleDelChange = (e) => {
    const { name, value } = e.target;
    setDelInputs((prev) => {
      return { ...prev, [name]: value };
    });
  };

  const handleFileChange = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    setFileName(e.target.files[0].name);
    setFile(file);
  };

  const sendRequest = async (page, series) => {
    try {
      let ordinances, url;
      
      if (series) {
        url = `/ordinances?type=ordinances&status=${status}&page=${page}&series=${series}`;
      } else {
        url = `/ordinances?type=ordinances&status=${status}&page=${page}`
      }

      ordinances = await axiosPrivate.get(url);
      const members = await axiosPrivate.get('/sanggunian-members');

      return {
        ordinances: ordinances.data.ordinances,
        members: members.data,
        series: ordinances.data.series,
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  };  

  const handleDownload = async (accessLevel, filename, series) => {
    try {
      const response = await axiosPrivate.get(`/download/${filename}?type=ordinances&series=${series}&acl=${accessLevel}`, {
        responseType: 'blob', // Set the response type to 'blob' to handle binary data
      });
      // Create a blob object from the binary data
      const blob = new Blob([response.data]);
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      // Create a link element to trigger the download
      const fileLink = document.createElement('a');
      fileLink.href = url;
      fileLink.download = filename;
      fileLink.click();
      // Clean up the URL created for the blob
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.log(err);
    }
  };

  const handleProceedingChange = (e) => {
    const { name, value } = e.target;

    setProceedingDate((prev) => ({
      ...prev,
      [name]: value,
    }));
    setDateChanged(true); 
  };

  const handleChangeProceedingDate = async (e, filename) => {
    try {
      e.preventDefault();
      const res = await axiosPrivate.post(`/update-proceedings/${filename}`, proceedingDate, {
        headers: {'Content-Type': 'application/json'}
      });
    } catch (err) {
      console.error(err);
    }
  }
 
  const handleOrdinanceClick = async (ordinance) => {
    try {
      setSelectedOrdinance(ordinance);
      const minutes = await axiosPrivate.get(`/minutes/${ordinance._id}`);
      setMinutes(minutes.data);
      
      if (minutes.data.length === 0) {
        setMinutes(null);
      };

      const response = await axiosPrivate.get(`/view/${ordinance.file}?type=ordinances&series=${ordinance.series}&acl=${ordinance.accessLevel}`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      // Get Minutes of the meeting related to the clicked ordinance
      openModal();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectMinutes = async (minute) => {
    try {
      setSelectedItem(minute);
      const minResponse = await axiosPrivate.get(`/download/${minute.file}?type=minutes&series=${selectedOrdinance.series}`, {
        responseType: 'blob',
      });
      const blobMin = new Blob([minResponse.data], { type: 'application/pdf' });
      const urlMin = window.URL.createObjectURL(blobMin);
      setMinutesUrl(urlMin);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadMinutes = async (e, id, series) => {
    e.preventDefault();
    try {
      const minuteData = new FormData();
        minuteData.append('date', inputs.date);
        minuteData.append('agenda', inputs.agenda);
        minuteData.append('description', inputs.description);
        minuteData.append('speaker', inputs.speaker);
        minuteData.append('series', series);
        minuteData.append('type', 'minutes');
        minuteData.append('file', file);
        const res = await axiosPrivate.post(`/upload-minutes?type=minutes&ordinanceId=${id}`, minuteData, {
          headers: {'Content-Type': 'multipart/form-data'}
        })
        setServerMessage(res.data.message);
        setSeverity(res.status)
        setReload(true);
        closeModal();
    } catch (err) {
      setServerMessage(err.response.data.message);
      setSeverity(err.response.status);
    }
  };

  const handleUpdateOrdinance = async (e, filename, series) => {
    try {
      e.preventDefault();
      setIsEditing(!isEditing);
      setDateChanged(false);

      const updateData = new FormData();
      const ordinance = selectedOrdinance;

      for (const [key, value] of Object.entries(ordinance)) {
        if (value) {
          updateData.append(key, value);
        }
      };
      updateData.append('file', file);

      const res = await axiosPrivate.post(`/update-ordinance/${filename}?type=ordinances&series=${series}`, updateData, {
        headers: {'Content-Type': 'multipart/form-data'}
      });
      setServerMessage(res.data.message);
      setSeverity(res.status)
      setReload(true);
      closeModal();
    } catch (err) {
      setServerMessage(err.response.data.message);
      setSeverity(err.response.status)
    }
  };

  const handleDeleteOrdinance = async (e) => {
    e.preventDefault();
    try {
      // Authenticate User using password, or with google authenticator
      const deletePass = delInputs.deletepassword;
      const res = await axiosPrivate.post(`/check-pass`, {deletePass}, {
        headers: {'Content-Type': 'application/json'}
      })
      if(res.status === 200) {
        const res = await axiosPrivate.delete(`/delete-ordinance/${selectedOrdinance.file}?type=ordinances&series=${selectedOrdinance.series}`)
          .then(() => {
            setReload(true);
            closeModal();
            closeDelModal();
            setServerMessage(res.data.message);
            setSeverity(res.status);
          })
      }
    } catch (err) {
      setServerMessage(err.response.data.message);
      setSeverity(err.response.status);
    }
  };

  const handlePageChange = (e, value) => {
    setCurrentPage(value);
    sendRequest(value, currentSeries)
      .then(({ordinances}) => {
        setOrdinances(ordinances);
      })
  };

  const handleSeriesChange = (e) => {
    const series = e.target.value;
    setCurrentSeries(series);
    sendRequest(undefined, series)
      .then(({ordinances}) => {
        setOrdinances(ordinances);
      });
  };

  const formatDate = (date) => {
    const newDate = new Date(date);
    const options = {
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    const formattedDate = newDate.toLocaleString(undefined, options);
    return formattedDate;
  };

  const ordStatus = (ordinance) => {
    switch (ordinance) {
      case 'draft':
        return ' Draft';
      case 'enacted':
        return ' Enacted';
      case 'approved':
        return ' Approved';
      case 'amended':
        return ' Amended';
      case 'vetoed':
        return ' Vetoed';
      case 'pending':
        return ' Pending';
      default:
        return ' Black';
    }
  };

  const handleMinuteChange = (e) => {
    const { name, value } = e.target;
    setSelectedItem((prevSelectedItem) => ({
      ...prevSelectedItem,
      [name]: value,
    }));
  };

  const handleUpdateMinutes = async (e, filename, series, id) => {
    try {
      e.preventDefault();

      const updateData = new FormData();
      const minutes = selectedItem;

      for (const [key, value] of Object.entries(minutes)) {
        if (value) {
          updateData.append(key, value);
        }
      };
      updateData.append('file', file);

      const res = await axiosPrivate.post(`/update-minutes?fileName=${filename}&type=minutes&series=${series}&id=${id}`, updateData);

      setServerMessage(res.data.message);
      setSeverity(res.status)
      setReload(true);
      closeModal();
    } catch (err) {
      setServerMessage(err.response.data.message);
      setSeverity(err.response.status);
    }
  };

  // useEffect(() => {
  //   // Retrieve the current page from local storage on component mount
  //   const storedPage = localStorage.getItem('currentPage');
  //   if (storedPage) {
  //     setCurrentPage(parseInt(storedPage, 10));
  //   }
  // }, []);

  // useEffect(() => {
  //   // Store the current page in local storage whenever it changes
  //   localStorage.setItem('currentPage', currentPage?.toString());
  // }, [currentPage]);

  useEffect(() => {
    const storedSeries = localStorage.getItem('currentSeries');

    sendRequest(1, storedSeries || currentSeries)
      .then(({
        ordinances,
        members,
        series,
      }) => {
        setOrdinances(ordinances);
        setMembers(members);
        setSeries(series);
        setCurrentSeries(storedSeries || currentSeries || series.slice(-1)[0]);
        // setCurrentPage(storedPage);
      })
      .catch((err) => {
        console.error(err)
      });
    setReload(false);
  }, [ reload ]);

  useEffect(() => {
    document.title = `SLIM | ${status} Ordinances`;
    setLoading(true);

    // Check if there is a stored series value
    const storedSeries = localStorage.getItem('currentSeries');
    // const storedPage = localStorage.getItem('currentPage');

    sendRequest(1, storedSeries || currentSeries)
      .then(({
        ordinances,
        members,
        series,
      }) => {
        setOrdinances(ordinances);
        setMembers(members);
        setSeries(series);
        setCurrentSeries(storedSeries || currentSeries || series.slice(-1)[0]);
        // setCurrentPage(storedPage);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
    setReload(false);
  },[ status ]);

  useEffect(() => {
    if (!initialLoad) {
      // Save the current series value to localStorage when it changes
      localStorage.setItem('currentSeries', currentSeries);
      // localStorage.setItem('currentPage', currentPage);
    } else {
      // Set initialLoad to false after the first render
      setInitialLoad(false);
    }
  }, [currentSeries, currentPage]);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
    <div className="Ordinances">
      <BreadCrumbs items={breadcrumbs} />
      <div className="Ordinances__Card">
        <CreateOrdinances sendRequest={sendRequest} />
      </div>
      <div className="Ordinances__Container">
        <div className="Ordinances__Legend">
          <h4>Legend:</h4>
          <div>
            <div style={{backgroundColor: 'orange'}}></div>
            <p>Draft</p>
          </div>
          <div>
            <div style={{backgroundColor: 'green'}}></div>
            <p>Enacted</p>
          </div>
          <div>
            <div style={{backgroundColor: 'blue'}}></div>
            <p>Approved</p>
          </div>
          <div>
            <div style={{backgroundColor: 'red'}}></div>
            <p>Amended</p>
          </div>
        </div>
        <div className="Ordinances__Content">
          <div className="Ordinances__Top__Header">
            <span className='Ordinances__Type__Container'>
              <h3>{status.toUpperCase()} ORDINANCES</h3>
              <div className='Ordinances__Series'>
                <FormControl fullWidth>
                  <InputLabel id="ordinance-id">Series</InputLabel>
                  <Select
                    labelId="ordinance-id"
                    id="ordinance-id"
                    label="Series"
                    value={currentSeries}
                    size='small'
                    onChange={(e) => handleSeriesChange(e)}
                  >
                    {series && series.map((item, i) => (
                      <MenuItem 
                        key={i} 
                        value={item}>
                          {item}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </span>
            <SearchBar data={ordinances} fn={setOrdinances} />
          </div>
          <table className='Ordinances__Table'>
            <thead>
              <tr className="Ordinances__Header">
                <th>Type</th>
                <th>Title</th>
                <th>Status</th>
                <th>Date</th>
                <th>Size</th>
                <th></th>
              </tr>
            </thead>
            <tbody className='Ordinances__Data'>
            { ordinances && ordinances.length > 0 ? (
              ordinances.map((ordinance, i) => (
                ((ordinance.status === status || status === 'all') 
                  || (ordinance.accessLevel === auth.level) 
                  || (ordinances.accessLevel === level.dlg)) && (
                  <tr
                    key={i}
                    className='Ordinances__Link'
                    >
                    <td 
                      data-cell='type'
                      onClick={() => handleOrdinanceClick(ordinance)}
                      className={`Ordinances__Status${ordStatus(ordinance.status)}`}>
                      { ordinance.mimetype === 'application/pdf' && (<FontAwesomeIcon icon={icons.pdf}/>)}
                    </td>
                    <td
                      data-cell='number' 
                      className='Ordinances__Number' onClick={() => handleOrdinanceClick(ordinance)}
                    >
                        <p>ORDINANCE NO {ordinance.number}, Series of {ordinance.series} {ordinance.title.toUpperCase()}</p>
                    </td>
                    <td 
                      data-cell='status' 
                      className={`Ordinances__Status${ordStatus(ordinance.status)}`}
                      onClick={() => handleOrdinanceClick(ordinance)}
                      >
                      <p>{ordinance.status.toUpperCase()}</p>
                    </td>
                    <td
                      data-cell='date'
                      className='Ordinances__Date'
                      onClick={() => handleOrdinanceClick(ordinance)}>
                        {formatDate(ordinance.createdAt)}
                    </td>
                    <td data-cell='size' onClick={() => handleOrdinanceClick(ordinance)}>
                      { ordinance.size } k
                    </td>
                    <td
                      data-cell='download' 
                      className={`Ordinances__Center Ordinances__Status${ordStatus(ordinance.status)}`}>
                      <FontAwesomeIcon 
                        className='Ordinances__Download'
                        onClick={() => handleDownload(ordinance.accessLevel, ordinance.file, ordinance.series)}
                        icon={icons.download} />
                    </td>
                  </tr>
                )))
              ) : (
                <tr>
                  <td>No {status} Ordinances</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className='Ordinances__Pagination'>
            <Pagination 
              count={10} //Dyanmically change
              variant="outlined" 
              color='primary'
              value={currentPage}
              onChange={(e, value) => handlePageChange(e, value)}
            />
          </div>
        </div>
      </div>
      <Alert severity={severity} message={serverMessage} onClose={() => setServerMessage('')}/>
    </div>
    {selectedOrdinance && (
        <Modal isOpen={isModalOpen} closeModal={closeModal}>
          <div className="Ordinances__Details">
          <h2>ORDINANCE DETAILS</h2>
            <form className='Ordinances__Details__Form'>
              <div className="Ordinances__Details__Title">
                <label htmlFor="number">ORDINANCE NO 
                  <input
                    className={`Ordinances__Details__Title__Input ${isEditing ? '' : 'editing'}`}
                    type="number"
                    name="number"
                    id="number"
                    value={selectedOrdinance.number}
                    onChange={(e) => setSelectedOrdinance({...selectedOrdinance, number: e.target.value})} 
                    readOnly={isEditing}
                  />
                </label>
                <label htmlFor="series">Series of
                  <input
                    className={`Ordinances__Details__Title__Input ${isEditing ? '' : 'editing'}`}
                    type="number"
                    name="series"
                    id="series"
                    value={selectedOrdinance.series}
                    onChange={(e) => setSelectedOrdinance({...selectedOrdinance, series: e.target.value})}
                    readOnly={isEditing}
                  />
                </label>
                <label htmlFor="title">Title: 
                  <input
                    className={`Ordinances__Details__Title__Input ${isEditing ? '' : 'editing'}`}
                    type="text"
                    name='title'
                    id='title'
                    value={selectedOrdinance.title}
                    onChange={(e) => setSelectedOrdinance({...selectedOrdinance, title: e.target.value})}
                    readOnly={isEditing}
                  />
                </label>
                <label htmlFor="status">Status:
                  <select
                    className={`Ordinances__Details__Title__Input ${isEditing ? '' : 'editing'}`}
                    name='status'
                    id='status'
                    value={selectedOrdinance.status}
                    onChange={(e) => setSelectedOrdinance({...selectedOrdinance, status: e.target.value})}
                    disabled={isEditing}>
                      <option value="draft">Draft</option>
                      <option value="pending">Pending</option>
                      <option value="enacted">Enacted</option>
                      <option value="approved">Approved</option>
                      <option value="amended">Amended</option>
                      <option value="vetoed">Vetoed</option>
                  </select>
                </label>
                <label htmlFor="author">Author:
                  <select
                    className={`Ordinances__Details__Title__Input ${isEditing ? '' : 'editing'}`}
                    name='author'
                    id='author'
                    value={selectedOrdinance.author}
                    onChange={(e) =>setSelectedOrdinance({ ...selectedOrdinance, author: e.target.value })}
                    disabled={isEditing}
                  >
                    {members
                      .filter((member) => member.name !== selectedOrdinance.coAuthor)
                      .map((member, i) => (
                      <option
                        key={i}
                        value={member.name}
                      >
                        {member.name}
                      </option>
                    ))}
                  </select>
                </label>
                {selectedOrdinance.coAuthor && (
                  <label htmlFor="author">Co-Author:
                    <select
                      className={`Ordinances__Details__Title__Input ${isEditing ? '' : 'editing'}`}
                      name='author'
                      id='author'
                      value={selectedOrdinance.coAuthor}
                      onChange={(e) =>setSelectedOrdinance({ ...selectedOrdinance, coAuthor: e.target.value })}
                      disabled={isEditing}
                    >
                      {members
                        .filter((member) => member.name !== selectedOrdinance.author)
                        .map((member, i) => (
                        <option
                          key={i}
                          value={member.name}
                        >
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
              <div>
                {!isEditing && (
                  <label htmlFor="file">Select File:
                    <input 
                      type="file"
                      name='file'
                      id='file'
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>
              <div className="Ordinances__Details__Content">
                {(auth.level !== level.dlg) && (auth.role === role.adn) && (
                  <div>
                    <button 
                      className="Ordinances__Edit__Button" 
                      onClick={(e) => {e.preventDefault(); setIsEditing(!isEditing)}}>
                        <FontAwesomeIcon icon={icons.pencil} /> Edit
                    </button>
                    {!isEditing && (
                      <button 
                        className='Ordinances__Delete__Button'
                        onClick={(e) => openDelModal(e)}
                        >
                          <FontAwesomeIcon icon={icons.trash}/> Delete
                      </button>
                    )}
                  </div>
                )}
                {!isEditing && (
                  <div className='Ordinances__Button__Group'>
                    <button
                      className='Ordinances__Cancel__Button'
                      onClick={(e) => {e.preventDefault(); setIsEditing(!isEditing)}}>
                        Cancel
                    </button>
                    <button
                      className='Ordinances__Update__Button'
                      onClick={(e) => handleUpdateOrdinance(e, selectedOrdinance.file, selectedOrdinance.series)}>
                        Update
                    </button>
                  </div>
                )}
             </div>
            </form>
            { (selectedOrdinance.status === 'draft' || selectedOrdinance.status === 'pending') &&
              (auth.level !== level.dlg && auth.role === role.adn)
             ? (
            <div className="Ordinances__Details__Proceedings">
              <label htmlFor="proceeding">Next Proceeding Schedule: 
                <input
                  className='Ordinances__Details__Proceedings__Input'
                  type="datetime-local"
                  name='proceeding'
                  id='proceeding'
                  value={proceedingDate.proceeding || ''}
                  onChange={handleProceedingChange}
                />
              </label>
              <span> to</span>
              <input 
                className='Ordinances__Details__Proceedings__Input'
                type="datetime-local"
                name='endTime'
                value={proceedingDate.endTime || ''}
                onChange={handleProceedingChange}/>
              {isDateChanged && (
                <button
                  className='Ordinances__Details__Proceedings__Button'
                  onClick={(e) => handleChangeProceedingDate(e, selectedOrdinance.file)}
                  >Update
                </button>
              )}
            </div>
            ) : null }
            { (selectedOrdinance.status === 'draft' || selectedOrdinance.status === 'pending') && (
            <div className='Ordinances__Card__Container'>
              <div className='Ordinances__Proceedings'>
                <h3>Proceedings</h3>
                <p>Proceedings of the Sangguniang Bayan of the Municipality of Bacolor, Province of Pampanga, held at the Session Hall on 
                <strong>
                  {formatDate(selectedOrdinance.proceedings)} to
                  {formatDate(selectedOrdinance?.endTime).split(',')[3]}
                </strong>
                </p>
              </div>
            </div>
            )}
            <div className="Ordinances__PDFViewer">
              <div className="Ordinances__Card__Container">
                <div
                  className='Ordinances__PDFViewer__Button'
                  onClick={() => setCollapsed(!collapsed)}>
                  <p>Click to View Ordinance File</p>
                  {collapsed ? (<FontAwesomeIcon icon={icons.v}/>) : (<FontAwesomeIcon icon={icons.left}/>)}
                </div>
                <iframe
                  className={`Ordinances__PDFViewer__Frame ${collapsed ? 'collapsed' : ''}`}
                  title="PDF Viewer"
                  src={pdfUrl} // Set the PDF file URL as the iframe source
                />
              </div>
            </div>
            <div className="Ordinances__Minutes__Container">
              <h3>Minutes of the Meetings for {selectedOrdinance.title}</h3>
              <div className='Ordinances__Minutes__Buttons'>
                <div className='Ordinances__Minutes__Group'>
                    <FormControl fullWidth>
                      <InputLabel id="minutes">Select Minutes</InputLabel>
                      <Select
                        labelId="minutes"
                        id="demo-simple-select"
                        label="Select Minutes"
                        value={selectedItem?.date}
                        onChange={handleChange}
                      >
                        {minutes ? 
                          (minutes.map((minute, i) => (
                          <MenuItem
                            className='Ordinances__Minutes__List'
                            key={i}
                            value={minute}
                            onClick={() => handleSelectMinutes(minute)}>
                              {formatDate(minute.date)}
                          </MenuItem>
                          ))) : 
                          ( <MenuItem>No Minutes</MenuItem> )
                        }
                      </Select>
                    </FormControl>
                    { (auth.level !== level.dlg) && 
                      (auth.level !== level.dlg && auth.role === role.adn) && (
                        <button
                          className='Ordinances__Minutes__Add'
                          onClick={() => setAddMinutes(!addMinutes)}>
                          {!addMinutes ? (<FontAwesomeIcon icon={icons.plus} />) : (<FontAwesomeIcon icon={icons.burger} />)}
                        </button>
                    )}
                  </div>
                { (auth.level !== level.dlg && auth.role === role.adn) &&
                  addMinutes && (
                <div className='Ordinances__Minutes__Input__Container'>
                  <div className='Ordinances__Minutes__Inputs'>
                    <div className='Ordinances__Minutes__Card'>
                      <label htmlFor="date">Date</label>
                      <input
                        className='Ordinances__Minutes__Date__Input'
                        type="datetime-local"
                        name='date'
                        id='date'
                        onChange={handleChange}
                        required
                      />
                      <TextField
                        name='agenda'
                        label="Agenda"
                        variant="outlined" 
                        onChange={handleChange}
                        required/>
                      <TextField
                        name='speaker'
                        label="Speaker"
                        variant="outlined" 
                        onChange={handleChange}
                        required/>
                      <TextField
                        name='description'
                        label="Agenda"
                        variant="outlined" 
                        onChange={handleChange}
                        required/>
                    </div>
                    <div className='Ordinances__Minutes__Card'>
                      <textarea
                        className='Ordinances__TextArea'
                        rows={20}
                        placeholder='Desription'
                        name='description'
                        id='description'
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className='Ordinances__File'>
                    <label htmlFor="file">{fileName ? (`File:  ${fileName}`) : ('Select File')}
                      <input hidden type="file" name='file' id='file' onChange={handleFileChange} required/>
                    </label>
                    {fileName ? (
                          <button
                            className='Ordinances__File__Remove'
                            onClick={() => {
                              document.getElementById('file').value = ''; // Clear file selection
                              setFileName('') // Perform your additional removeFile logic
                            }}>
                              x
                          </button>
                        ) : (
                          ''
                        )}
                  </div>
                  <button 
                    className={`Ordinances__Upload__Button ${!fileName}`}
                    onClick={(e) => handleUploadMinutes(e, selectedOrdinance._id, selectedOrdinance.series)} 
                    disabled={!fileName}>
                      Upload
                  </button>
                </div>
              )}
              </div>
              {selectedItem && minutes && (
                <div>
                  <div className='Ordinances__Minutes__Data'>
                    <div className='Ordinances__Minutes__Details'> 
                      <span>
                        <strong>Date:</strong> 
                        { 
                        !editingMinutes 
                          ? (formatDate(selectedItem.date)) 
                          : (<input 
                              className='Ordinances__Minutes__Date'
                              type="datetime-local"
                              name='date'
                              value={selectedItem.date.slice(0, 16)}
                              onChange={handleMinuteChange}/>)
                        }
                      </span>
                      <span>
                        <strong>Agenda:</strong>
                        {!editingMinutes 
                          ? (selectedItem.agenda)
                          : (
                            <TextField
                              fullWidth
                              className='Ordinances__Minutes__Input__Box'
                              id="agenda" 
                              name='agenda' 
                              value={selectedItem.agenda} 
                              variant="standard" 
                              onChange={handleMinuteChange}/>
                          )
                        }
                      </span>
                      <span>
                        <strong>Speaker:</strong>
                        {!editingMinutes
                          ? (selectedItem.speaker)
                          : ( 
                            <TextField
                              fullWidth
                              id="speaker" 
                              name='speaker' 
                              value={selectedItem.speaker} 
                              variant="standard" 
                              onChange={handleMinuteChange}/>
                            )
                        }
                      </span>
                      <span>
                        <strong>Description:</strong>
                        {!editingMinutes 
                        ? (selectedItem.description)
                        : (<textarea
                            className='Ordinances__Minutes__TextArea'
                            columns={50}
                            rows={10}
                            name='description'
                            value={selectedItem.description}
                            onChange={handleMinuteChange}/>)
                        }
                      </span>
                      {editingMinutes && (
                        <span>
                          <strong>Select File:</strong>
                          <label 
                            htmlFor="minute-file"
                            className='Ordinances__Minute__File__Input'>
                            Click Here
                            <input type="file" id='minute-file' onChange={handleFileChange} hidden/>
                          </label>
                          {fileName && (<p>{fileName}</p>)}
                          {fileName && (
                            <button
                              className='Ordinances__File__Remove'
                              onClick={() => {
                                document.getElementById('minute-file').value = ''; // Clear file selection
                                setFileName('') // Perform your additional removeFile logic
                              }}>
                                x
                            </button>
                          )}
                          <button onClick={(e) => handleUpdateMinutes(e, selectedItem.file, selectedItem.series, selectedItem._id)}>Update</button>
                        </span>
                      )}
                    </div>
                    <div>
                      <button
                        className='Ordinances__Minutes Edit'
                        onClick={() => setEditingMinutes(!editingMinutes)}
                      >
                        {!editingMinutes ? (
                          <span><FontAwesomeIcon icon={icons.pencil} /> Edit</span>
                        ) : (
                          <span>Cancel</span>
                        )}
                      </button>
                      {editingMinutes && (
                        <button
                          className='Ordinances__Minutes Delete'
                          onClick={() => setEditingMinutes(!editingMinutes)}
                        >
                          <FontAwesomeIcon icon={icons.trash} /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="Ordinances__Card__Container">
                    <div
                      className='Ordinances__PDFViewer__Button'
                      onClick={() => setMinCollapsed(!minCollapsed)}>
                      <p>Click to View Minutes File</p>
                      {minCollapsed ? (<FontAwesomeIcon icon={icons.v}/>) : (<FontAwesomeIcon icon={icons.left}/>)}
                    </div>
                    <iframe
                      className={`Ordinances__Minutes__Frame ${minCollapsed ? 'collapsed' : ''}`}
                      title="PDF Viewer"
                      src={minutesUrl} // Set the PDF file URL as the iframe source
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
      <Modal isOpen={delModalOpen} closeModal={closeDelModal}>
        <div className="Ordinances__Delete__Modal">
          <h3>Warning! You cannot undo this action! </h3>
          <div className='Ordinances__Delete__Modal__Container'>
            <TextField
              className='Ordinances__Delete__Modal__Input'
              name='deletepassword'
              label="Enter Password"
              type='password'
              variant="outlined" 
              onChange={handleDelChange}/>
            <button 
              className='Ordinances__Delete__Modal__Button'
              onClick={(e) => handleDeleteOrdinance(e)}>
              Delete
            </button>
          </div>
          
          {(auth.otp && delInputs?.deletepassword) && (
            <TextField
              className='Ordinances__Delete__Modal__Input'
              name='deleteotp'
              label="Enter OTP"
              type='number'
              variant="outlined"
              onChange={handleDelChange}/>
          )}
        </div>
      </Modal>
    </>
  );
};

export default Ordinances;