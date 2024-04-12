//Organizer Home page

import React, { useState, useEffect } from 'react';
import { useLocation,useParams, useNavigate, BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.css';
import { FaSignOutAlt, FaCog, FaBell, FaUsers, FaCalendar, FaHome, FaDollarSign, FaPlus } from 'react-icons/fa';
import { Line, Bar, Pie } from 'react-chartjs-2'; // Importing Line from Chart.js
import { CategoryScale } from 'chart.js';
import Chart from 'chart.js/auto';

const OrganizerInfo = () => {
    const location = useLocation();
    const { state } = location;
    const navigate = useNavigate();
    const [participants, setParticipants] = useState([]);
    const [organizerEvents, setOrganizerEvents] = useState([]);
    //const [setChartData] = useState({});
    const [organizerInfo, setOrganizerInfo] = useState({
        OrganizerName: '',
        OrganizerEmail: '',
        OrganizerPhone: '',
        OrganizerPassword: '',
        OrganizerPhoto: '',
    });

    useEffect(() => {
        if (!state) {
            const disableBack = () => {
                window.history.forward();
                window.history.back(); // Backward navigation
            };

            disableBack();

            window.onunload = function () { null };

            return () => {
                window.onunload = null;
            };
        }
    }, []);

    // Logout function
    const handleLogout = () => {

        // Redirect to the login page
        navigate('/Login');
        localStorage.removeItem('isLoggedIn');
    };
    // Check if state is defined before destructuring
    if (!state) {
        // Handle the case where state is undefined
        return <div>Error! You need To Login!</div>;
    }

    const { organizerID, organizerName, organizerEmail, organizerPhone, organizerPhoto } = state;
    useEffect(() => {
        // Fetch organizer's information from the backend API
        axios.get(`http://127.0.0.1:8000/organizer/detail/${organizerID}`)
            .then(response => {
                setOrganizerInfo(response.data);
                setOrganizerInfo({ // Set edited organizer without password
                    OrganizerName: response.data.OrganizerName,
                    OrganizerEmail: response.data.OrganizerEmail,
                    OrganizerPhone: response.data.OrganizerPhone,
                    OrganizerPassword: '',
                    OrganizerPhoto: response.data.OrganizerPhoto,
                });
            })
            .catch(error => console.error('Error fetching organizer info:', error));
    }, [organizerID]);

    useEffect(() => {
        // Fetch organizer's events when the component mounts or organizerID changes
        if (organizerID) {
            axios.get(`http://127.0.0.1:8000/organizer/${organizerID}/events`)
                .then(response => {
                    setOrganizerEvents(response.data);
                })
                .catch(error => console.error('Error fetching organizer events:', error));
        }
    }, [organizerID]); // Add organizerID as a dependency*/


    useEffect(() => {
        // Fetch participants data based on the organizerID
        // Replace the placeholder URL with your actual API endpoint
        fetch(`http://127.0.0.1:8000/organizer/${organizerID}/participants`)
            .then(response => response.json())
            .then(data => setParticipants(data))
            .catch(error => console.error('Error fetching participants:', error));
    }, [organizerID]);

    const handlehomeclick = (e) => {
        e.preventDefault(); // This prevents the default behavior of the link
        // You can add any custom behavior here if needed
    };
    const calculateTotalPayment = () => {
        let totalPayment = 0;
        participants.forEach(participant => {
            if (participant.EventParticipation && participant.EventParticipation.Price) {
                // Parse price as a number before adding to totalPayment
                totalPayment += parseFloat(participant.EventParticipation.Price);
            }
        });
        return totalPayment.toFixed(2); // ensure two decimal places
    };


    // Calculate the total number of participants for each event
    const calculateParticipantsPerEvent = () => {
        const participantsPerEvent = {};

        // Initialize participants count for each event to 0
        organizerEvents.forEach(event => {
            participantsPerEvent[event.EventID] = 0;
        });

        // Iterate over participants and accumulate count for each event
        participants.forEach(participant => {
            if (participant.EventParticipation && participant.EventParticipation.EventID) {
                // Accumulate count for the corresponding event
                participantsPerEvent[participant.EventParticipation.EventID]++;
            }
        });

        // Convert event IDs to event names
        const result = {};
        organizerEvents.forEach(event => {
            const eventName = event.EventName;
            const eventID = event.EventID;
            if (participantsPerEvent[eventID] !== undefined) {
                result[eventName] = participantsPerEvent[eventID];
            }
        });

        return result;
    };


    // Collect data for the chart
    const chartData = {
        labels: Object.keys(calculateParticipantsPerEvent()), // Event names as labels
        datasets: [{
            label: 'Number of Participants',
            data: Object.values(calculateParticipantsPerEvent()), // Number of participants per event
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)', // Red
                'rgba(54, 162, 235, 0.2)', // Blue
                'rgba(255, 206, 86, 0.2)', // Yellow
                // Add more colors as needed
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                // Add more border colors if needed
            ],
            borderWidth: 2
        }]
    };
    const chartOptions = {
        plugins: {
            title: {
                display: true,
                text: 'Number of Participants in My Events',
                font: {
                    size: 20,
                },
                color: 'Blue',
            }
        },
        scales: {
            y: {
                type: 'linear', // magic
                ticks: {
                    stepSize: 1,
                },
            },
        },
    };
    Chart.register(CategoryScale);

    const calculateEventIncome = () => {
        const eventIncome = {};

        organizerEvents.forEach(event => {
            let income = 0;

            participants.forEach(participant => {
                if (participant.EventParticipation && participant.EventParticipation.EventID === event.EventID) {
                    // Assuming event price is stored in event.Price
                    income += parseFloat(event.Price);
                }
            });

            eventIncome[event.EventName] = income;
        });

        return eventIncome;
    };
    const eventIncomeData = {
        labels: Object.keys(calculateEventIncome()),
        datasets: [{
            data: Object.values(calculateEventIncome()),
            backgroundColor: [
                'rgb(28, 37, 54)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(255, 159, 64, 0.6)'
            ]
        }]
    };
    const pieChartOptions = {
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const label = context.label || '';
                        const value = context.parsed.toFixed(2) + ' Dt'; // Append "Dt" to the value
                        return ` Event Income: ${value}`;
                    }
                }
            },
            title: {
                display: true,
                text: 'Events Income',
                font: {
                    size: 20,
                },
                color: 'Blue',
            }
        }
    };

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
                            <a style={{ margin: '8px', fontSize: '1.0rem' }}>  {organizerInfo.OrganizerName} </a>
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
                        <h1 onClick={handlehomeclick} style={{ cursor: 'pointer' }}>Paradise Events</h1>
                        <br />   <br /> <br />
                        <Link to="/" onClick={handlehomeclick} ><FaHome style={{ marginTop: '-5px', marginRight: '5px' }} /> Home</Link>
                        <hr />

                        <Link to={`/Events-management/${organizerID}/${encodeURIComponent(organizerName)}`}><FaCalendar style={{ marginTop: '-5px', marginRight: '5px' }} /> Events Management</Link>
                        <hr />

                        <Link to={`/Add-Events/${organizerID}/${encodeURIComponent(organizerName)}`}><FaPlus style={{ marginTop: '-5px', marginRight: '5px' }} /> Add New Event</Link>
                        <hr />

                        <Link to={`/Participants-management/${organizerID}/${encodeURIComponent(organizerName)}`}><FaUsers style={{ marginTop: '-5px', marginRight: '5px' }} /> Participants Management</Link>
                        <hr />

                        <Link to={`/Organizer-settings/${organizerID}/${encodeURIComponent(organizerName)}`}><FaCog style={{ marginTop: '-5px', marginRight: '5px' }} /> User Settings</Link>
                        <hr />
                        
                        <p onClick={handleLogout} >Logout <FaSignOutAlt style={{ margin: '5px', marginLeft: '6px' }} /></p>
                    </div>

                    <div className="content" style={{ fontFamily: '"Rowdies", sans-serif' }}>
                        <div className="main-content">
                            <br />
                            <h2 style={{ marginLeft: '25px' }}>Hi, Welcome Back <b>&nbsp;{organizerName}</b></h2>
                            <br />
                            <div className="header pb-4 pt-3 pt-md-2">
                                <div className="container-fluid">
                                    <br />
                                    <div className="header-body">
                                        <div className="row">
                                            <div className="col-xl-4 col-lg-6" style={{ margin: 'auto' }}>
                                                <div className="card card-stats mb-4 mb-xl-0 bg-primary">
                                                    <div className="card-body">
                                                        <div className="row">
                                                            <div className="col">
                                                                <h5 className="card-title text-uppercase text-muted mb-0">Events</h5>
                                                                <span className="h2 font-weight-bold mb-0">{organizerEvents.length}</span>
                                                            </div>
                                                            <div className="col-auto">
                                                                <div className="icon icon-shape shadow">
                                                                    <FaCalendar style={{ fontSize: '2rem' }} />
                                                                </div>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-xl-4 col-lg-6" style={{ margin: 'auto' }}>
                                                <div className="card card-stats mb-4 mb-xl-0 bg-primary">
                                                    <div className="card-body">
                                                        <div className="row">
                                                            <div className="col">
                                                                <h5 className="card-title text-uppercase text-muted mb-0">Participants</h5>
                                                                <span className="h2 font-weight-bold mb-0">{participants.length}</span>
                                                            </div>
                                                            <div className="col-auto">
                                                                <div className="icon icon-shape">
                                                                    <FaUsers style={{ fontSize: '2.4rem' }} />
                                                                </div>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-xl-3 col-lg-6" style={{ margin: 'auto' }}>
                                                <div className="card card-stats mb-4 mb-xl-0 bg-primary">
                                                    <div className="card-body">
                                                        <div className="row">
                                                            <div className="col">
                                                                <h5 className="card-title text-uppercase text-muted mb-0">Total Income</h5>

                                                                <span className="h2 font-weight-bold mb-0">
                                                                    {calculateTotalPayment().replace(/\.?0+$/, '')} Dt</span>
                                                            </div>
                                                            <div className="col-auto">
                                                                <div className="icon icon-shape">
                                                                    <FaDollarSign style={{ fontSize: '2.4rem' }} />
                                                                </div>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                                <br />
                              

                                <div className='graphs'>
                                    <div className="chart-container">
                                        {/*<Line data={chartData} options={chartOptions} />*/}
                                        <Bar data={chartData} options={chartOptions} />
                                    </div>
                                    <div className="chart-container2">
                                        <Pie data={eventIncomeData} options={pieChartOptions} />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

            </div>

        </div>

    );
};

export default OrganizerInfo;