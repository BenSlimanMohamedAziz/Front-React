//Reservation Form

import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Col, DatePicker, Drawer, Form, Input, Row, Select, Space, Button } from 'antd';
import { Box } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import "../style/forms.css";
import logo from "../images/paradise.jpg";
import axios from "axios";
import useMediaQuery from "@mui/material/useMediaQuery";
import Paypal from "./PayPal";


const FormUser = () => {

  const [checkout, setCheckOut] = useState(false);
  const navRef = useRef();
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');


  const handleValidInput = (phone) => {
    return /^(?:\+?[0-9]{3}\s?[0-9]{2}\s?[0-9]{3}\s?[0-9]{3}|[0-9]{2}\s?[0-9]{3}\s?[0-9]{3})$/.test(phone);
  };

  const handleInputChange = () => {
    setErrorMessage('');// Reset error message when input changes
  };

  // State variables to hold user information
  const [userData, setUserData] = useState({
    FirstName: "",
    LastName: "",
    UserEmail: "",
    User_Number: ""
  });

  // Function to edit the event prop
  const onFinish = async (event) => {



    // Make a GET request to fetch the event details including MaxPar
    const eventDetails = await axios.get(`http://127.0.0.1:8000/eventdetails/${id}`);
    const maxPar = eventDetails.data.MaxPar;

    const phoneNumber = event.User_Number; // Get the value of the phone number field

    if (!handleValidInput(phoneNumber)) { // Pass the phone number value to handleValidInput
      setErrorMessage('Phone number is invalid. Please enter a valid phone number.');
      setCheckOut(false);
      return;
    }
    else if (maxPar <= 0) {
      setCheckOut(false);
      alert('Unfortunately, there are no more tickets available for this event :c , ComeBack Soon!');
      setTimeout(() => {
        navigate('/events');
      }, 1000);
    }
    else {
      setErrorMessage('');
      setCheckOut(true);
      alert('Now you need to pay using Paypal');
      setUserData(event);
    }

    // Check if MaxPar is greater than 0

  };


  const handleClose = () => {
    setError(false);
  };

  const CancelForm = () => {
    navigate('/events');
  };

  const initialValues = {
    FirstName: "",
    LastName: "",
    UserEmail: "",
  };

  return (
    <Box m="20px" height="100%" >
      <br />   <br /> <br />
      <Box sx={{ margin: "auto", width: "55%" }}>
        <Form layout="vertical" hideRequiredMark onFinish={onFinish} className="forms" >
          <h2>Participation Form :</h2>
          <Row gutter={20}>
            <Col span={24}>

              <Form.Item
                name="FirstName"
                rules={[
                  {
                    required: true,
                    message: 'Please enter your FirstName',
                  },
                ]}
              >
                <Input type='text' id="FirstName" name="FirstName" placeholder='Please enter your First Name' required />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={20}>
            <Col span={24}>

              <Form.Item
                name="LastName"
                rules={[
                  {
                    required: true,
                    message: 'Please enter your LastName',
                  },
                ]}
              >
                <Input type='text' id="LastName" name="LastName" placeholder='Please enter your Last Name' required />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={20}>
            <Col span={24}>

              <Form.Item
                name="UserEmail"
                rules={[
                  {
                    required: true,
                    message: 'Please enter your E-mail',
                  },
                ]}
              >
                <Input type='email' id='email' name="UserEmail" placeholder="Enter Your E-mail" required />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={20}>
            <Col span={24}>

              <Form.Item
                name="User_Number"
                rules={[
                  {
                    required: true,
                    message: 'Please enter your Phone number',
                  },
                ]}
              >
                <Input type='tel' name="User_Number" id="phone" placeholder="Enter Phone Number : 21 345 678 or +216 21 345 678" required onChange={handleInputChange} />


              </Form.Item>
              {errorMessage && <p style={{ color: 'red', fontFamily: '"Rowdies", sans-serif' }}>{errorMessage}</p>}
            </Col>
          </Row>
          <Box display="flex" justifyContent="center">
            <Box width="180px" padding="15px" >
              <Button block type="primary" htmlType="submit" style={{ marginBottom: '1px' }} >
                Join now !!
              </Button>

              <br />      <br />

              {checkout ? (
                <Paypal userData={userData} />
              ) : (
                <span></span>
              )}

              <Button block type="secondary" htmlType="cancel" style={{ backgroundColor: 'gray' }} onClick={CancelForm}>
                Cancel
              </Button>

            </Box>
          </Box>
        </Form>
        <Dialog
          open={error}
          keepMounted
          onClose={handleClose}
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle>{"No Service !"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              Sorry There is Technical probleme please comeback later !
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Close</Button>
            <Button onClick={handleClose}>OK</Button>
          </DialogActions>
        </Dialog>
      </Box>
      <br />
      <br />  <br />  <br /> <br />

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
      </footer>

    </Box>

  );
};

export default FormUser;
