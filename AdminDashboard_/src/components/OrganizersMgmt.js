// src/components/OrganizersMgmt.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, useParams, BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Modal from 'react-modal';
import 'bootstrap/dist/css/bootstrap.css';
import { FaSignOutAlt, FaCog, FaBell, FaUsers, FaCalendar, FaHome, FaPlus, FaEye, FaTrash, FaEdit, FaSearch, FaAngleLeft, FaAngleRight, FaDownload } from 'react-icons/fa';
import { CSVLink } from 'react-csv'; // Import CSVLink from react-csv
import { IoMdCloseCircle } from "react-icons/io";

const OrganizersManagement = () => {
    const [organizers, setOrganizers] = useState([]);
    const [selectedOrganizer, setSelectedOrganizer] = useState(null);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isEventsModalOpen, setEventsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const organizersPerPage = 8;
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

    const [editedOrganizer, setEditedOrganizer] = useState({
        OrganizerName: '',
        OrganizerEmail: '',
        OrganizerPhone: '',
        OrganizerPassword: '',
        ConfirmPassword: '',
        OrganizerPhoto: '', // Initialize as empty
    });
    const [showPassword, setShowPassword] = useState(false);
    const [organizerEvents, setOrganizerEvents] = useState([]);

    useEffect(() => {
        // Fetch organizer's information from the backend API
        axios.get('http://127.0.0.1:8000/organizer')
            .then(response => {
                setOrganizers(response.data);
                setEditedOrganizer({ // Set edited organizer without password
                    OrganizerName: response.data.OrganizerName,
                    OrganizerEmail: response.data.OrganizerEmail,
                    OrganizerPhone: response.data.OrganizerPhone,
                    OrganizerPassword: '',
                    ConfirmPassword: '',
                    OrganizerPhoto: response.data.OrganizerPhoto,
                });
            })
            .catch(error => console.error('Error fetching organizer info:', error));
    }, []);


    useEffect(() => {
        // Fetch total number of organizers to calculate total pages
        axios.get('http://127.0.0.1:8000/organizer')
            .then(response => {
                setTotalPages(Math.ceil(response.data.length / organizersPerPage));
                // Filter organizers based on the search term
                const filteredOrganizers = response.data.filter(organizer =>
                    organizer.OrganizerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    organizer.OrganizerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    organizer.OrganizerPhone.toLowerCase().includes(searchTerm.toLowerCase())
                );
                // Fetch organizers from Django API based on the current page and organizers per page
                const startIndex = (currentPage - 1) * organizersPerPage;
                const endIndex = startIndex + organizersPerPage;
                // Set the filtered organizers to the state
                setOrganizers(filteredOrganizers.slice(startIndex, endIndex));
            })
            .catch(error => console.error('Error fetching total organizers:', error));
    }, [currentPage, searchTerm]);

    const handleViewOrganizer = (organizer) => {
        setSelectedOrganizer(organizer);
        setViewModalOpen(true);
        setEditModalOpen(false);
        setEventsModalOpen(false);
    };

    const handleEditClick = (organizer) => {
        setSelectedOrganizer(organizer);
        setEditedOrganizer({
            OrganizerName: organizer.OrganizerName,
            OrganizerEmail: organizer.OrganizerEmail,
            OrganizerPhone: organizer.OrganizerPhone,
            OrganizerPassword: '', // Leave password field empty
            ConfirmPassword: '', // Leave password field empty
        });
        setEditModalOpen(true);
        setViewModalOpen(false);
        setEventsModalOpen(false);
    };

    /*const handleViewEventsClick = (organizer) => {
        setSelectedOrganizer(organizer);
        axios.get(`http://127.0.0.1:8000/organizer/${organizer.OrganizerID}/events`)
            .then(response => {
                setOrganizerEvents(response.data);
                setEventsModalOpen(true);
                setEditModalOpen(false);
                setViewModalOpen(false);
            })
            .catch(error => console.error('Error fetching organizer events:', error));
    };
*/
    const handleValidInput = () => {
        return /^(?:\+?[0-9]{3}\s?[0-9]{2}\s?[0-9]{3}\s?[0-9]{3}|[0-9]{2}\s?[0-9]{3}\s?[0-9]{3})$/.test(editedOrganizer.OrganizerPhone);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();

        if (!handleValidInput()) {
            setError('Phone number is invalid. Please enter a valid phone number.');
            return;
        } else if (editedOrganizer.OrganizerPassword !== editedOrganizer.ConfirmPassword) {
            setError("Password doesn't match");
            return;
        } else {
            setError('');
        }
        const updatedOrganizer = {
            OrganizerID: selectedOrganizer.OrganizerID,
            OrganizerName: editedOrganizer.OrganizerName,
            OrganizerEmail: editedOrganizer.OrganizerEmail,
            OrganizerPhone: editedOrganizer.OrganizerPhone,
            OrganizerPassword: editedOrganizer.OrganizerPassword,
        };

        /*if (editedOrganizer.OrganizerPassword !== '') {
            updatedOrganizer.OrganizerPassword = editedOrganizer.OrganizerPassword;
        }*/
        // Check if the password field is not empty and has been changed
        if (editedOrganizer.OrganizerPassword !== '') {
            updatedOrganizer.OrganizerPassword = editedOrganizer.OrganizerPassword;
        }

        axios.put(`http://127.0.0.1:8000/organizer/${selectedOrganizer.OrganizerID}`, updatedOrganizer)
            .then(response => {
                setOrganizers(response.data);
                setOrganizers(organizers.map(o => (o.OrganizerID === selectedOrganizer.OrganizerID ? { ...o, ...updatedOrganizer } : o)));
                alert('Organizer Updated successfully');
                setEditModalOpen(false);
            })
            .catch(error => console.error('Error updating organizer:', error));
    };

    const handleInputChange = () => {
        setError('');// Reset error message when input changes
    };

    const handleDeleteClick = (organizer) => {
        const previousPage = currentPage;
        const confirmDelete = window.confirm('Are you sure you want to delete this Organizer?');
        const organizerIdToDelete = organizer.OrganizerID;
        if (confirmDelete) {
            axios.delete(`http://127.0.0.1:8000/organizer/${organizerIdToDelete}`)
                .then(response => {
                    console.log(response.data.message);
                    setOrganizers(organizers.filter(o => o.OrganizerID !== organizerIdToDelete));
                    if (organizers.length === 1 && previousPage !== 1) {
                        // If the current page has only one item and it's being deleted,
                        // navigate back to the previous page
                        setCurrentPage(previousPage - 1);
                    }
                })
                .catch(error => console.error('Error deleting organizer:', error));
        }
    };


    const handleSubmit = (e) => {
        e.preventDefault();
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
        const csvData = organizers.map(organizer => ({
            OrganizerName: organizer.OrganizerName,
            OrganizerEmail: organizer.OrganizerEmail,
            OrganizerPhone: organizer.OrganizerPhone,
            OrganizerPhoto: organizer.OrganizerPhoto,
        }));

        // Define CSV headers
        const headers = [
            { label: 'Organizer', key: 'OrganizerName' },
            { label: 'Organizer Email', key: 'OrganizerEmail' },
            { label: 'Phone Number', key: 'OrganizerPhone' },
            { label: 'Organizer Image', key: 'OrganizerPhoto' },
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
                            <h2 style={{ fontFamily: '"Rowdies", sans-serif' }}><b>Organizers Management :</b> </h2>
                            <br />
                            <input type='search' placeholder='Search Events' value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)} style={{ fontFamily: '"Rowdies", sans-serif' }}></input> <FaSearch style={{ marginLeft: '-35px', marginTop: '-4px', marginRight: '25px' }} />
                            {handleCSVDownload()}
                            <table>
                                <thead>
                                    <tr style={{ fontFamily: '"Rowdies", sans-serif' }}>
                                        <th>Organizer</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        {/*<th>Organizer Img</th>*/}
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {organizers.map(organizer => (
                                        <tr key={organizer.OrganizerID}>
                                            <td>{organizer.OrganizerName}</td>
                                            <td><a href={`mailto:${organizer.OrganizerEmail}`} className='mailto'>{organizer.OrganizerEmail}</a></td>
                                            <td>{organizer.OrganizerPhone}</td>
                                            {/*<td>
                                                {organizer.OrganizerPhoto && (
                                                    <img
                                                        src={`http://127.0.0.1:8000${organizer.OrganizerPhoto}`}
                                                        alt={`Photo of ${organizer.OrganizerName}`}
                                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                    />
                                                )}
                                                </td>*/}
                                            <td>

                                                <span className='actionBtns'>
                                                    {/* View button */}
                                                    <FaEye className='FaEye' onClick={() => handleViewOrganizer(organizer)} title="View Organizer Info" />
                                                    {/* View button 
                                                    <FaList className='FaList' onClick={() => handleViewEventsClick(organizer)} title="View Events" />*/}

                                                    {/* Edit button */}
                                                    <FaEdit className='FaEdit' onClick={() => handleEditClick(organizer)} title="Edit Organizer Info" />

                                                    {/* Delete button */}
                                                    <FaTrash className='FaDelete' onClick={() => handleDeleteClick(organizer)} title="Delete Organizer" />

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
                                contentLabel="Edit Organizer Modal"
                                className="custom-edit-modal"
                                overlayClassName="custom-overlay"
                            >
                                <div className="edit-dialog">
                                    <span className='close-btn'>
                                        <p type="button" className='clsBtn' onClick={() => setEditModalOpen(false)}><IoMdCloseCircle /></p>
                                    </span>
                                    <h3>Editing Organizer: <b><i>{selectedOrganizer?.OrganizerName}</i></b> </h3>
                                    <form name='edit-organizer' onSubmit={handleSubmit} encType="multipart/form-data">

                                        {error && (
                                            <div className="alert alert-danger" role="alert">
                                                {error}
                                            </div>
                                        )}

                                        <div className="info-fields">
                                            <div className="row">
                                                <div className="col-25">
                                                    <label htmlFor='Name'>
                                                        Organizer:
                                                    </label>
                                                </div>
                                                <div className="col-75">
                                                    <input
                                                        type="text" required id='Name'
                                                        placeholder='Organizer Name'
                                                        value={editedOrganizer.OrganizerName}
                                                        onChange={(e) => setEditedOrganizer({ ...editedOrganizer, OrganizerName: e.target.value })}
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
                                                        type="email" required
                                                        id='mail'
                                                        placeholder='Organizer E-mail'
                                                        value={editedOrganizer.OrganizerEmail}
                                                        onChange={(e) => setEditedOrganizer({ ...editedOrganizer, OrganizerEmail: e.target.value })}
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
                                                        type="tel" required id='tel' placeholder="Enter Phone Number : 21 345 678 or +216 21 345 678"
                                                        value={editedOrganizer.OrganizerPhone}
                                                        onChange={(e) => setEditedOrganizer({ ...editedOrganizer, OrganizerPhone: e.target.value })}
                                                    />
                                                </div>
                                            </div>


                                            <div className="row">
                                                <div className="col-25">
                                                    <label htmlFor='password'>
                                                        Password:
                                                    </label>
                                                </div>
                                                <div className="col-75">
                                                    <div style={{ display: 'flex' }}>
                                                        <input name='OrganizerPassword' id='password'
                                                            placeholder='Organizer New Password'
                                                            type={showPassword ? 'text' : 'password'}
                                                            value={editedOrganizer.OrganizerPassword}
                                                            onChange={(e) => {
                                                                setEditedOrganizer({ ...editedOrganizer, OrganizerPassword: e.target.value });
                                                                handleInputChange();
                                                            }}
                                                        />

                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col-25">

                                                    <label htmlFor='confPass'>
                                                        Confirm Password:
                                                    </label>
                                                </div>
                                                <div className="col-75">
                                                    <div style={{ display: 'flex' }}>
                                                        <input name='ConfirmPassword' id='confPass'
                                                            type={showPassword ? 'text' : 'password'}
                                                            placeholder='Confirm Password'
                                                            value={editedOrganizer.ConfirmPassword}
                                                            onChange={(e) => {
                                                                setEditedOrganizer({ ...editedOrganizer, ConfirmPassword: e.target.value });
                                                                handleInputChange();
                                                            }}
                                                        />

                                                    </div>
                                                </div>
                                            </div>
                                            <span className='EditpassShowHide'
                                                style={{ cursor: 'pointer', marginLeft: '5px' }}
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                <p> {showPassword ? 'Hide Passwords' : 'Show Passwords'}</p>
                                            </span>

                                            <div className='btns'>
                                                <button type="submit" onClick={handleEditSubmit}>Edit Organizer</button>
                                                <button type="button" onClick={() => setEditModalOpen(false)}>Cancel</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </Modal>

                            {/*<Modal
                                isOpen={isEventsModalOpen}
                                onRequestClose={() => setEventsModalOpen(false)}
                                contentLabel="Organizer Events Modal"
                                className="custom-modal-list"
                                overlayClassName="custom-overlay"
                            >
                                <div className="view-dialog">
                                    <span className='close-btn'>
                                        <p type="button" className='clsBtn' onClick={() => setEventsModalOpen(false)}><IoMdCloseCircle /></p>
                                    </span>
                                    <h3 style={{ color: 'black' }}>Events List for <b><i>{selectedOrganizer && selectedOrganizer.OrganizerName}</i></b></h3>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Event Name</th>
                                                <th>Description</th>
                                                <th>Start Date</th>
                                                <th>End Date</th>
                                                <th>Max Part</th>
                                                <th>Price</th>
                                                <th>Location</th>
                                                {/* Add other headings as needed }
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {organizerEvents.map(event => (
                                                <tr key={event.EventID}>
                                                    <td>{event.EventName}</td>
                                                    <td>{event.EventDescription}</td>
                                                    <td>{event.DateStart}</td>
                                                    <td>{event.DateEnd}</td>
                                                    <td>{event.MaxPar}</td>
                                                    <td>{event.Price} Dt</td>
                                                    <td>{event.Location}</td>
                                                    {/* Add other fields as needed /}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                </div>
                            </Modal>*/}

                            <Modal
                                isOpen={isViewModalOpen}
                                onRequestClose={() => setViewModalOpen(false)}
                                contentLabel="View Organizer Modal"
                                className="custom-modal-org"
                                overlayClassName="custom-overlay"
                            >
                                <div className="view-dialog">
                                    <span className='close-btn'>
                                        <p type="button" className='clsBtn' onClick={() => setViewModalOpen(false)}><IoMdCloseCircle /></p>
                                    </span>
                                    {/*<h3>Organizer: <b><i>{selectedOrganizer && selectedOrganizer?.OrganizerName}</i></b> </h3>

                                    Display other event details */}
                                    {selectedOrganizer?.OrganizerPhoto && (
                                        <img
                                            className='view-img-event'
                                            src={`http://127.0.0.1:8000${selectedOrganizer?.OrganizerPhoto}`}
                                            alt={`Photo of ${selectedOrganizer?.OrganizerName}`}
                                        />
                                    )}
                                    <br /><br />
                                    <p><b>Organizer :</b> {selectedOrganizer?.OrganizerName}</p>
                                    <p><b>Organizer Email :</b><a href={`mailto:${selectedOrganizer?.OrganizerEmail}`}>{selectedOrganizer?.OrganizerEmail}</a></p>
                                    <p><b>Phone Number:</b> {selectedOrganizer?.OrganizerPhone}</p>
                                </div>
                            </Modal>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizersManagement;