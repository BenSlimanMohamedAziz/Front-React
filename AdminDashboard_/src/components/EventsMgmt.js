// src/components/EventsManagement.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, useParams, BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Modal from 'react-modal';
import 'bootstrap/dist/css/bootstrap.css';
import { FaSignOutAlt, FaCog, FaBell, FaUsers, FaCalendar, FaHome, FaPlus, FaEye, FaTrash, FaEdit, FaSearch, FaAngleLeft, FaAngleRight, FaDownload } from 'react-icons/fa';
import { CSVLink } from 'react-csv'; // Import CSVLink from react-csv
import { IoMdCloseCircle } from "react-icons/io";

const EventsManagement = () => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const eventsPerPage = 8;
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isViewModalOpen, setViewModalOpen] = useState(false);
    const navigate = useNavigate();
    const { state } = location;
    const [error, setError] = useState('');
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(0);
    const [adminInfo, setadminInfo] = useState({
        AdminFirstName: '',
        AdminLastName: '',
        AdminEmail: '',
        AdminPhone: '',
        AdminPassword: '',
        AdminPhoto: '',
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
        EventOrganizer: '',
        // Add other fields as needed
    });
    const handleViewEvent = (event) => {
        setSelectedEvent(event);
        setViewModalOpen(true);
        setEditModalOpen(false);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
    }

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/event')
            .then(response => {
                const filteredEvents = response.data.filter(event =>
                    event.EventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    event.Location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    event.EventOrganizer.OrganizerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

                setEvents(filteredEvents.slice(newStartIndex, newEndIndex));
            })
            .catch(error => console.error('Error fetching total events:', error));
    }, [currentPage, searchTerm]);

    const handleEditClick = (event) => {
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
            EventOrganizer: event.EventOrganizer,
            // Add other fields as needed
        });
        setEditModalOpen(true);
        setViewModalOpen(false);
    };

    const handleDeleteClick = (EventID) => {
        // Store the current page number before deletion
        const previousPage = currentPage;
        const confirmDelete = window.confirm('Are you sure you want to delete this Event?');
        const eventIdToDelete = EventID;
        if (confirmDelete) {
            axios.delete(`http://127.0.0.1:8000/event/${eventIdToDelete}`)
                .then(response => {
                    console.log(response.data);
                    setEvents(events.filter(e => e.EventID !== eventIdToDelete));
                    // Check if the current page has only one item after deletion
                    if (events.length === 1 && previousPage !== 1) {
                        // If the current page has only one item and it's being deleted,
                        // navigate back to the previous page
                        setCurrentPage(previousPage - 1);
                    }
                })
                .catch(error => console.error('Error deleting event:', error));
        }
    };

    const handleEditSubmit = () => {
        const today = new Date();
        const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        const startDate = new Date(editedEvent.DateStart);
        const endDate = new Date(editedEvent.DateEnd);

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
                setEvents(response.data);
                setEvents(events.map(e => (e.EventID === selectedEvent.EventID ? { ...e, ...editedEvent } : e)));
                alert('Event Edited Successfully !');
                setEditModalOpen(false);
            })
            .catch(error => console.error('Error updating event:', error));
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Logout function
    const handleLogout = () => {
        navigate('/Login');
    };

    // Extracting adminID from URL parameters
    const { adminID } = useParams();
    useEffect(() => {
        // Fetch organizer's information from the backend API
        axios.get(`http://127.0.0.1:8000/admins/detail/${adminID}`)
            .then(response => {
                setadminInfo(response.data);
                setadminInfo({ // Set edited organizer without password
                    AdminFirstName: response.data.AdminFirstName,
                    AdminLastName: response.data.AdminLastName,
                    AdminEmail: response.data.AdminEmail,
                    AdminPhone: response.data.AdminPhone,
                    AdminPassword: '',
                    AdminPhoto: response.data.AdminPhoto,
                });

            })
            .catch(error => console.error('Error fetching admin info:', error));
    }, [adminID]);

    const HomeButton = () => {
        // Fetch admin's information from the backend API
        axios.get(`http://127.0.0.1:8000/admins/detail/${adminID}`)
            .then(response => {
                navigate('/Home', {
                    state: {
                        adminID: response.data.AdminID,
                        adminFirstName: response.data.AdminFirstName,
                        adminLastName: response.data.AdminLastName,
                        adminEmail: response.data.AdminEmail,
                        adminPhone: response.data.AdminPhone,
                        adminPhoto: response.data.AdminPhoto,
                    },
                })
            })
            .catch(error => console.error('Error fetching admin info:', error));
    }

    // Function to handle CSV download
    const handleCSVDownload = () => {
        // Prepare data for CSV
        const csvData = events.map(event => ({
            EventName: event.EventName,
            EventDescription: event.EventDescription,
            DateStart: event.DateStart,
            DateEnd: event.DateEnd,
            Location: event.Location,
            MaxParticipants: event.MaxPar,
            Price: `${event.Price} Dt`, // Format price as needed
            Organizer: event.EventOrganizer.OrganizerName,
            Organizer_Email: event.EventOrganizer.OrganizerEmail,
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
            { label: 'Organizer', key: 'Organizer' },
            { label: 'Organizer Email', key: 'Organizer_Email' },
        ];    // Return CSVLink component with data and headers
        return (
            <CSVLink data={csvData} headers={headers} filename={'organizer_events.csv'}>
                <button style={{ padding: '6px', width: '150px', textAlign: 'center' }}> Download CSV <FaDownload style={{ marginTop: '-3px', marginLeft: '3px' }} /></button>
            </CSVLink>
        );
    };

    return (
        <div className='info-cont'>

            <div className="app-container">
                <div className="top-menu" style={{ cursor: 'pointer' }}>
                    <FaBell style={{ margin: '15px', marginRight: '15px', fontSize: '1.2rem', color: 'rgb(167, 167, 167)' }} />
                    <div className="dropdown" title={adminInfo.AdminFirstName + ' ' + adminInfo.AdminLastName}>
                        <button className="dropbtn">


                            {adminInfo.AdminPhoto && (

                                <img className='admin-img' style={{ width: '37px', height: '40px', marginBottom: '0px', marginRight: '-4px', marginLeft: '2px', borderRadius: '50px' }}
                                    src={`http://127.0.0.1:8000${adminInfo.AdminPhoto}`}
                                    alt={`Photo of ${adminInfo.AdminFirstName}`}

                                />

                            )}
                            <a style={{ margin: '8px', fontSize: '1.0rem' }}>  {adminInfo.AdminFirstName} </a>
                            {/*<FaUser style={{ margin: '5px', marginTop: '1px', fontSize: '1.4rem' }} />*/}
                        </button>
                        <div className="dropdown-content">
                            <a href="#Settings"> <Link to={`/Settings/${adminID}`}><FaCog style={{ margin: '5px', fontSize: '1.1rem' }} /> Settings </Link></a>
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

                        <Link to={`/Events-management/${adminID}`}><FaCalendar style={{ marginTop: '-5px', marginRight: '5px' }} /> Events Management</Link>

                        <hr />
                        <Link to={`/add-new-event/${adminID}`}> <FaPlus style={{ marginTop: '-5px', marginRight: '5px' }} /> Add a New Event</Link>
                        <hr />

                        <Link to={`/Organizer-management/${adminID}`}><FaUsers style={{ marginTop: '-5px', marginRight: '5px' }} /> Organizer Management</Link>

                        <hr />
                        <Link to={`/add-new-Org/${adminID}`}><FaPlus style={{ marginTop: '-5px', marginRight: '5px' }} /> Add new Organizer</Link>

                        <hr />

                        <Link to={`/participants-management/${adminID}`}> <FaUsers style={{ marginTop: '-5px', marginRight: '5px' }} /> Participants Management</Link>
                        <hr />
                        <Link to={`/Settings/${adminID}`}><FaCog style={{ marginTop: '-5px', marginRight: '5px' }} /> User Settings</Link>
                        <hr />
                        <p onClick={handleLogout} >Logout <FaSignOutAlt style={{ margin: '5px', marginLeft: '6px' }} /></p>
                    </div>
                    <div className="content">
                        <div className="main-content">
                            <br />        <br /><br />
                            <h2 style={{ fontFamily: '"Rowdies", sans-serif' }}><b>Events Management :</b> </h2>
                            <br />
                            <input type='search' placeholder='Search Events' value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)} style={{ fontFamily: '"Rowdies", sans-serif' }}></input> <FaSearch style={{ marginLeft: '-35px', marginTop: '-4px', marginRight: '25px' }} />
                            {handleCSVDownload()}
                            <table>
                                <thead>
                                    <tr style={{ fontFamily: '"Rowdies", sans-serif' }}>
                                        <th>Event Name</th>
                                        <th>Event Description</th>
                                        <th>Date Start</th>
                                        <th>Date End</th>
                                        <th>Location</th>
                                        <th>Tickets</th>
                                        <th>Price</th>
                                        <th>Organizer</th>
                                        <th>Organizer Email</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {events.map(event => (
                                        <tr key={event.EventID}>
                                            <td>{event.EventName}</td>
                                            <td>{event.EventDescription}</td>
                                            <td>{event.DateStart}</td>
                                            <td>{event.DateEnd}</td>
                                            <td>{event.Location}</td>
                                            <td>{event.MaxPar}</td>
                                            {/*<td> <img src={event.EventPhoto} name='event-img' className='event-img' alt='event-img' /></td>*/}
                                            <td>{event.Price} Dt</td>
                                            <td>{event.EventOrganizer ? event.EventOrganizer.OrganizerName : 'No organizer'}</td>
                                            <td> <a href={`mailto:${event.EventOrganizer.OrganizerEmail}`} className='mailto'>{event.EventOrganizer ? event.EventOrganizer.OrganizerEmail : 'No organizer'}</a></td>

                                            <td>
                                                <span className='actionBtns'>
                                                    <FaEye className='FaEye' onClick={() => handleViewEvent(event)} title="View Event Info" />
                                                    {/* Edit button */}
                                                    <FaEdit className='FaEdit' onClick={() => handleEditClick(event)} title="Edit Event Info" />

                                                    {/* Delete button */}
                                                    <FaTrash className='FaDelete' onClick={() => handleDeleteClick(event.EventID)} title="Delete Event" />
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
                                                   Number Of Tickets:
                                                </label>
                                            </div>
                                            <div className="col-75">
                                                <input name='MaxPar'
                                                    type="number" required
                                                    id='maxPar'
                                                    placeholder='Number of tickets/places available'
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

                                    {/* Display other event details */}
                                    <img className='view-img-event' src={selectedEvent?.EventPhoto} alt={selectedEvent?.EventName} />
                                    <p><b>Description:</b> {selectedEvent?.EventDescription}</p>
                                    <p><b>Date Start:</b> {selectedEvent?.DateStart}</p>
                                    <p><b>Date End:</b> {selectedEvent?.DateEnd}</p>
                                    <p><b>Date End:</b> {selectedEvent?.Location}</p>
                                    <p><b>Number Of Tickets:</b> {selectedEvent?.MaxPar}</p>
                                    <p><b>Price:</b> {selectedEvent?.Price} Dt</p>
                                    <span>Organized By: <i><a href={`mailto:${selectedEvent?.EventOrganizer.OrganizerEmail}`}
                                        className='mailtoBy'>{selectedEvent?.EventOrganizer ? selectedEvent.EventOrganizer.OrganizerName : 'No organizer'}</a></i> </span>
                                </div>
                            </Modal>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventsManagement;