//Organizer Participants management

import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate, BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Modal from 'react-modal';
import 'bootstrap/dist/css/bootstrap.css';
import { FaSignOutAlt, FaCog, FaBell, FaUsers, FaCalendar, FaHome, FaPlus, FaTrash, FaEdit, FaSearch, FaAngleLeft, FaAngleRight, FaDownload } from 'react-icons/fa';
import axios from 'axios';
import { CSVLink } from 'react-csv'; // Import CSVLink from react-csv
import { IoMdCloseCircle } from "react-icons/io";

const EventParticipants = ({ }) => {
    const location = useLocation();
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isEditPartModalOpen, setEditPartModalOpen] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const eventsPerPage = 8;
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
    const [editedParticipant, setEditedParticipant] = useState({
        FirstName: '',
        LastName: '',
        UserEmail: '',
        User_Number: '',
        // Add other fields as needed
    });
    // Extracting organizerID from URL parameters
    const { organizerID, organizerName } = useParams();
    useEffect(() => {
        // Fetch organizer's information from the backend API
        axios.get(`http://127.0.0.1:8000/organizer/detail/${organizerID}`)
            .then(response => {
                setOrganizerInfo(response.data);
                setOrganizerInfo({
                    OrganizerName: response.data.OrganizerName,
                    OrganizerEmail: response.data.OrganizerEmail,
                    OrganizerPhone: response.data.OrganizerPhone,
                    OrganizerPhoto: response.data.OrganizerPhoto,
                });
            })
            .catch(error => console.error('Error fetching organizer info:', error));
    }, [organizerID]);

    useEffect(() => {
        // Fetch event participants when the component mounts or eventId changes
        if (organizerID) {
            axios.get(`http://127.0.0.1:8000/organizer/${organizerID}/participants`)
                .then(response => {
                    /* setParticipants(response.data);*/
                    const filteredParticipants = response.data.filter(participant =>
                        (participant.FirstName + ' ' + participant.LastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
                        participant.FirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        participant.LastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        participant.UserEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        participant.User_Number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        participant.EventParticipation.EventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        participant.EventParticipation.Price.toString().includes(searchTerm)
                        // Add other fields as needed for searching
                    );

                    const totalPagesCount = Math.ceil(filteredParticipants.length / eventsPerPage);
                    setTotalPages(totalPagesCount);

                    const newStartIndex = (currentPage - 1) * eventsPerPage;
                    const newEndIndex = newStartIndex + eventsPerPage;

                    setStartIndex(newStartIndex);
                    setEndIndex(newEndIndex);

                    setParticipants(filteredParticipants.slice(newStartIndex, newEndIndex));
                })
                .catch(error => console.error('Error fetching event participants:', error));
        }
    }, [organizerID, currentPage, searchTerm]); // Add eventId as a dependency

    const handlePartEditClick = participant => {
        // Set the selected participant and open the edit modal
        setSelectedParticipant(participant);
        setEditedParticipant({
            FirstName: participant.FirstName,
            LastName: participant.LastName,
            UserEmail: participant.UserEmail,
            User_Number: participant.User_Number,
            // Add other participant details fields as needed
        });
        setEditPartModalOpen(true);
    };

    const handleValidInput = () => {
        return /^(?:\+?[0-9]{3}\s?[0-9]{2}\s?[0-9]{3}\s?[0-9]{3}|[0-9]{2}\s?[0-9]{3}\s?[0-9]{3})$/.test(editedParticipant.User_Number);
    };

    const handlePartEditSubmit = (e) => {
        e.preventDefault();

        if (!handleValidInput()) {
            setError('Phone number is invalid. Please enter a valid phone number.');
            return;
        }
        else {
            setError('');
        }

        axios.put(`http://127.0.0.1:8000/user/${selectedParticipant.UserID}`, {
            UserID: selectedParticipant.UserID, // Include UserID in the request payload
            ...editedParticipant,
        })
            .then(response => {
                console.log(response.data.message);
                setParticipants(participants.map(p => (p.UserID === selectedParticipant.UserID ? { ...p, ...editedParticipant } : p)));
                setEditPartModalOpen(false);
            })
            .catch(error => console.error('Error updating participant:', error));
    };

    const handleDeleteClick = participant => {
        // Delete the participant and update the state
        const userIdToDelete = participant.UserID;
        const previousPage = currentPage;
        const confirmDelete = window.confirm('Are you sure you want to delete this Participant?');
        if (confirmDelete) {
            axios.delete(`http://127.0.0.1:8000/user/${userIdToDelete}`)
                .then(response => {
                    console.log(response.data.message);
                    setParticipants(participants.filter(p => p.UserID !== userIdToDelete));
                    console.log('Participant deleted successfully:', response.data);

                    // Check if the current page has only one item after deletion
                    if (participants.length === 1 && previousPage !== 1) {
                        // If the current page has only one item and it's being deleted,
                        // navigate back to the previous page
                        setCurrentPage(previousPage - 1);
                    }
                })
                .catch(error => console.error('Error deleting participant:', error));
        }
    };

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
        const csvData = participants.map(participant => ({
            'FirstName': participant.FirstName,
            'LastName': participant.LastName,
            'Email': participant.UserEmail,
            'Number': participant.User_Number,
            'EventparticipatedIn': participant.EventParticipation ? participant.EventParticipation.EventName : 'Not Participating',
            'Payment': `${participant.EventParticipation ? participant.EventParticipation.Price : 'N/A'} Dt`,
        }));

        // Define CSV headers
        const headers = [
            { label: 'First Name', key: 'FirstName' },
            { label: 'Last Name', key: 'LastName' },
            { label: 'Email', key: 'Email' },
            { label: 'Number', key: 'Number' },
            { label: 'Event participated In', key: 'EventparticipatedIn' },
            { label: 'Payment', key: 'Payment' },
        ];    // Return CSVLink component with data and headers
        return (
            <CSVLink data={csvData} headers={headers} filename={'organizer_event_participants.csv'}>
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
                        organizerPhone: response.data.OrganizerPhone,
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
                        <h2 style={{ fontFamily: '"Rowdies", sans-serif' }}><b>Event's Participants Management :</b> </h2>
                        <br />
                        <input type='search' placeholder='Search Participants' value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)} style={{ fontFamily: '"Rowdies", sans-serif' }}></input> <FaSearch style={{ marginLeft: '-35px', marginTop: '-4px', marginRight: '25px' }} />
                        {handleCSVDownload()}
                        <table>
                            <thead>
                                <tr style={{ fontFamily: '"Rowdies", sans-serif' }}>
                                    <th hidden>User ID</th>
                                    <th>First Name</th>
                                    <th>Last Name</th>
                                    <th>Email</th>
                                    <th>Number</th>
                                    <th>Event participated In</th>
                                    <th>Payment</th>
                                    <th>Actions</th>
                                    {/* Add more columns based on participant data */}
                                </tr>
                            </thead>
                            {/* Add more columns based on participant data */}
                            <tbody>
                                {participants.map(participant => (
                                    <tr key={participant.UserID}>
                                        <td hidden>{participant.UserID}</td>
                                        <td>{participant.FirstName}</td>
                                        <td>{participant.LastName}</td>
                                        <td>
                                            <a href={`mailto:${participant.UserEmail}`} className='mailto'>{participant.UserEmail}</a></td>
                                        <td>{participant.User_Number}</td>
                                        <td>{participant.EventParticipation ? participant.EventParticipation.EventName : 'Not Participating'}</td>
                                        <td>{participant.EventParticipation ? participant.EventParticipation.Price : 'N/A'} Dt</td>
                                        <td>
                                            <span className='actionBtns'>
                                                {/* Edit button */}
                                                <FaEdit className='FaEdit' onClick={() => handlePartEditClick(participant)} title="Edit Participant Info" />

                                                {/* Delete button */}
                                                <FaTrash className='FaDelete' onClick={() => handleDeleteClick(participant)} title="Delete Participant" />
                                            </span>

                                        </td>
                                        {/* Add more columns based on participant data */}
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
                            isOpen={isEditPartModalOpen}
                            onRequestClose={() => setEditPartModalOpen(false)}
                            contentLabel="Edit Participant Modal"
                            className="custom-edit-modal"
                            overlayClassName="custom-overlay"
                        >
                            <div className="edit-dialog">
                                <span className='close-btn'>
                                    <p type="button" className='clsBtn' onClick={() => setEditPartModalOpen(false)}><IoMdCloseCircle /></p>
                                </span>
                                <h3>Editing Participant: <b><i>{editedParticipant?.FirstName} {editedParticipant?.LastName} </i></b> </h3>
                                <form name='edit-participant' onSubmit={handlePartEditSubmit}>
                                    {/* Add form fields for participant details */}

                                    {error && (
                                        <div className="alert alert-danger" role="alert">
                                            {error}
                                        </div>
                                    )}

                                    <div className="row">
                                        <div className="col-25">
                                            <label htmlFor='firstname'>
                                                First Name:
                                            </label>
                                        </div>
                                        <div className="col-75">
                                            <input
                                                name='FirstName' id='firstname'
                                                type="text" required
                                                placeholder='Participant First Name'
                                                value={editedParticipant.FirstName}
                                                onChange={(e) => setEditedParticipant({ ...editedParticipant, FirstName: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-25">
                                            <label htmlFor='lastname'>
                                                Last Name:
                                            </label>
                                        </div>
                                        <div className="col-75">
                                            <input
                                                name='LastName' id='lastname'
                                                type="text" required
                                                placeholder='Participant Last Name'
                                                value={editedParticipant.LastName}
                                                onChange={(e) => setEditedParticipant({ ...editedParticipant, LastName: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-25">
                                            <label htmlFor='mail'>
                                                E-mail:
                                            </label>
                                        </div>
                                        <div className="col-75">
                                            <input
                                                name='email' id='mail'
                                                type="email" required
                                                placeholder='Participant E-mail'
                                                value={editedParticipant.UserEmail}
                                                onChange={(e) => setEditedParticipant({ ...editedParticipant, UserEmail: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-25">
                                            <label htmlFor='tel'>
                                                Phone Number:
                                            </label>
                                        </div>
                                        <div className="col-75">
                                            <input
                                                name='tel' id='tel'
                                                type="tel" required
                                                placeholder="Enter Phone Number : 21 345 678 or +216 21 345 678"
                                                value={editedParticipant.User_Number}
                                                onChange={(e) => {
                                                    setEditedParticipant({ ...editedParticipant, User_Number: e.target.value });
                                                    setError('');
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className='btns'>
                                        <button type="submit">Edit Participant</button>
                                        <button type="button" onClick={() => setEditPartModalOpen(false)}>Cancel</button>
                                    </div>

                                </form>
                            </div>
                        </Modal>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventParticipants;