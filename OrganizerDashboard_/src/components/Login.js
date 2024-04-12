// Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.css';
import '../style/login_register.css'

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') || false);
    const navigate = useNavigate();

    useEffect(() => {
        const disableBack = () => {
          window.history.forward();
        };
    
        disableBack();
        
        window.onunload = function() { null };
    
        return () => {
          window.onunload = null;
        };
      }, []);
    

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://127.0.0.1:8000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    OrganizerEmail: email,
                    OrganizerPassword: password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Successful login, navigate to another page
                navigate('/Home', {
                    state: {
                        organizerID: data.organizer_id,
                        organizerName: data.organizer_name,
                        organizerEmail: data.organizer_email,
                        OrganizerPhone: data.organizer_phone,
                    },
                })
                setSuccessMessage('Logging In...');
                console.log('Login:', data.message);
            } else {
                // Handle login error
                console.error('Login failed:', data.message);
                setErrorMessage('Wrong credentials. Please check them.');
            }
        } catch (error) {
            console.error('Login error:', error.message);
            setErrorMessage('An error occurred. Please try again later.');
        }
    };

    // Function to toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    useEffect(() => {
        if (isLoggedIn) {
            navigate('/Home'); // Redirect if user is already logged in
        }
    }, [isLoggedIn, navigate]);

    const handleLogin = () => {
        // Perform login logic
        // After successful login
        localStorage.setItem('isLoggedIn', true);
        setIsLoggedIn(true);
    };
    // Function to handle sign-up button click
    const navigateToSignUp = () => {
        // Use window.location.href to navigate
        navigate('/Register')
    };
    const handleInputChange = () => {
        setErrorMessage(''); // Reset error message when input changes
    };


    return (
        <div className="container">
            <div className="card">
                <h2 className="card-title text-center mb-4">Login</h2>

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
                        <label htmlFor="email">E-mail</label>
                        <input
                            type="email"
                            className="form-control"
                            id="email" required
                            placeholder="Enter your E-mail"
                            value={email}
                            name='OrganizerEmail'
                            onChange={(e) => {
                                setEmail(e.target.value);
                                handleInputChange();
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-group">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="form-control"
                                id="password" required
                                name='OrganizerPassword'
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
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
                        <small id="passwordHelp" className="form-text text-muted">
                            <a href="./forgotPass">Forgot password?</a>
                        </small>
                    </div>

                    <div className='btn-container' style={{ marginTop: '30px' }}>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block mt-3"
                        >
                            Login
                        </button>

                        <button
                            type="button"
                            className="btn btn-secondary btn-block mt-3"
                            onClick={navigateToSignUp}
                        >
                            Sign Up
                        </button>
                    </div>
                </form>
            </div>

        </div>
    );
};

export default Login;
