// src/components/AddNewEvent.js
import React, { useState, useEffect } from 'react';
import { useLocation,useParams, useNavigate, BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import { FaSignOutAlt, FaCog, FaBell, FaUsers, FaCalendar, FaHome, FaPlus } from 'react-icons/fa';

import axios from 'axios';

const AddNewEvent = () => {

    const { organizerID, organizerName } = useParams();
    const [error, setError] = useState('');
    const [organizerInfo, setOrganizerInfo] = useState({
        OrganizerName: '',
        OrganizerEmail: '',
        OrganizerPhone: '',
        OrganizerPhoto: '',
    });
    const [eventData, setEventData] = useState({
        EventName: '',
        EventDescription: '',
        DateStart: '',
        DateEnd: '',
        Location: '',
        MaxPar: 0,
        EventPhoto: '',
        Price: 0, // You may need to handle file uploads differently
        EventOrganizer: organizerID, // Organizer ID will be stored here
    });

    const [organizers, setOrganizers] = useState([]);
    const navigate = useNavigate();
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
        // Fetch organizer's information from the backend API
        axios.get(`http://127.0.0.1:8000/organizer/detail/${organizerID}`)
            .then(response => {
                setOrganizers(response.data);
            })
            .catch(error => console.error('Error fetching organizer info:', error));
    }, [organizerID]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setEventData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const today = new Date();
        const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        const startDate = new Date(eventData.DateStart);
        const endDate = new Date(eventData.DateEnd);

        if (startDate < todayDateOnly) {
            setError("Start date cannot be before today's date.");
            return; // Exit function if validation fails
        }
        else {
            setError("");
        }

        // Check if Date End is after Date Start

        if (endDate <= startDate) {
            setError("End date must be after the start date.");
            return; // Exit function if validation fails
        }
        else {
            setError("");
        }

        // Check if Price is less than or equal to 0
        if (eventData.Price <= 0) {
            setError("Price must be greater than 0.");
            return; // Exit function if validation fails
        }

        // Check if MaxPar is less than or equal to 0
        if (eventData.MaxPar <= 0) {
            setError("Number of Tickets must be greater than 0.");
            return; // Exit function if validation fails
        }

        // Log the current eventData state
        console.log('Event Data:', eventData);

        try {
            // Post the new event data to your API
            const response = await axios.post('http://127.0.0.1:8000/event', eventData);
            console.log('Event added successfully:', response.data);

            // Show success dialogue
            alert('Event added successfully!');

            // Redirect to the Events table page
            navigate(`/Events-management/${organizerID}/${organizerName}`);
        } catch (error) {
            console.error('Error adding event:', error);
        }
    };
    // Logout function
    const handleLogout = () => {
        navigate('/Login');
    };

    const handleCancelAdd = () => {
        navigate(`/Events-management/${organizerID}/${organizerName}`);
    }

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
                        <br />
                        <h2 style={{ fontFamily: '"Rowdies", sans-serif', textAlign: 'center' }}><b>Add New Event :</b> </h2>
                        <br />
                        <form name='add-event' onSubmit={handleSubmit}>
                            <div className='add-form-event'>
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
                                            type="text"
                                            id='EventName'
                                            name="EventName"
                                            placeholder='Event Name'
                                            value={eventData.EventName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-25">
                                        <label htmlFor='description'>
                                            Event's Description:
                                        </label>
                                    </div>
                                    <div className="col-75">
                                        <textarea
                                            name="EventDescription"
                                            id='description'
                                            placeholder="Event's Description"
                                            value={eventData.EventDescription}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-25">
                                        <label htmlFor='dateStart'>
                                            Date Start:
                                        </label>
                                    </div>
                                    <div className="col-75">
                                        <input
                                            type="date"
                                            id='dateStart'
                                            name="DateStart"
                                            placeholder="Event Start Day"
                                            value={eventData.DateStart}
                                            onChange={(e) => {
                                                handleChange(e);
                                                setError('');
                                            }}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-25">
                                        <label htmlFor='dateEnd'>
                                            Date End:
                                        </label>
                                    </div>
                                    <div className="col-75">
                                        <input
                                            type="date"
                                            id='dateEnd'
                                            name="DateEnd"
                                            placeholder="Event End Day"
                                            value={eventData.DateEnd}
                                            onChange={(e) => {
                                                handleChange(e);
                                                setError('');
                                            }}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-25">
                                        <label htmlFor='price'>
                                            Price(Dt):
                                        </label>
                                    </div>
                                    <div className="col-75">
                                        <input
                                            type="number"
                                            name="Price"
                                            id='price'
                                            placeholder='Price (Dt)'
                                            value={eventData.Price}
                                            onChange={(e) => {
                                                handleChange(e);
                                                setError('');
                                            }}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-25">
                                        <label htmlFor='location'>
                                            Location:
                                        </label>
                                    </div>
                                    <div className="col-75">
                                        <input
                                            type="text"
                                            name="Location"
                                            id='location'
                                            placeholder="Event Location"
                                            value={eventData.Location}
                                            onChange={handleChange}
                                            required
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
                                        <input
                                            type="number"
                                            name="MaxPar"
                                            id='maxPar'
                                            placeholder="Number of available Tickets/Places"
                                            value={eventData.MaxPar}
                                            onChange={(e) => {
                                                handleChange(e);
                                                setError('');
                                            }}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-25">
                                        <label htmlFor='Eventimg'>
                                            Event Photo:
                                        </label>
                                    </div>
                                    <div className="col-75">
                                        <input
                                            type="text"
                                            id='Eventimg'
                                            placeholder="Event Photo link here"
                                            name="EventPhoto"
                                            value={eventData.EventPhoto}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-25">

                                        <label hidden htmlFor='EventOrg'>
                                            Organizer:
                                        </label>
                                    </div>
                                    <div className="col-75">
                                        <select hidden
                                            name="EventOrganizer" // Setting the name attribute to EventOrganizer
                                            id='EventOrg'
                                            value={eventData.EventOrganizer}
                                            onChange={(e) => {
                                                handleChange(e);
                                                setError('');
                                            }}
                                            required
                                        >
                                            <option value="" disabled>Select Organizer</option>

                                            <option key={organizers.OrganizerID} value={organizers.OrganizerID} selected>
                                                {organizers.OrganizerName}
                                            </option>

                                        </select>
                                    </div>
                                </div>

                                <div className='btns'>
                                    <button type="submit">Add Event</button>
                                    <button type='button' onClick={handleCancelAdd}>Cancel</button>
                                </div>

                            </div>
                        </form>
                    </div>
                </div>
            </div >
        </div >
    );
};

export default AddNewEvent;