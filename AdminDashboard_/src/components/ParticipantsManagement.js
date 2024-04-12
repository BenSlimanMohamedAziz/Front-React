// src/components/ParticipantsManagement.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { useLocation, useNavigate, useParams, BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import { FaSignOutAlt, FaCog, FaBell, FaUsers, FaCalendar, FaHome, FaPlus, FaEye, FaTrash, FaEdit, FaSearch, FaAngleLeft, FaAngleRight, FaDownload } from 'react-icons/fa';
import { CSVLink } from 'react-csv'; // Import CSVLink from react-csv
import { IoMdCloseCircle } from "react-icons/io";


const ParticipantsManagement = () => {
    const [participants, setParticipants] = useState([]);
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const participantsPerPage = 8;
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [adminInfo, setadminInfo] = useState({
        AdminFirstName: '',
        AdminLastName: '',
        AdminEmail: '',
        AdminPhone: '',
        AdminPassword: '',
        AdminPhoto: '',
    });
    const [editedParticipant, setEditedParticipant] = useState({
        FirstName: '',
        LastName: '',
        UserEmail: '',
        User_Number: '',
        // Add other fields as needed
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
    }

    useEffect(() => {
        // Fetch total number of participants to calculate total pages
        axios.get('http://127.0.0.1:8000/user')
            .then(response => {
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

                const totalPagesCount = Math.ceil(filteredParticipants.length / participantsPerPage);
                setTotalPages(totalPagesCount);

                // Fetch participants from Django API based on the current page and participants per page
                const startIndex = (currentPage - 1) * participantsPerPage;
                const endIndex = startIndex + participantsPerPage;
                const newStartIndex = (currentPage - 1) * participantsPerPage;
                const newEndIndex = newStartIndex + participantsPerPage;
                setStartIndex(newStartIndex);
                setEndIndex(newEndIndex);
                // Set the filtered participants to the state
                setParticipants(filteredParticipants.slice(newStartIndex, newEndIndex));
            })
            .catch(error => console.error('Error fetching total participants:', error));

        // Fetch participants from Django API based on the current page and participants per page
        //const startIndex = (currentPage - 1) * participantsPerPage;
        //const endIndex = startIndex + participantsPerPage;

        //axios.get(`http://127.0.0.1:8000/user`)
        // .then(response => setParticipants(response.data.slice(startIndex, endIndex)))
        //.catch(error => console.error('Error fetching participants:', error));
    }, [currentPage, searchTerm]);

    const handleEditClick = (participant) => {
        setSelectedParticipant(participant);
        setEditedParticipant({
            FirstName: participant.FirstName,
            LastName: participant.LastName,
            UserEmail: participant.UserEmail,
            User_Number: participant.User_Number,
            // Add other fields as needed
        });
        setEditModalOpen(true);
    };

    const handleDeleteClick = (participant) => {
        const previousPage = currentPage;
        const confirmDelete = window.confirm('Are you sure you want to delete this Participant?');
        const userIdToDelete = participant.UserID;
        if (confirmDelete) {
            axios.delete(`http://127.0.0.1:8000/user/${userIdToDelete}`)
                .then(response => {
                    console.log(response.data.message);
                    setParticipants(participants.filter(p => p.UserID !== userIdToDelete));
                    if (participants.length === 1 && previousPage !== 1) {
                        // If the current page has only one item and it's being deleted,
                        // navigate back to the previous page
                        setCurrentPage(previousPage - 1);
                    }
                })
                .catch(error => console.error('Error deleting participant:', error));
        }
    };

    const handleValidInput = () => {
        return /^(?:\+?[0-9]{3}\s?[0-9]{2}\s?[0-9]{3}\s?[0-9]{3}|[0-9]{2}\s?[0-9]{3}\s?[0-9]{3})$/.test(editedParticipant.User_Number);
    };


    const handleEditSubmit = () => {

        if (!handleValidInput()) {
            setError('Phone number is invalid. Please enter a valid phone number.');
            return;
        } else {
            setError('');
        }

        axios.put(`http://127.0.0.1:8000/user/${selectedParticipant.UserID}`, {
            UserID: selectedParticipant.UserID, // Include UserID in the request payload
            ...editedParticipant,
        })
            .then(response => {
                setParticipants(response.data);
                setParticipants(participants.map(p => (p.UserID === selectedParticipant.UserID ? { ...p, ...editedParticipant } : p)));
                alert('Participant Updated successfully');
                setEditModalOpen(false);
            })
            .catch(error => console.error('Error updating participant:', error));
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
        const csvData = participants.map(participant => ({
            FirstName: participant.FirstName,
            LastName: participant.LastName,
            UserEmail: participant.UserEmail,
            User_Number: participant.User_Number,
            EventIn: participant.EventParticipation.EventName,
            Payment: participant.EventParticipation.Price + ' Dt',
            EventStart: participant.EventParticipation.DateStart,
            EventEnd: participant.EventParticipation.DateEnd,
        }));

        // Define CSV headers
        const headers = [
            { label: 'First Name', key: 'FirstName' },
            { label: 'Last Name', key: 'LastName' },
            { label: 'Email', key: 'UserEmail' },
            { label: 'Phone Number', key: 'User_Number' },
            { label: 'Event Participated In', key: 'EventIn' },
            { label: 'Payment', key: 'Payment' },
            { label: 'Event Date Start', key: 'EventStart' },
            { label: 'Event Date End', key: 'EventEnd' },
        ];    // Return CSVLink component with data and headers
        return (
            <CSVLink data={csvData} headers={headers} filename={'organizers_list.csv'}>
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
                            <h2 style={{ fontFamily: '"Rowdies", sans-serif' }}><b>Participants Management :</b> </h2>
                            <br />
                            <input type='search' placeholder='Search Participants' value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)} style={{ fontFamily: '"Rowdies", sans-serif' }}></input> <FaSearch style={{ marginLeft: '-35px', marginTop: '-4px', marginRight: '25px' }} />
                            {handleCSVDownload()}
                            <table>
                                <thead>
                                    <tr style={{ fontFamily: '"Rowdies", sans-serif' }}>
                                        {/*<th>User ID</th>*/}
                                        <th>First Name</th>
                                        <th>Last Name</th>
                                        <th>Phone</th>
                                        <th>Email</th>
                                        <th>Event participated In</th>
                                        <th>Payment</th>
                                        <th>Event Start Date</th>
                                        <th>Event End Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {participants.map(participant => (
                                        <tr key={participant.UserID}>
                                            {/* <td>{participant.UserID}</td>*/}
                                            <td>{participant.FirstName}</td>
                                            <td>{participant.LastName}</td>
                                            <td>{participant.User_Number}</td>
                                            <td>
                                                <a href={`mailto:${participant.UserEmail}`} className='mailto'>{participant.UserEmail}</a></td>
                                            <td>{participant.EventParticipation ? participant.EventParticipation.EventName : 'Not Participating'}</td>
                                            <td>{participant.EventParticipation ? participant.EventParticipation.Price : '0'} Dt</td>
                                            <td>{participant.EventParticipation ? participant.EventParticipation.DateStart : 'N/A'}</td>
                                            <td>{participant.EventParticipation ? participant.EventParticipation.DateEnd : 'N/A'}</td>
                                            <td>
                                                <span className='actionBtns'>
                                                    {/* View button 
                                                    <FaEye className='FaEye' onClick={() => handleViewParticipant(participant)} title="View Participant Info" />*/}



                                                    {/* Edit button */}
                                                    <FaEdit className='FaEdit' onClick={() => handleEditClick(participant)} title="Edit Participant Info" />

                                                    {/* Delete button */}
                                                    <FaTrash className='FaDelete' onClick={() => handleDeleteClick(participant)} title="Delete Participant" />

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
                                contentLabel="Edit Participant Modal"
                                className="custom-edit-modal"
                                overlayClassName="custom-overlay"
                            >
                                <div className="edit-dialog" style={{ padding: '10px' }}>
                                    <span className='close-btn'>
                                        <p type="button" className='clsBtn' onClick={() => setEditModalOpen(false)}><IoMdCloseCircle /></p>
                                    </span>
                                    <h3>Editing Participant: <b><i>{selectedParticipant?.FirstName}</i></b> </h3>
                                    <form name='edit-participant' onSubmit={handleSubmit}>
                                        {error && (
                                            <div className="alert alert-danger" role="alert">
                                                {error}
                                            </div>
                                        )}
                                        <div className="row">
                                            <div className="col-25">
                                                <label htmlFor="first-name">
                                                    First Name:
                                                </label>
                                            </div>
                                            <div className="col-75">
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Participant First Name"
                                                    value={editedParticipant.FirstName}
                                                    onChange={(e) => setEditedParticipant({ ...editedParticipant, FirstName: e.target.value })}
                                                    id="first-name"
                                                />
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-25">
                                                <label htmlFor="last-name">
                                                    Last Name:
                                                </label>
                                            </div>
                                            <div className="col-75">
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Participant Last Name"
                                                    value={editedParticipant.LastName}
                                                    onChange={(e) => setEditedParticipant({ ...editedParticipant, LastName: e.target.value })}
                                                    id="last-name"
                                                />
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-25">
                                                <label htmlFor="phone-number">
                                                    Phone Number:
                                                </label>
                                            </div>
                                            <div className="col-75">
                                                <input
                                                    type="tel"
                                                    required
                                                    placeholder="Enter Phone Number : 21 345 678 or +216 21 345 678"
                                                    id="phone-number"
                                                    value={editedParticipant.User_Number}
                                                    onChange={(e) => setEditedParticipant({ ...editedParticipant, User_Number: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-25">
                                                <label htmlFor="email">
                                                    E-mail:
                                                </label>
                                            </div>
                                            <div className="col-75">
                                                <input
                                                    type="email"
                                                    required
                                                    placeholder="E-mail"
                                                    value={editedParticipant.UserEmail}
                                                    onChange={(e) => setEditedParticipant({ ...editedParticipant, UserEmail: e.target.value })}
                                                    id="email"
                                                />
                                            </div>
                                        </div>
                                        <br />
                                        <div className='btns'>
                                            <button type="submit" onClick={handleEditSubmit}>Edit Participant</button>
                                            <button type="button" onClick={() => setEditModalOpen(false)}>Cancel</button>
                                        </div>
                                    </form>
                                </div>
                            </Modal>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParticipantsManagement;