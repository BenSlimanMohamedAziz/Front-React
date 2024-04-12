// Register.js

import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.css';
import '../style/login_register.css'
import { useLocation, useNavigate, BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [organizerData, setOrganizerData] = useState({
        OrganizerName: '',
        OrganizerEmail: '',
        OrganizerPhone: '',
        OrganizerPassword: '',
        OrganizerConfPassword: '',
        OrganizerPhoto: null,
    });

    useEffect(() => {
        const disableBack = () => {
            window.history.forward();
        };

        disableBack();

        window.onunload = function () { null };

        return () => {
            window.onunload = null;
        };
    }, []);

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
            setErrorMessage('Phone number is invalid. Please enter a valid phone number.');
            return;
        }

        if (organizerData.OrganizerPassword !== organizerData.OrganizerConfPassword) {
            setErrorMessage('Passwords do not match');
            return;
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
            if (response.data === 'Organizer Added Successfully') {
                // Show success message
                /* alert('Account created successfully. Logging you in now.');*/
                setSuccessMessage('Account created successfully. Logging you in now...');

                // Wait for 1 second before logging in
                setTimeout(async () => {
                    try {
                        // Perform login after 1 second delay
                        const loginResponse = await fetch('http://127.0.0.1:8000/login', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                OrganizerEmail: organizerData.OrganizerEmail,
                                OrganizerPassword: organizerData.OrganizerPassword,
                            }),
                        });

                        const loginData = await loginResponse.json();

                        if (loginResponse.ok) {
                            // Successful login, navigate to another page
                            navigate('/Home', {
                                state: {
                                    organizerID: loginData.organizer_id,
                                    organizerName: loginData.organizer_name,
                                    organizerEmail: loginData.organizer_email,
                                    organizerPhone: loginData.organizer_phone,
                                },
                            });
                        } else {
                            // Handle login error
                            console.error('Login error:', loginData.message);
                            setErrorMessage('Login error:', loginData.message);
                        }
                    } catch (error) {
                        console.error('Login failed:', error);
                        setErrorMessage('Something went wrong.');
                    }
                }, 1000); // 1000 milliseconds = 1 second delay
            } else {
                console.error('Error adding organizer:', response.data);
                setErrorMessage("Organizer's E-mail is already registered. Please use a different e-mail.");
            }
        } catch (error) {
            console.error('Error adding organizer:', error);
            setErrorMessage('Error adding organizer!');
        }
    };

    // Function to toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleInputChange = () => {
        setErrorMessage('');// Reset error message when input changes
        setSuccessMessage('');
    };

    // Function to handle sign-up button click
    const navigateToSignUp = () => {
        // Use window.location.href to navigate
        navigate('/Login')
    };

    return (
        <div className="container_register">
            <div className="card_register">
                <h2 className="card-title text-center mb-4">Create New Account</h2>

                {errorMessage && (
                    <div className="alert alert-danger" role="alert">
                        {errorMessage}
                    </div>
                )}


                {successMessage && (
                    <div className="alert alert-success" role="alert">
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Organizer:</label>
                        <input
                            className="form-control"
                            id="name" required
                            placeholder="Enter your Organization name"
                            type="text"
                            name="OrganizerName"
                            value={organizerData.OrganizerName}
                            onChange={(e) => {
                                handleChange(e);
                                handleInputChange();
                            }}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">E-mail:</label>
                        <input
                            type="email"
                            className="form-control"
                            id="email" required
                            placeholder="Enter your E-mail"
                            name="OrganizerEmail"
                            value={organizerData.OrganizerEmail}
                            onChange={(e) => {
                                handleChange(e);
                                handleInputChange();
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor='phone'>
                            Phone Number:
                        </label>
                        <input
                            className="form-control"
                            name="OrganizerPhone"
                            type="tel"
                            placeholder="Enter your Phone Number : 21 345 678 or +216 21 345 678"
                            id='phone'
                            value={organizerData.OrganizerPhone}
                            required
                            onChange={(e) => {
                                handleChange(e);
                                handleInputChange();
                            }}
                        />

                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <div className="input-group">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="form-control regisPass"
                                id="password" required
                                name='OrganizerPassword'
                                placeholder="Enter your password"
                                value={organizerData.OrganizerPassword}
                                onChange={(e) => {
                                    handleChange(e);
                                    handleInputChange();
                                }}
                            />
                            <div className="input-group-append">
                                <span
                                    className="input-group-text"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => togglePasswordVisibility()}
                                    aria-hidden="true"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                        </div>

                    </div>
                    <div className="form-group">
                        <label htmlFor="Confpassword">Confirm Password:</label>
                        <div className="input-group">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="form-control"
                                id="Confpassword" required
                                name='OrganizerConfPassword'
                                placeholder="Confirm your password"
                                onChange={(e) => {
                                    handleChange(e);
                                    handleInputChange();
                                }}
                            />
                            <div className="input-group-append">
                                <span
                                    className="input-group-text"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => togglePasswordVisibility()}
                                    aria-hidden="true"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor='imgorg' style={{ marginTop: '15px' }}>
                                Image:
                            </label>

                            <div className="input-group">

                                <input
                                    type="file"
                                    name="OrganizerPhoto"
                                    className="form-control"
                                    onChange={(e) => {
                                        handleChange(e);
                                        handleInputChange();
                                    }}
                                    accept="image/*"
                                    id='imgorg'
                                    required

                                />
                            </div></div>

                        <small id="passwordHelp" className="form-text text-muted">
                            <a style={{ cursor: 'pointer' }} onClick={navigateToSignUp}>Already have an account ? Login Here</a>
                        </small>
                    </div>
                    <br /><br />

                    <div className='btn-container'>
                        <button
                            type="submit"
                            className="btn btn-primary btn-block mt-2"
                        >
                            Create
                        </button>
                    </div>
                </form>
            </div>

        </div>
    );
};

export default Register;
