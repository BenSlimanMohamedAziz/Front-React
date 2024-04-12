//Home

import React, { useRef } from "react";
import "../style/home.css";
import { Link } from "react-router-dom";
import img from "../images/img.jpg";
import vid from "../images/production_id_4043975 (1080p).mp4";
import logo from "../images/paradise.jpg";
import Proptypes from "prop-types";

Home.propTypes = {
  eventLateList: Proptypes.array,
};

Home.defaultProps = {
  eventLateList: [],
}


function Home(props) {
  const navRef = useRef();
  const { eventLateList } = props;

  return (
    <main className="main">
      <section className="section">
        <div className="left">
          <p>Welcome</p>
          <h4>
            Discover The Different Events <br /> In Our Site.
          </h4>
          <a ref={navRef}>
            <Link to="/events" className="btnH">
              Events
            </Link>
          </a>
        </div>
        <div className="right">
          {/* Add video element with your video file source */}
          <video autoPlay loop muted className="video-background">
            <source src={vid} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Add image element */}
          <img src={img} alt="img event" />
          <div className="shadow"></div>
        </div>
      </section>

      <center>
        <div className="container1">
          <br />       <br />    <br />
          <br />
          <br />
          <h1>Latest Events :</h1> <br /><br />
          {eventLateList.map(post => (

            <div className="card-container" title="Click to view event details">
              <div className="image-container">
                <div key={post.EventID} className="card-title">

                  <img src={post.EventPhoto} alt='eventImg' />

                  <h3> {post.EventName}</h3>
                </div>
                <div className="card-content">
                  <div className="card-body">
                    <hr style={{ marginBottom: '15px' }} />
                    {/* <span className="desc">{post.EventDescription}</span>*/}
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
                  <Link to={`/form/${post.EventID}`}>
                    <button>
                      Join !
                    </button>
                  </Link>
                </div>
              </div>

            </div>

          ))}

          <br />
        </div>
      </center>


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
                <a> <Link to="/Home">Home</Link></a>
              </li>
              <li>
                <a> <Link to="/events">Events</Link></a>
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
                <a> <Link to="/events">Events</Link></a>
              </li>
              <li>
                <a> <Link to="/">Home</Link></a>
              </li>

              <li>
                <a href="https://discord.gg/MZf6D274FE">Our Server</a>
              </li>
            </ul>
          </div>

          <div className="column subscribe">
            <h3>Newsletter</h3>
            <div>
              <input type="email" placeholder="Your email id here" />
              <button>Subscribe</button>
            </div>

          </div>

        </div>

        <div className="row copyright">
          <div className="footer-menu">

          </div>

          <p>Copyright &copy; 2024 Paradise Events</p>

        </div>
      </footer>
    </main>
  );
}

export default Home;
