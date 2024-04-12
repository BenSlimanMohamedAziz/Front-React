// src/components/Settings.js

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams, BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.css';
import { FaSignOutAlt, FaCog, FaBell, FaUsers, FaCalendar, FaHome, FaPlus } from 'react-icons/fa';

const Settings = () => {
    const navigate = useNavigate();
    const { adminID } = useParams();

    const [adminInfo, setadminInfo] = useState({
        AdminFirstName: '',
        AdminLastName: '',
        AdminEmail: '',
        AdminPhone: '',
        AdminPassword: '',
        ConfirmPassword: '',
        AdminPhoto: '',
    });

    const [editedAdmin, seteditedAdmin] = useState({
        AdminFirstName: '',
        AdminLastName: '',
        AdminEmail: '',
        AdminPhone: '',
        AdminPassword: '',
        ConfirmPassword: '',
        AdminPhoto: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch admin's information from the backend API
        axios.get(`http://127.0.0.1:8000/admins/detail/${adminID}`)
            .then(response => {
                setadminInfo(response.data);
                seteditedAdmin({ // Set edited organizer without password
                    AdminFirstName: response.data.AdminFirstName,
                    AdminLastName: response.data.AdminLastName,
                    AdminEmail: response.data.AdminEmail,
                    AdminPhone: response.data.AdminPhone,
                    AdminPassword: '',
                    ConfirmPassword: '',
                    AdminPhoto: response.data.AdminPhoto
                });

            })
            .catch(error => console.error('Error fetching admin info:', error));
    }, [adminID]);

    const handleValidInput = () => {
        return /^(?:\+?[0-9]{3}\s?[0-9]{2}\s?[0-9]{3}\s?[0-9]{3}|[0-9]{2}\s?[0-9]{3}\s?[0-9]{3})$/.test(editedAdmin.AdminPhone);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();

        if (!handleValidInput()) {
            setError('Phone number is invalid. Please enter a valid phone number.');
            return;
        } else if (editedAdmin.AdminPassword !== editedAdmin.ConfirmPassword) {
            setError("Passwords doesn't match");
            return;
        } else {
            setError('');
        }

        const updatedAdmin = {
            AdminID: adminID,
            AdminFirstName: editedAdmin.AdminFirstName,
            AdminLastName: editedAdmin.AdminLastName,
            AdminEmail: editedAdmin.AdminEmail,
            AdminPhone: editedAdmin.AdminPhone,
            AdminPassword: editedAdmin.AdminPassword,
        };

        // Check if the password field is not empty and has been changed
        if (editedAdmin.AdminPassword !== '') {
            updatedAdmin.AdminPassword = editedAdmin.AdminPassword;
        }

        axios.put(`http://127.0.0.1:8000/admins/detail/${adminID}`, updatedAdmin)
            .then(response => {
                console.log('Updated:', response.data);
                alert('Updated successfully');
                window.location.reload();
            })
            .catch(error => console.error('Error updating Your info:', error));
    };

    const handleDeleteAcc = () => {
        const confirmDelete = window.confirm('Are you sure you want to delete your account?');
        if (confirmDelete) {
            axios.delete(`http://127.0.0.1:8000/admins/detail/${adminID}`)
                .then(response => {
                    console.log('Account deleted successfully:', response.data);
                    navigate('/Login'); // Redirect to login page after successful deletion
                })
                .catch(error => console.error('Error deleting account:', error));
        }
    };

    const handleInputChange = () => {
        setError('');// Reset error message when input changes
    };

    const handleLogout = () => {
        navigate('/Login');
    };

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
                        <br />        <br /><br />
                        <h2 style={{ fontFamily: '"Rowdies", sans-serif', textAlign: 'center', fontSize: '2.6rem' }}><b>Settings :</b> </h2>
                        <br />

                        <form name='ad-info-form-edit' onSubmit={handleEditSubmit}>
                            <div className='ad-info'>

                                {adminInfo.AdminPhoto && (
                                    <div className="image-container">
                                        <img className='admin-img'
                                            src={`http://127.0.0.1:8000${adminInfo.AdminPhoto}`}
                                            alt={`Photo of ${adminInfo.AdminFirstName}`}
                                        />
                                        <br />
                                        <h2>{editedAdmin.AdminFirstName + ' ' + editedAdmin.AdminLastName}</h2>
                                    </div>
                                )}

                                <div className="info-fields">
                                    <div className="row">
                                        <div className="col-25">
                                            <label htmlFor='name'>
                                                First Name:
                                            </label>
                                        </div>
                                        <div className="col-75">
                                            <input
                                                type="text" required name='AdminFirstName' id='name'
                                                value={editedAdmin.AdminFirstName}
                                                placeholder='Your First Name'
                                                onChange={(e) => {
                                                    seteditedAdmin({ ...editedAdmin, AdminFirstName: e.target.value });
                                                    handleInputChange();
                                                }}
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
                                                type="text" required name='AdminLastName' id='lastname'
                                                value={editedAdmin.AdminLastName}
                                                placeholder='Your First Name'
                                                onChange={(e) => {
                                                    seteditedAdmin({ ...editedAdmin, AdminLastName: e.target.value });
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
                                                type="email" required name='AdminEmail' id='mail'
                                                placeholder='Your E-mail'
                                                value={editedAdmin.AdminEmail}
                                                onChange={(e) => {
                                                    seteditedAdmin({ ...editedAdmin, AdminEmail: e.target.value });
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
                                                type="text" required name='AdminPhone' id='phone'
                                                placeholder="Enter your Phone Number : 21 345 678 or +216 21 345 678"
                                                value={editedAdmin.AdminPhone}
                                                onChange={(e) => {
                                                    seteditedAdmin({ ...editedAdmin, AdminPhone: e.target.value });
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
                                                <input name='AdminPassword' id='password'
                                                    placeholder='Your New Password'
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={editedAdmin.AdminPassword}
                                                    onChange={(e) => {
                                                        seteditedAdmin({ ...editedAdmin, AdminPassword: e.target.value });
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
                                                    value={editedAdmin.ConfirmPassword}
                                                    onChange={(e) => {
                                                        seteditedAdmin({ ...editedAdmin, ConfirmPassword: e.target.value });
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;