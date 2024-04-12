// OrganizerProfile.js

import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate, BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.css';
import { FaSignOutAlt, FaCog, FaBell, FaUsers, FaCalendar, FaHome, FaPlus } from 'react-icons/fa';
import { MdSupportAgent } from "react-icons/md";

const OrganizerProfile = () => {
    const { organizerID, organizerName } = useParams();
    const navigate = useNavigate();
    const [adminInfo, setadminInfo] = useState({
        AdminFirstName: '',
        AdminLastName: '',
        AdminEmail: '',
        AdminPhone: '',
    });
    const [organizerInfo, setOrganizerInfo] = useState({
        OrganizerName: '',
        OrganizerEmail: '',
        OrganizerPhone: '',
        OrganizerPassword: '',
        ConfirmPassword: '',
        OrganizerPhoto: '',
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
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch admin's information from the backend API
        axios.get(`http://127.0.0.1:8000/admins/detail/1`)
            .then(response => {
                setadminInfo(response.data);
                setadminInfo({ // Set edited organizer without password
                    AdminFirstName: response.data.AdminFirstName,
                    AdminLastName: response.data.AdminLastName,
                    AdminEmail: response.data.AdminEmail,
                    AdminPhone: response.data.AdminPhone,
                });

            })
            .catch(error => console.error('Error fetching admin info:', error));
    }, []);

    useEffect(() => {
        // Fetch organizer's information from the backend API
        axios.get(`http://127.0.0.1:8000/organizer/detail/${organizerID}`)
            .then(response => {
                setOrganizerInfo(response.data);
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
    }, [organizerID]);

    const handleValidInput = () => {
        return /^(?:\+?[0-9]{3}\s?[0-9]{2}\s?[0-9]{3}\s?[0-9]{3}|[0-9]{2}\s?[0-9]{3}\s?[0-9]{3})$/.test(editedOrganizer.OrganizerPhone);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();

        if (!handleValidInput()) {
            setError('Phone number is invalid. Please enter a valid phone number.');
            return;
        } else if (editedOrganizer.OrganizerPassword !== editedOrganizer.ConfirmPassword) {
            setError("Passwords doesn't match");
            return;
        } else {
            setError('');
        }

        const updatedOrganizer = {
            OrganizerID: organizerID,
            OrganizerName: editedOrganizer.OrganizerName,
            OrganizerEmail: editedOrganizer.OrganizerEmail,
            OrganizerPhone: editedOrganizer.OrganizerPhone,
            OrganizerPassword: editedOrganizer.OrganizerPassword,
        };

        // Check if the password field is not empty and has been changed
        if (editedOrganizer.OrganizerPassword !== '') {
            updatedOrganizer.OrganizerPassword = editedOrganizer.OrganizerPassword;
        }

        axios.put(`http://127.0.0.1:8000/organizer/detail/${organizerID}`, updatedOrganizer)
            .then(response => {
                console.log('Organizer info updated:', response.data);
                alert('Updated successfully');
                window.location.reload();
            })
            .catch(error => console.error('Error updating organizer info:', error));
    };

    const handleDeleteAcc = () => {
        const confirmDelete = window.confirm('Are you sure you want to delete your account?');
        if (confirmDelete) {
            axios.delete(`http://127.0.0.1:8000/organizer/detail/${organizerID}`)
                .then(response => {
                    console.log('Account deleted successfully:', response.data);
                    navigate('/Login'); // Redirect to login page after successful deletion
                })
                .catch(error => console.error('Error deleting Account:', error));
        }
    };

    const handleInputChange = () => {
        setError('');// Reset error message when input changes
    };

    const handleLogout = () => {
        navigate('/Login');
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
                            <Link to={`/Organizer-settings/${organizerID}/${encodeURIComponent(organizerName)}`}>
                                <FaCog style={{ margin: '5px', fontSize: '1.1rem' }} /> Settings
                            </Link>
                            <a href="#logout" onClick={handleLogout} className='log_out'>
                                <FaSignOutAlt style={{ margin: '7px', fontSize: '1.2rem' }} />Logout
                            </a>
                        </div>
                    </div>
                </div>
                <div className="menu-container">
                    <div className="left-menu">
                        <h1 onClick={HomeButton} style={{ cursor: 'pointer' }}>Paradise Events</h1>
                        <br /> <br /><br />
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
                        <h2 style={{ fontFamily: '"Rowdies", sans-serif', textAlign: 'center', fontSize: '2.6rem' }}><b>Settings :</b> </h2>
                        <br />

                        <form name='org-info-form-edit' onSubmit={handleEditSubmit}>
                            <div className='org-info'>

                                {organizerInfo.OrganizerPhoto && (
                                    <div className="image-container">
                                        <img className='organizer-img'
                                            src={`http://127.0.0.1:8000${organizerInfo.OrganizerPhoto}`}
                                            alt={`Photo of ${organizerInfo.OrganizerName}`}
                                        />
                                        <br />
                                        <h2>{editedOrganizer.OrganizerName}</h2>
                                    </div>
                                )}

                                <div className="info-fields">
                                    <div className="row">
                                        <div className="col-25">
                                            <label htmlFor='name'>
                                                Organizer:
                                            </label>
                                        </div>
                                        <div className="col-75">
                                            <input
                                                type="text" required name='OrganizerName' id='name'
                                                value={editedOrganizer.OrganizerName}
                                                placeholder='You Organization Name'
                                                onChange={(e) => {
                                                    setEditedOrganizer({ ...editedOrganizer, OrganizerName: e.target.value });
                                                    handleInputChange();
                                                }}
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
                                                type="email" required name='OrganizerEmail' id='mail'
                                                placeholder='Your E-mail'
                                                value={editedOrganizer.OrganizerEmail}
                                                onChange={(e) => {
                                                    setEditedOrganizer({ ...editedOrganizer, OrganizerEmail: e.target.value });
                                                    handleInputChange();
                                                }}
                                            />
                                        </div>
                                    </div>


                                    <div className="row">
                                        <div className="col-25">
                                            <label htmlFor='phone'>
                                                Phone Number:
                                            </label>
                                        </div>
                                        <div className="col-75">
                                            <input
                                                type="text" required name='OrganizerPhone' id='phone'
                                                placeholder="Enter your Phone Number : 21 345 678 or +216 21 345 678"
                                                value={editedOrganizer.OrganizerPhone}
                                                onChange={(e) => {
                                                    setEditedOrganizer({ ...editedOrganizer, OrganizerPhone: e.target.value });
                                                    handleInputChange();
                                                }}
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
                                                    placeholder='Your New Password'
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
                                                    placeholder='Confirm Your Password'
                                                    value={editedOrganizer.ConfirmPassword}
                                                    onChange={(e) => {
                                                        setEditedOrganizer({ ...editedOrganizer, ConfirmPassword: e.target.value });
                                                        handleInputChange();
                                                    }}
                                                />

                                            </div>
                                        </div>
                                    </div>
                                    <span className='passShowHide'
                                        style={{ cursor: 'pointer', marginLeft: '5px' }}
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <p> {showPassword ? 'Hide Passwords' : 'Show Passwords'}</p>
                                    </span>
                                    {error && <p style={{ color: 'red', fontFamily: '"Rowdies", sans-serif' }}>{error}</p>}

                                    <div className='btns'>
                                        <button type="submit">Save Settings</button>
                                        <button type="button" onClick={handleDeleteAcc}>Delete Account</button>
                                    </div>
                                </div>
                            </div>
                        </form>
                        <br />
                        <span className='Supp_ad'>
                            <p><a href={`mailto:${adminInfo.AdminEmail}`}> Need Help? Contact Admin <MdSupportAgent className='supp_icon' /></a></p>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizerProfile;