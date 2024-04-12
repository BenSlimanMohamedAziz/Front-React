// src/components/AddOrganizer.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, useParams, BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import { FaSignOutAlt, FaCog, FaBell, FaUsers, FaCalendar, FaHome, FaPlus} from 'react-icons/fa';

const AddOrganizerForm = ({ onOrganizerAdded }) => {

    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [adminInfo, setadminInfo] = useState({
        AdminFirstName: '',
        AdminLastName: '',
        AdminEmail: '',
        AdminPhone: '',
        AdminPassword: '',
        AdminPhoto: '',
    });

    const [organizerData, setOrganizerData] = useState({
        OrganizerName: '',
        OrganizerEmail: '',
        OrganizerPhone: '',
        OrganizerPassword: '',
        OrganizerConfPassword: '',
        OrganizerPhoto: null,
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === 'OrganizerPhoto') {
            setOrganizerData({ ...organizerData, [name]: files[0] || null });
        } else {
            setOrganizerData({ ...organizerData, [name]: value });
        }
    };
    const handleValidInput = () => {
        return /^(?:\+?[0-9]{3}\s?[0-9]{2}\s?[0-9]{3}\s?[0-9]{3}|[0-9]{2}\s?[0-9]{3}\s?[0-9]{3})$/.test(organizerData.OrganizerPhone);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!handleValidInput()) {
            setError('Phone number is invalid. Please enter a valid phone number.');
            return;
        } else if (organizerData.OrganizerPassword !== organizerData.OrganizerConfPassword) {
            setError("Password doesn't match");
            return;
        } else {
            setError('');
        }

        const formData = new FormData();
        formData.append('OrganizerName', organizerData.OrganizerName);
        formData.append('OrganizerEmail', organizerData.OrganizerEmail);
        formData.append('OrganizerPhone', organizerData.OrganizerPhone);
        formData.append('OrganizerPassword', organizerData.OrganizerPassword);
        formData.append('OrganizerPhoto', organizerData.OrganizerPhoto);

        try {
            const response = await axios.post('http://127.0.0.1:8000/organizer', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',  // Set content type to handle file upload
                },
            });

            console.log('Organizer added successfully:', response.data);
            // Show success dialogue
            alert('Organizer added successfully!');
            if (onOrganizerAdded) {
                onOrganizerAdded(response.data);
            }
            navigate(`/Organizer-management/${adminID}`);
        } catch (error) {
            console.error('Error adding organizer:', error);
        }
    };

    // Logout function
    const handleLogout = () => {
        navigate('/Login');
    };

    const handleCancelAdd = () => {
        navigate(`/Organizer-management/${adminID}`);
    }

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
                        <br />   <br />
                        <h2 style={{ fontFamily: '"Rowdies", sans-serif', textAlign: 'center' }}><b>Add New Organizer :</b> </h2>
                        <br />
                        <form name="add-Org" onSubmit={handleSubmit}>

                            <div className='add-form-org'>
                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}
                                <div className="row">
                                    <div className="col-25">
                                        <label htmlFor="organizerName">
                                            Organizer:
                                        </label>
                                    </div>
                                    <div className="col-75">
                                        <input
                                            type="text"
                                            id="organizerName"
                                            name="OrganizerName"
                                            placeholder='Organizer Name'
                                            value={organizerData.OrganizerName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-25">
                                        <label htmlFor="organizerEmail">
                                            Email:
                                        </label>
                                    </div>
                                    <div className="col-75">
                                        <input
                                            type="email"
                                            id="organizerEmail"
                                            placeholder='Organizer Email'
                                            name="OrganizerEmail"
                                            value={organizerData.OrganizerEmail}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-25">
                                        <label htmlFor="organizerPhone">
                                            Phone Number :
                                        </label>
                                    </div>
                                    <div className="col-75">
                                        <input
                                            type="tel"
                                            id="organizerPhone"
                                            placeholder="Enter Phone Number : 21 345 678 or +216 21 345 678"
                                            name="OrganizerPhone"
                                            value={organizerData.OrganizerPhone}
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
                                        <label htmlFor="organizerPassword">
                                            Password:
                                        </label>
                                    </div>
                                    <div className="col-75">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="organizerPassword"
                                            placeholder='Organizer Password'
                                            name="OrganizerPassword"
                                            value={organizerData.OrganizerPassword}
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
                                        <label htmlFor="confirmPassword">
                                            Confirm Password:
                                        </label>
                                    </div>
                                    <div className="col-75">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="confirmPassword"
                                            name="OrganizerConfPassword"
                                            placeholder='Confirm Password'
                                            value={organizerData.OrganizerConfPassword}
                                            onChange={(e) => {
                                                handleChange(e);
                                                setError('');
                                            }}
                                            required
                                        />
                                    </div>
                                    <span className='EditpassShowHide'
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <p> {showPassword ? 'Hide Passwords' : 'Show Passwords'}</p>
                                    </span>
                                </div>

                                <div className="row">
                                    <div className="col-25">
                                        <label htmlFor="organizerPhoto">
                                            Organizer Image:
                                        </label>
                                    </div>
                                    <div className="col-75">
                                        <input
                                            type="file"
                                            id="organizerPhoto"
                                            name="OrganizerPhoto"
                                            placeholder=''
                                            required
                                            onChange={handleChange}
                                            accept="image/*"
                                        />
                                    </div>
                                </div>



                                <div className='btns'>
                                    <button type="submit">Add Organizer</button>
                                    <button type='button' onClick={handleCancelAdd}>Cancel</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddOrganizerForm;