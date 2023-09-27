import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import useAuth from '../hooks/useAuth';
import CreateOrdinances from '../components/CreateOrdinances';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import BreadCrumbs from '../components/BreadCrumbs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { icons } from '../utils/Icons'
import '../styles/Ordinances.css'

const Ordinances = () => {
  const { auth } = useAuth();
  const { status } = useParams();
  const location = useLocation();
  const axiosPrivate = useAxiosPrivate();
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(true);
  const [ordinances, setOrdinances] = useState();
  const [isEditing, setIsEditing] = useState(true);
  const [dropDown, setDropdown] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [minutesUrl, setMinutesUrl] = useState('');
  const [minutes, setMinutes] = useState();
  const [file, setFile] = useState();
  const [addMinutes, setAddMinutes] = useState();
  const [collapsed, setCollapsed] = useState(true);
  const [minCollapsed, setMinCollapsed] = useState(true);
  const [selectedOrdinance, setSelectedOrdinance] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [isDateChanged, setDateChanged] = useState(false);
  const [inputs, setInputs] = useState({
    date: "",
    agenda: "",
    description: "",
    speaker: ""
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {setIsModalOpen(false); setDropdown(false)}
  const [delModalOpen, setDelModalOpen] = useState(false);
  const openDelModal = () => setDelModalOpen(true);
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

  const handleFileChange = (e) => {
    e.preventDefault();
    console.log(e.target.files[0]);
    const file = e.target.files[0];
    setFile(file);
  };

  const sendRequest = async () => {
    try {
      const res = await axiosPrivate.get(`/ordinances?type=ordinances&level=${auth.level}&status=${status}`);
      const ordinances = res.data;
      return {
        ordinances: ordinances,
      }
    } catch (err) {
      console.log(err)
    }
  }

  const handleDownload = async (filename, series) => {
    try {
      const response = await axiosPrivate.get(`/download/${filename}?type=ordinances&level=${auth.level}&series=${series}`, {
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
    setSelectedOrdinance({ ...selectedOrdinance, proceedings: e.target.value });
    setDateChanged(true); 
  };

  const handleChangeProceedingDate = async (e, filename) => {
    try {
      e.preventDefault();
      const proceedings = selectedOrdinance.proceedings;
      console.log(proceedings)

      const res = await axiosPrivate.post(`/update-proceedings/${filename}?level=${auth.level}`, {proceedings}, {
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

      const response = await axiosPrivate.get(`/download/${ordinance.file}?type=ordinances&level=${auth.level}&series=${ordinance.series}`, {
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
      const minResponse = await axiosPrivate.get(`/download/${minute.file}?type=minutes&level=${auth.level}&series=${selectedOrdinance.series}`, {
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
        minuteData.append('level', auth.level);
        minuteData.append('file', file);
        const res = await axiosPrivate.post(`/upload-minutes?type=minutes&ordinanceId=${id}`, minuteData, {
          headers: {'Content-Type': 'multipart/form-data'}
        })
  
        if (res.status === 200 || 401) {
          setMessage(res.data.message);
        } else {
          setMessage('Error on Uploading Ordinance')
        }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrdinance = async (e, filename, series) => {
    try {
      e.preventDefault();
      setIsEditing(!isEditing);
      setDateChanged(false);

      const updateData = new FormData();
      updateData.append('level', auth.level);
      updateData.append('number', selectedOrdinance.number);
      updateData.append('series', selectedOrdinance.series);
      updateData.append('title', selectedOrdinance.title);
      updateData.append('status', selectedOrdinance.status);
      updateData.append('author', selectedOrdinance.author);
      updateData.append('proceedings', selectedOrdinance.proceedings);
      updateData.append('file', file);

      const res = await axiosPrivate.put(`/update-ordinance/${filename}?type=ordinances&level=${auth.level}&series=${series}`, updateData, {
        headers: {'Content-Type': 'multipart/form-data'}
      });
      if(res.status === 200) {
        setMessage(res.data.message);
      } else {
        setMessage('Error on Updating Ordinance')
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOrdinance = async (e, filename, series) => {
    try {
      e.preventDefault();
      // Authenticate User using password, or with google authenticator
      setDelModalOpen(true);
      // const res = await axiosPrivate.delete(`/delete-ordinance/${filename}?type=ordinances&level=${auth.level}&series=${series}`);
      // if (res.status === 200) {
      //   setMessage(res.data.message);
      // } else {
      //   setMessage('Error on Deleting Ordinance');
      // }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    document.title = `SLIM | ${status} Ordinances`;
    let isMounted = true;
    setLoading(true)
    sendRequest()
    .then(({
      ordinances,
    }) => {
      if ( isMounted ) {
        setOrdinances(ordinances);
      }
      setLoading(false);
    })
    .catch((err) => {
      setLoading(false);
    });

    return () => {
      isMounted = false;
    }
  },[ status, message ]); 

  useEffect(() => {
    if (message) {
      setShowAlert(true);

      // Hide the alert after 3 seconds (adjust the time as needed)
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 3000);

      // Clear the timer when the component unmounts
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="Ordinances">
      <BreadCrumbs items={breadcrumbs} />
      <div className="Ordinances__Card">
        <CreateOrdinances sendRequest={sendRequest}/>
      </div>
      <div className="Ordinances__Container">
      <h3 className='Ordinances__Top__Title'>{status.toUpperCase()} ORDINANCES</h3>
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
        <table className="Ordinances__Content">
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
          { ordinances.length > 0 ? (
              ordinances.map((ordinance, i) => (
                (ordinance.status === status || status === 'all' && ordinance.accessLevel === auth.level) ? (
                  <tbody key={i}>
                  <tr
                    className='Ordinances__Link'
                    style={
                      {color: 
                        ordinance.status === 'draft' 
                        ? 'orange' 
                        : ordinance.status === 'enacted'
                        ? 'green'
                        : ordinance.status === 'approved'
                        ? 'blue'
                        : ordinance.status === 'amended'
                        ? 'red' : 'black'
                      }
                    }
                    key={i}>
                    <td>
                      { ordinance.mimetype === 'application/pdf' && (<FontAwesomeIcon icon={icons.pdf}/>)}
                    </td>
                    <td 
                      className='Ordinances__Number' onClick={() => handleOrdinanceClick(ordinance)}
                    >
                        <p>ORDINANCE NO {ordinance.number}, Series of {ordinance.series} {ordinance.title.toUpperCase()}</p>
                    </td>
                    <td>
                      <p>{ordinance.status.toUpperCase()}</p>
                    </td>
                    <td 
                      className='Ordinances__Date'>
                        {new Date(ordinance.createdAt).toLocaleString()}
                    </td>
                    <td>
                      { ordinance.size } k
                    </td>
                    <td className='Ordinances__Center'>
                      <FontAwesomeIcon 
                        className='Ordinances__Download'
                        onClick={() => handleDownload(ordinance.file, ordinance.series)}
                        icon={icons.download} />
                    </td>
                  </tr>
                  </tbody>
                ) : null
              ))
            ) : ( <tbody>
                    <tr>
                      <td>No {status} Ordinances</td>
                    </tr>
                  </tbody> )
          }
        </table>
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
                    style={{width: '10rem'}}
                    value={selectedOrdinance.status}
                    onChange={(e) => setSelectedOrdinance({...selectedOrdinance, status: e.target.value})}
                    disabled={isEditing}>
                      <option style={{color: 'orange'}} value="draft">Draft</option>
                      <option style={{color: 'yellow'}}value="pending">Pending</option>
                      <option style={{color: 'green'}}value="enacted">Enacted</option>
                      <option style={{color: 'blue'}}value="approved">Approved</option>
                      <option style={{color: 'green'}}value="amended">Amended</option>
                      <option style={{color: 'red'}}value="vetoed">Vetoed</option>
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
                    <option value="Mark Leigh David">Mark Leigh David</option>
                    <option value="Kenneth Rana">Kenneth Rana</option>
                  </select>
                </label>
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
                <div>
                  <button 
                    className="Ordinances__Edit__Button" 
                    onClick={(e) => {e.preventDefault(); setIsEditing(!isEditing)}}>
                      <FontAwesomeIcon icon={icons.pencil} />
                  </button>
                  <button 
                    className='Ordinances__Delete__Button' 
                    onClick={(e) => handleDeleteOrdinance(e, selectedOrdinance.file, selectedOrdinance.series)}>
                      <FontAwesomeIcon icon={icons.trash}/>
                  </button>
                </div>
                {!isEditing && (
                  <div>
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
            { selectedOrdinance.status === 'draft' || selectedOrdinance.status === 'pending' ? (
            <div className="Ordinances__Details__Proceedings">
              <label htmlFor="proceeding">Next Proceeding Schedule: 
                <input
                  className={`Ordinances__Details__Title__Input editing`}
                  style={{fontSize: '1rem'}}
                  type="datetime-local"
                  name='proceeding'
                  id='proceeding'
                  value={selectedOrdinance.proceedings}
                  onChange={handleProceedingChange}
                />
              </label>
              {isDateChanged && (
                <button onClick={(e) => handleChangeProceedingDate(e, selectedOrdinance.file)}>Update</button>
              )}
            </div>
            ) : null }
            { (selectedOrdinance.status === 'draft' || selectedOrdinance.status === 'pending') && (
            <div className='Ordinances__Card__Container'>
              <div className='Ordinances__Proceedings'>
                <h3>Proceedings</h3>
                <p>Proceedings of the Sangguniang Bayan of the Municipality of Bacolor, Province of Pampanga, held at the Session Hall on 
                  <strong> {new Date(selectedOrdinance.proceedings).toLocaleString(undefined, {hour12: true})}</strong>
                </p>
              </div>
            </div>
            )}
            <div className="Ordinances__PDFViewer">
              <div className="Ordinances__Card__Container">
                <div
                  className='Ordinances__PDFViewer__Button'
                  onClick={() => setCollapsed(!collapsed)}>
                  <p>View Ordinance File</p>
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
              <h3>Minutes of the Meeting for {selectedOrdinance.title.toUpperCase()}</h3>
              <div className='Ordinances__Minutes__Buttons'>
                <button
                  className='Ordinances__Minutes__Add'
                  onClick={() => setAddMinutes(!addMinutes)}>
                    Add Minutes of the Meeting
                </button>
                { addMinutes && (
                <div>
                  <label htmlFor="date-time">Date:
                    <input
                      type="datetime-local"
                      name='date'
                      id='date-time'
                      onChange={handleChange}
                    />
                  </label>
                  <label htmlFor="agenda">Agenda:
                    <input 
                      type="text"
                      name='agenda'
                      id='agenda'
                      onChange={handleChange}
                    />
                  </label>
                  <label htmlFor="speaker">Speaker:
                    <input 
                      type="text"
                      name='speaker'
                      id='speaker'
                      onChange={handleChange}
                    />
                  </label>
                  <label htmlFor="description">Description:
                    <input 
                      type="textarea"
                      name='description'
                      id='description'
                      onChange={handleChange}
                    />
                  </label>
                  <input type="file" onChange={handleFileChange}/>
                  <button className='Ordinances__Upload__button'onClick={(e) => handleUploadMinutes(e, selectedOrdinance._id, selectedOrdinance.series)}>Upload</button>
                  {showAlert && <div className="CreateOrdinances__Alert">{message}</div>}
                </div>
              )}
                <button
                  className='Ordinances__Minutes__Dropdown'
                  onClick={() => setDropdown(!dropDown)}>
                    Select Meeting Date
                </button>
                {dropDown && (
                  <ul>
                    {minutes ? 
                      (minutes.map((minute, i) => (
                      <li
                        className='Ordinances__Minutes__List'
                        key={i}
                        onClick={() => handleSelectMinutes(minute)}>
                          {new Date(minute.date).toLocaleString(undefined, {hour12: true})}
                      </li>
                      ))) : 
                      ( <li>No Minutes</li> )
                    }
                  </ul>
                )}
              </div>
              {selectedItem && minutes && (
                <div>
                  <div>
                    <p>Date: {new Date(selectedItem.date).toLocaleString(undefined, {hour12: true})}</p>
                    <p>Agenda: {selectedItem.agenda}</p>
                    <p>Description: {selectedItem.description}</p>
                    <p>Speaker: {selectedItem.speaker}</p>
                  </div>
                  <div className="Ordinances__Card__Container">
                  <div
                    className='Ordinances__PDFViewer__Button'
                    onClick={() => setMinCollapsed(!minCollapsed)}>
                    <p>View Minutes File</p>
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
        <h3>Warning! You cannot undo this action! </h3>
        <label htmlFor="password">Enter Password:</label>
        <input type="password" />
        {auth.otp && (
          <div>
            <label htmlFor="otp">Google Authenticator:</label>
            <input type="text" />
          </div>
        )}
        
      </Modal>
    </div>
  );
};

export default Ordinances;