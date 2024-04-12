//Events List

import React, { useState, useRef, useEffect } from "react";
import Proptypes from "prop-types";
import '../style/events.css';
import logo from "../images/paradise.jpg";
import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";


GetEvents.propTypes = {
    eventList: Proptypes.array,
};

GetEvents.defaultProps = {
    eventList: [],
}

function GetEvents(props) {

    const navRef = useRef();
    const { eventList } = props;
    const [minPrice, setMinPrice] = useState(""); // State variable for minimum price
    const [maxPrice, setMaxPrice] = useState(""); // State variable for maximum price
    const [selectedOrganizer, setSelectedOrganizer] = useState(""); // State variable for selected organizer
    const [eventName, setEventName] = useState(""); // State variable for event name search query
    const [startDate, setStartDate] = useState(""); // State variable for start date
    const [error, setError] = useState(false);

    // Extract unique organizer names
    const organizers = [...new Set(eventList.map(event => event.EventOrganizer.OrganizerName))];

    // Filter events based on price range, selected organizer, event name search, and start date
    const filteredEvents = eventList.filter(event => {
        const eventPrice = parseInt(event.Price);
        const min = minPrice === "" ? 0 : parseInt(minPrice);
        const max = maxPrice === "" ? 500 : parseInt(maxPrice);
    
        const validPriceRange = maxPrice === "" || min <= max;
    
        const priceCondition = eventPrice >= min && eventPrice <= max;
        const organizerCondition = selectedOrganizer === "" || event.EventOrganizer.OrganizerName === selectedOrganizer;
        const eventNameCondition = eventName === "" || event.EventName.toLowerCase().includes(eventName.toLowerCase());
        const startDateCondition = startDate === "" || event.DateStart === startDate;
    
        return validPriceRange && priceCondition && organizerCondition && eventNameCondition && startDateCondition;
    });
    

    return (
        <div>
            <section style={{ textAlign: 'center' }}>
                <center>
                    <br />
                    <h1 style={{marginTop: '14px' }}>Events</h1>
                    <hr style={{ width: '12%', marginTop: '-33px'}} />
                    <br />
                    {/* Organizer filter select list */}
                    <div className='filters'>
                    {error && <p style={{ color: 'red', fontFamily: '"Rowdies", sans-serif' }}>{error}</p>}
                        <select
                            id="organizerSelect"
                            placeholder="Serach By Organizers"
                            value={selectedOrganizer}
                            onChange={(e) => setSelectedOrganizer(e.target.value)}
                        >
                            <option value="">Serach By Organizers 🔍 </option>
                            {organizers.map((organizer, index) => (
                                <option key={index} value={organizer}>{organizer}</option>
                            ))}
                        </select>

                        {/* Event name search input field */}
                        <label htmlFor="eventName">Search By Event Name:</label>

                        <input
                            type="search"
                            id="eventName" placeholder="Search by Event Name"
                            value={eventName}
                            onChange={(e) => setEventName(e.target.value)}
                        /><FaSearch className="searchIcon" />

                        {/* Price filter input fields */}
                        <label htmlFor="minPrice">Filter By Prices:</label>
                        <input
                            type="number"
                            id="minPrice"
                            placeholder="Min Price"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                        />

                        <input
                            style={{ marginLeft: '10px' }}
                            type="number"
                            placeholder="Max Price"
                            id="maxPrice"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                        />


                        {/* Start date filter input field */}

                        <label htmlFor="startDate">Search By Date:</label>
                        <input
                            type="date"
                            placeholder="Serach by Start Date"
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <hr style={{ width: '38%', marginBottom: '35px' }} />
                    {filteredEvents.map(post => (

                        <div className="card-container" key={post.EventID} title={`Event Description: ${post.EventDescription}`}>
                            <div className="image-container">
                                <div key={post.EventID} className="card-title">

                                    <img src={post.EventPhoto} alt='eventImg' />

                                    <h3> {post.EventName}</h3>
                                </div>
                                <div className="card-content">
                                    <div className="card-body">
                                        <hr style={{ marginBottom: '15px' }} />
                                        <span className="desc">{post.EventDescription}</span>
                                        <p>
                                            <span className="dateTxtS">Day start:</span> <span>{post.DateStart}</span> <br />

                                            <span className="dateTxtE">Day end:</span> <span> {post.DateEnd}</span> <br />

                                            <span className="txtinfo">Organized by:</span> <a href={`mailto:${post.EventOrganizer.OrganizerEmail}`}
                                                title="Contact Event Organizer" className="txtinfoLink">
                                                {post.EventOrganizer.OrganizerName}</a><br />

                                            <span className="txtinfo">Number Of Tickets:</span> <span> {post.MaxPar} </span><br />
                                            <span className="txtinfo">Location:</span> <span>{post.Location} </span><br />

                                            <span className="txtinfo">Price:</span> <span>{post.Price} Dt</span></p>




                                    </div>

                                </div>
                                <div className="btn">
                                    {/* Pass the event ID in the state instead of the URL */}
                                    <Link to={{
                                        pathname: `/form/${post.EventID}`,
                                        state: { eventId: post.EventID }
                                    }}>
                                        <button>
                                            Join !
                                        </button>
                                    </Link>

                                </div>
                            </div>

                        </div>

                    ))}
                </center>

            </section>
            <footer>

                <div className="row primary">
                    <div className="column about">


                        <img src={logo} alt="logo" />

                        <p>
                            Official Site For Paradise Events. All the events are Here.
                        </p>

                    </div>

                    <div className="column links">
                        <h3>Discover</h3>

                        <ul ref={navRef}>

                            <li>
                                <a href="/"> <Link to="/">Home</Link></a>
                            </li>
                            <li>
                                <a href="/events"> <Link to="/events">Events</Link></a>
                            </li>
                            <li>
                                <a href="https://discord.gg/MZf6D274FE">Our Server</a>
                            </li>
                            <li>

                                <a href='Admin@Events.com'
                                    title="Contact Admin">Support</a>

                            </li>
                        </ul>

                    </div>


                    <div className="column links">
                        <h3>Links</h3>
                        <ul ref={navRef}>
                            <li >
                                <a href="/events"> <Link to="/events">Events</Link></a>
                            </li>
                            <li>
                                <a href="/"> <Link to="/">Home</Link></a>
                            </li>

                            <li>
                                <a href="https://discord.gg/MZf6D274FE">Our Server</a>
                            </li>
                        </ul>
                    </div>

                    <div className="column subscribe">
                        <h3>Newsletter</h3>
                        <div>
                            <input type="email" placeholder="Your email here" />
                            <button>Subscribe</button>
                        </div>

                    </div>

                </div>

                <div className="row copyright">
                    <div className="footer-menu">

                    </div>

                    <p>Copyright &copy; 2024 Paradise Events</p>

                </div>
            </footer >
        </div >
    );
}
export default GetEvents;