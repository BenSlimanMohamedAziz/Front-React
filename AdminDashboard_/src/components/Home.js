// src/components/Home.js

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.css';
import { FaSignOutAlt, FaUser, FaCog, FaBell, FaUsers, FaCalendar, FaHome, FaDollarSign, FaPlus } from 'react-icons/fa';
import { Line, Bar, Pie } from 'react-chartjs-2'; // Importing Line from Chart.js
import { CategoryScale } from 'chart.js';
import Chart from 'chart.js/auto';


const Home = () => {
    const location = useLocation();
    const { state } = location;
    const navigate = useNavigate();
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const [participants, setParticipants] = useState([]);
    const [ListOrganizers, setListOrganizers] = useState([]);
    const [Events, setEvents] = useState([]);
    //const [setChartData] = useState({});
    const [adminInfo, setadminInfo] = useState({
        AdminFirstName: '',
        AdminLastName: '',
        AdminEmail: '',
        AdminPhone: '',
        AdminPassword: '',
        AdminPhoto: '',
    });

    useEffect(() => {
        if (!state) {
            const disableBack = () => {
                window.history.forward();
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

    const { adminID, adminFirstName, adminLastName, adminEmail, adminPhone, adminPhoto } = state;
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

    useEffect(() => {
        // Fetch events when the component mounts or organizerID changes
        if (adminID) {
            axios.get(`http://127.0.0.1:8000/event`)
                .then(response => {
                    setEvents(response.data);
                })
                .catch(error => console.error('Error fetching events:', error));
        }
    }, [adminID]); // Add adminid as a dependency*/


    useEffect(() => {
        // Replace the placeholder URL with your actual API endpoint
        if (adminID) {
            axios.get(`http://127.0.0.1:8000/organizer`)
                .then(response => {
                    setListOrganizers(response.data);
                    console.log(ListOrganizers.length)
                })
                .catch(error => console.error('Error fetching Organizers:', error));
        }
    }, [adminID]);

    useEffect(() => {
        // Replace the placeholder URL with your actual API endpoint
        fetch(`http://127.0.0.1:8000/user`)
            .then(response => response.json())
            .then(data => setParticipants(data))
            .catch(error => console.error('Error fetching participants:', error));
    }, [adminID]);

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
        Events.forEach(event => {
            participantsPerEvent[event.EventID] = 0;
        });

        // Iterate over participants and accumulate count for each event
        participants.forEach(participant => {
            if (participant.EventParticipation && participant.EventParticipation.EventID) {
                // Accumulate count for the corresponding event
                participantsPerEvent[participant.EventParticipation.EventID]++;
            }
        });

        /*  Events.forEach(event => {
              // Access the organizer's name from the event data
              const organizerName = event.EventOrganizer ? event.EventOrganizer.OrganizerName : 'Unknown Organizer';
  
              // Now you can use the organizer's name to display it in your graphs or UI elements
              console.log(`Event Name: ${event.EventName}, Organizer: ${organizerName}`);
          });*/

        // Convert event IDs to event names
        const result = {};
        Events.forEach(event => {
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
            data: Object.values(calculateParticipantsPerEvent()),
            // Number of participants per event
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
                text: 'Number of Participants in Events',
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

        Events.forEach(event => {
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
                        <h1 onClick={handlehomeclick} style={{ cursor: 'pointer' }}>Paradise Events</h1>
                        <br />   <br /> <br />
                        <Link to="/Home" onClick={handlehomeclick}><FaHome style={{ marginTop: '-5px', marginRight: '5px' }} /> Home</Link>
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


                    <div className="content" style={{ fontFamily: '"Rowdies", sans-serif' }}>
                        <div className="main-content">
                            <br />
                            <h2 style={{ marginLeft: '25px' }}>Hi, Welcome Back <b>&nbsp;{adminFirstName} </b></h2>
                            <br />
                            <div className="header pb-4 pt-4 pt-md-2">

                                <div className="header bg-gradient-primary pb-0 pt-0 pt-md-0">
                                    <div className="container-fluid">
                                        <br />
                                        <div className="header-body">
                                            <div className="row">
                                                <div className="col-xl-3 col-lg-6" style={{ margin: 'auto' }}>
                                                    <div className="card card-stats mb-4 mb-xl-0 bg-primary">
                                                        <div className="card-body">
                                                            <div className="row">
                                                                <div className="col">
                                                                    <h5 className="card-title text-uppercase text-muted mb-0">Events</h5>
                                                                    <span className="h2 font-weight-bold mb-0">{Events.length}</span>
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

                                                <div className="col-xl-3 col-lg-6" style={{ margin: 'auto' }}>
                                                    <div className="card card-stats mb-4 mb-xl-0 bg-primary">
                                                        <div className="card-body">
                                                            <div className="row">
                                                                <div className="col">
                                                                    <h5 className="card-title text-uppercase text-muted mb-0">Organizers</h5>
                                                                    <span className="h2 font-weight-bold mb-0">{ListOrganizers.length}</span>
                                                                </div>
                                                                <div className="col-auto">
                                                                    <div className="icon icon-shape shadow">
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
                                                                    <h5 className="card-title text-uppercase text-muted mb-0">Participants </h5>
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
                                </div>
                                <br />
                                {/* <h3>Graph of best events :</h3>
                                <br />*/}

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

export default Home;