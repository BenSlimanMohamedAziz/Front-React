//Organizer Events management

import React, { useState, useEffect } from 'react';
import { useLocation,useParams, useNavigate, BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Modal from 'react-modal';
import 'bootstrap/dist/css/bootstrap.css';
import { FaSignOutAlt, FaCog, FaBell, FaUsers, FaCalendar, FaHome, FaPlus, FaEye, FaTrash, FaEdit, FaSearch, FaAngleLeft, FaAngleRight, FaDownload } from 'react-icons/fa';
import axios from 'axios';
import { IoMdCloseCircle } from "react-icons/io";
import { CSVLink } from 'react-csv'; // Import CSVLink from react-csv

const OrganizerEvents = () => {
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isViewModalOpen, setViewModalOpen] = useState(false);
    const navigate = useNavigate();
    const { state } = location;
    const [currentPage, setCurrentPage] = useState(1);
    const eventsPerPage = 8;
    const [error, setError] = useState('');
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(0);
    const [organizerInfo, setOrganizerInfo] = useState({
        OrganizerName: '',
        OrganizerEmail: '',
        OrganizerPhone: '',
        OrganizerPhoto: '',
    });
    const [editedEvent, setEditedEvent] = useState({
        EventName: '',
        EventDescription: '',
        DateStart: '',
        DateEnd: '',
        Location: '',
        MaxPar: 0,
        EventPhoto: '',
        Price: 0,
    });
    const handleViewEvent = (event) => {
        setSelectedEvent(event);
        setViewModalOpen(true);
        setEditModalOpen(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    }


    // Extracting organizerID from URL parameters
    const { organizerID, organizerName, organizerEmail } = useParams();

    // State to store organizer events
    const [organizerEvents, setOrganizerEvents] = useState([]);



    /*  useEffect(() => {
          // Fetch organizer's events when the component mounts or organizerID changes
          if (organizerID) {
              axios.get(`http://127.0.0.1:8000/organizer/${organizerID}/events`)
                  .then(response => {
                      setOrganizerEvents(response.data);
                  })
                  .catch(error => console.error('Error fetching organizer events:', error));
          }
      }, [organizerID]); // Add organizerID as a dependency
      // Rest of your component logic using the extracted data
      */
    useEffect(() => {
        // Fetch organizer's information from the backend API
        axios.get(`http://127.0.0.1:8000/organizer/detail/${organizerID}`)
            .then(response => {
                setOrganizerInfo(response.data);
                setOrganizerInfo({ // Set edited organizer without password
                    OrganizerName: response.data.OrganizerName,
                    OrganizerEmail: response.data.OrganizerEmail,
                    OrganizerPhone: response.data.OrganizerPhone,
                    OrganizerPhoto: response.data.OrganizerPhoto,
                });
            })
            .catch(error => console.error('Error fetching organizer info:', error));
    }, [organizerID]);

    useEffect(() => {
        if (organizerID) {
            axios.get(`http://127.0.0.1:8000/organizer/${organizerID}/events`)
                .then(response => {
                    const filteredEvents = response.data.filter(event =>
                        event.EventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        event.Location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        event.Price.toString().includes(searchTerm) || // Convert Price to string for comparison
                        event.DateStart.includes(searchTerm) || // Assuming DateStart is in string format
                        event.DateEnd.includes(searchTerm)
                        // Add other fields as needed for searching
                    );

                    const totalPagesCount = Math.ceil(filteredEvents.length / eventsPerPage);
                    setTotalPages(totalPagesCount);

                    const newStartIndex = (currentPage - 1) * eventsPerPage;
                    const newEndIndex = newStartIndex + eventsPerPage;

                    setStartIndex(newStartIndex);
                    setEndIndex(newEndIndex);

                    setOrganizerEvents(filteredEvents.slice(newStartIndex, newEndIndex));
                })
                .catch(error => console.error('Error fetching organizer events:', error));
        }
    }, [organizerID, currentPage, searchTerm]);


    // Function to handle event deletion
    const handleDeleteEvent = (eventID) => {
        // Store the current page number before deletion
        const previousPage = currentPage;
        const confirmDelete = window.confirm('Are you sure you want to delete this Event?');
        // Send a DELETE request to your API to delete the event
        if (confirmDelete) {
            axios.delete(`http://127.0.0.1:8000/event/${eventID}`)
                .then(response => {
                    // Remove the deleted event from the state
                    setOrganizerEvents(prevEvents => prevEvents.filter(event => event.EventID !== eventID));
                    console.log('Event deleted successfully:', response.data);

                    // Check if the current page has only one item after deletion
                    if (organizerEvents.length === 1 && previousPage !== 1) {
                        // If the current page has only one item and it's being deleted,
                        // navigate back to the previous page
                        setCurrentPage(previousPage - 1);
                    }
                })
                .catch(error => console.error('Error deleting event:', error));
        }
    };
    // Function to handle event editing
    const handleEditEvent = (event) => {
        // Set the selected event and open the edit modal
        setSelectedEvent(event);
        setEditedEvent({
            EventName: event.EventName,
            EventDescription: event.EventDescription,
            DateStart: event.DateStart,
            DateEnd: event.DateEnd,
            Location: event.Location,
            MaxPar: event.MaxPar,
            EventPhoto: event.EventPhoto,
            Price: event.Price,
        });
        setEditModalOpen(true);
        setViewModalOpen(false);
    };

    // Function to handle editing form submission
    const handleEditSubmit = () => {
        const today = new Date();
        const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        const startDate = new Date(editedEvent.DateStart);
        const endDate = new Date(editedEvent.DateEnd);

        // Check if Date End is after Date Start

        if (endDate <= startDate) {
            setError("End date must be after the start date.");
            return; // Exit function if validation fails
        }
        else {
            setError("");
        }

        // Check if Price is less than or equal to 0
        if (editedEvent.Price <= 0) {
            setError("Price must be greater than 0.");
            return; // Exit function if validation fails
        }

        // Check if MaxPar is less than or equal to 0
        if (editedEvent.MaxPar <= 0) {
            setError("Number of Tickets must be greater than 0.");
            return; // Exit function if validation fails
        }

        axios.put(`http://127.0.0.1:8000/event/${selectedEvent.EventID}`, {
            EventID: selectedEvent.EventID,
            ...editedEvent,
        })
            .then(response => {
                // Update the event in the state
                setOrganizerEvents(prevEvents => prevEvents.map(event => (
                    event.EventID === selectedEvent.EventID ? { ...event, ...editedEvent } : event
                )));
                alert('Event Edited Successfully !');
                setEditModalOpen(false);
            })
            .catch(error => console.error('Error updating event:', error));
    };
    // Logout function
    const handleLogout = () => {
        navigate('/Login');
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };
    // Function to handle CSV download
    const handleCSVDownload = () => {
        // Prepare data for CSV
        const csvData = organizerEvents.map(event => ({
            EventName: event.EventName,
            EventDescription: event.EventDescription,
            DateStart: event.DateStart,
            DateEnd: event.DateEnd,
            Location: event.Location,
            MaxParticipants: event.MaxPar,
            Price: `${event.Price} Dt`, // Format price as needed
        }));

        // Define CSV headers
        const headers = [
            { label: 'Event Name', key: 'EventName' },
            { label: 'Event Description', key: 'EventDescription' },
            { label: 'Start Date', key: 'DateStart' },
            { label: 'End Date', key: 'DateEnd' },
            { label: 'Location', key: 'Location' },
            { label: 'Number of Tickets', key: 'MaxParticipants' },
            { label: 'Price', key: 'Price' },
        ];    // Return CSVLink component with data and headers
        return (
            <CSVLink data={csvData} headers={headers} filename={'organizer_events.csv'}>
                <button style={{ padding: '6px', width: '150px', textAlign: 'center' }}> Download CSV <FaDownload style={{ marginTop: '-3px', marginLeft: '3px' }} /></button>
            </CSVLink>
        );
    };

    const HomeButton = () => {
        axios.get(`http://127.0.0.1:8000/organizer/detail/${organizerID}`)
            .then(response => {
                navigate('/Home', {
                    state: {
                        organizerID: response.data.OrganizerID,
                        organizerName: response.data.OrganizerName,
                        organizerEmail: response.data.OrganizerEmail,
                        OrganizerPhone: response.data.OrganizerPhone,
                    },
                })
            })
            .catch(error => console.error('Error fetching organizer info:', error));
    }


    return (
        <div className='info-cont'>

            <div className="app-container">
                <div className="top-menu" style={{ cursor: 'pointer' }}>
                    <FaBell style={{ margin: '15px', marginRight: '15px', fontSize: '1.2rem', color: 'rgb(167, 167, 167)' }} />
                    <div className="dropdown">
                        <button className="dropbtn">
                            {organizerInfo.OrganizerPhoto && (

                                <img className='organizer-img' style={{ width: '38px', marginBottom: '0px', marginRight: '-4px', marginLeft: '2px', borderRadius: '50px' }}
                                    src={`http://127.0.0.1:8000${organizerInfo.OrganizerPhoto}`}
                                    alt={`Photo of ${organizerInfo.OrganizerName}`}
                                />

                            )}
                            <a style={{ margin: '8px', fontSize: '1.0rem' }}>  {organizerName} </a>
                            {/*<FaUser style={{ margin: '5px', marginTop: '1px', fontSize: '1.4rem' }} />*/}
                        </button>
                        <div className="dropdown-content">
                            <a href="#organizer_settings"> <Link to={`/organizer-settings/${organizerID}/${encodeURIComponent(organizerName)}`}><FaCog style={{ margin: '5px', fontSize: '1.1rem' }} /> Settings </Link></a>
                            <a href="#logout" onClick={handleLogout} className='log_out'><FaSignOutAlt style={{ margin: '7px', fontSize: '1.2rem' }} />Logout </a>
                        </div>
                    </div>


                </div>
                <div className="menu-container">
                    <div className="left-menu">
                        <h1 onClick={HomeButton} style={{ cursor: 'pointer' }}>Paradise Events</h1>
                        <br />   <br /> <br />
                        <Link to="/" onClick={HomeButton}><FaHome style={{ marginTop: '-5px', marginRight: '5px' }} /> Home</Link>
                        <hr />

                        <Link to={`/Events-management/${organizerID}/${encodeURIComponent(organizerName)}`}><FaCalendar style={{ marginTop: '-5px', marginRight: '5px' }} /> Events Management</Link>
                        <hr />

                        <Link to={`/Add-Events/${organizerID}/${encodeURIComponent(organizerName)}`}><FaPlus style={{ marginTop: '-5px', marginRight: '5px' }} /> Add New Event</Link>
                        <hr />

                        <Link to={`/Participants-management/${organizerID}/${encodeURIComponent(organizerName)}`}><FaUsers style={{ marginTop: '-5px', marginRight: '5px' }} /> Participants Management</Link>
                        <hr />

                        <Link to={`/Organizer-settings/${organizerID}/${encodeURIComponent(organizerName)}`}><FaCog style={{ marginTop: '-5px', marginRight: '5px' }} /> User Settings</Link>
                        <hr />
                        <p onClick={handleLogout}>Logout <FaSignOutAlt style={{ margin: '5px', marginLeft: '6px' }} /></p>
                    </div>
            
                    <div className="content">
                        <br />        <br /><br />
                        <h2 style={{ fontFamily: '"Rowdies", sans-serif' }}><b>Events Management :</b> </h2>
                        <br />
                        <input type='search' placeholder='Search Events' value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)} style={{ fontFamily: '"Rowdies", sans-serif' }}></input> <FaSearch style={{ marginLeft: '-35px', marginTop: '-4px', marginRight: '25px' }} />
                        {handleCSVDownload()}
                        <table>
                            <thead>
                                <tr style={{ fontFamily: '"Rowdies", sans-serif' }}>
                                    {/* <th>Event ID</th> */}
                                    <th>Event Name</th>
                                    <th>Description</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Location</th>
                                    <td>Tickets</td>
                                    <td>Price</td>
                                    <th>Actions</th>

                                </tr>
                            </thead>
                            <tbody>
                                {organizerEvents.map(event => (
                                    <tr key={event.EventID}>
                                        {/* <td>{event.EventID}</td>*/}
                                        <td>{event.EventName}</td>
                                        <td>{event.EventDescription}</td>
                                        <td>{event.DateStart}</td>
                                        <td>{event.DateEnd}</td>
                                        <td>{event.Location}</td>
                                        <td>{event.MaxPar}</td>
                                        <td>{event.Price} Dt</td>
                                        <td>
                                            <span className='actionBtns'>
                                                <FaEye className='FaEye' onClick={() => handleViewEvent(event)} title="View Event Info" />
                                                {/* Edit button */}
                                                <FaEdit className='FaEdit' onClick={() => handleEditEvent(event)} title="Edit Event Info" />

                                                {/* Delete button */}
                                                <FaTrash className='FaDelete' onClick={() => handleDeleteEvent(event.EventID)} title="Delete Event" />
                                            </span>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="pagination">
                            <span className='FaBackward'>
                                <FaAngleLeft onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                            </span>
                            <span>
                                {`Page ${currentPage} of ${totalPages}`}
                            </span>
                            <span className='FaForward'>
                                <FaAngleRight onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                            </span>
                        </div>

                        {/* Edit Event Modal */}
                        <Modal
                            isOpen={isEditModalOpen}
                            onRequestClose={() => setEditModalOpen(false)}
                            contentLabel="Edit Event Modal"
                            className="custom-edit-modal"
                            overlayClassName="custom-overlay"
                        >
                            <div className="edit-dialog">
                                <span className='close-btn'>
                                    <p type="button" className='clsBtn' onClick={() => setEditModalOpen(false)}><IoMdCloseCircle /></p>
                                </span>
                                <h3>Editing Event: <b><i>{selectedEvent?.EventName}</i></b> </h3>
                                <form name='edit-event' onSubmit={handleSubmit}>
                                    {error && (
                                        <div className="alert alert-danger" role="alert">
                                            {error}
                                        </div>
                                    )}
                                    <div className="row">
                                        <div className="col-25">
                                            <label htmlFor='EventName'>
                                                Event Name:
                                            </label>
                                        </div>
                                        <div className="col-75">
                                            <input
                                                type="text" required name='EventName'
                                                id='EventName'
                                                placeholder='Event Name'
                                                value={editedEvent.EventName}
                                                onChange={(e) => setEditedEvent({ ...editedEvent, EventName: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-25">
                                            <label htmlFor='desc'>
                                                Event Description:
                                            </label>
                                        </div>
                                        <div className="col-75">
                                            <textarea name='desc'
                                                id='desc'
                                                placeholder='Event Description'
                                                value={editedEvent.EventDescription}
                                                onChange={(e) =>
                                                    setEditedEvent({ ...editedEvent, EventDescription: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-25">
                                            <label htmlFor='DateStart'>
                                                Date Start:
                                            </label>
                                        </div>
                                        <div className="col-75">
                                            <input name='DateStart'
                                                id='dateStart'
                                                type="date" required
                                                value={editedEvent.DateStart}
                                                onChange={(e) => {
                                                    setEditedEvent({ ...editedEvent, DateStart: e.target.value });
                                                    setError('');
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-25">
                                            <label htmlFor='DateEnd'>
                                                Date End:
                                            </label>
                                        </div>
                                        <div className="col-75">
                                            <input name='DateEnd'
                                                id='dateEnd'
                                                type="date" required
                                                value={editedEvent.DateEnd}
                                                onChange={(e) => {
                                                    setEditedEvent({ ...editedEvent, DateEnd: e.target.value });
                                                    setError('');
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-25">
                                            <label htmlFor='Location'>
                                                Location:
                                            </label>
                                        </div>
                                        <div className="col-75">
                                            <input name='Location'
                                                id='Location'
                                                placeholder='Event Location'
                                                type="text" required
                                                value={editedEvent.Location}
                                                onChange={(e) => setEditedEvent({ ...editedEvent, Location: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-25">
                                            <label htmlFor='maxPar'>
                                            Tickets:
                                            </label>
                                        </div>
                                        <div className="col-75">
                                            <input name='MaxPar'
                                                type="number" required
                                                id='maxPar'
                                                placeholder='Number of available Tickets / Places'
                                                value={editedEvent.MaxPar}
                                                onChange={(e) => {
                                                    setEditedEvent({ ...editedEvent, MaxPar: e.target.value });
                                                    setError('');
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-25">
                                            <label htmlFor='EventImg'>
                                                Event Photo:
                                            </label>
                                        </div>
                                        <div className="col-75">
                                            <input name='EventPhoto'
                                                type="text" required
                                                placeholder='Enter Event Image Link'
                                                id='EventImg'
                                                value={editedEvent.EventPhoto}
                                                onChange={(e) => setEditedEvent({ ...editedEvent, EventPhoto: e.target.value })
                                                }
                                            /></div>
                                    </div>
                                    <div className="row">
                                        <div className="col-25">
                                            <label htmlFor='Price'>
                                                Price (Dt):
                                            </label>
                                        </div>
                                        <div className="col-75">
                                            <input name='Price'
                                                id='Price'
                                                placeholder='Price (Dt)'
                                                type="number" required
                                                value={editedEvent.Price}
                                                onChange={(e) => {
                                                    setEditedEvent({ ...editedEvent, Price: e.target.value });
                                                    setError('');
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className='btns'>
                                        <button type="submit" onClick={handleEditSubmit}>Edit Event</button>
                                        <button type="button" onClick={() => setEditModalOpen(false)}>Cancel</button>
                                    </div>

                                </form>
                            </div>
                        </Modal>
                        <Modal
                            isOpen={isViewModalOpen}
                            onRequestClose={() => setViewModalOpen(false)}
                            contentLabel="View Event Modal"
                            className="custom-modal"
                            overlayClassName="custom-overlay"
                        >
                            <div className="view-dialog">
                                <span className='close-btn'>
                                    <p type="button" className='clsBtn' onClick={() => setViewModalOpen(false)}><IoMdCloseCircle /></p>
                                </span>
                                <h3>Event: <b><i>{selectedEvent?.EventName}</i></b> </h3>

                                <img className='view-img-event' src={selectedEvent?.EventPhoto} alt={selectedEvent?.EventName} />
                                <p><b>Description:</b> {selectedEvent?.EventDescription}</p>
                                <p><b>Date Start:</b> {selectedEvent?.DateStart}</p>
                                <p><b>Date End:</b> {selectedEvent?.DateEnd}</p>
                                <p><b>Date End:</b> {selectedEvent?.Location}</p>
                                <p><b>Number of Tickets:</b> {selectedEvent?.MaxPar}</p>
                                <p><b>Price:</b> {selectedEvent?.Price} Dt</p>
                                <span>By: <i><a href={`mailto:${organizerInfo.OrganizerEmail}`} className='mailtoBy'>{organizerName}</a></i> </span>

                            </div>
                        </Modal>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizerEvents;