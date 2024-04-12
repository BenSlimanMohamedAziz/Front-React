//Footer

import { React } from 'react';
import "../style/forms.css";
import { Footer } from 'antd/es/layout/layout';

function Footer(props) {
    return (
        <div>
            <br />
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
                                <a> <Link to="/">Home</Link></a>
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
            </footer >
        </div >
    );
};
export default Footer;