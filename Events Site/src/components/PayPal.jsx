import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, useParams, BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import useMediaQuery from "@mui/material/useMediaQuery";

export default function Paypal({ userData }) { // Receive user data as props
  const paypal = useRef();
  const [eventPrice, setEventPrice] = useState(0);
  const [eventName, setEventName] = useState(0);
  const { id } = useParams();
  const [checkout, setCheckOut] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const isNonMobile = useMediaQuery("(min-width:600px)");


  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const { data } = await axios.get(`http://127.0.0.1:8000/eventdetails/${id}`);
        setEventPrice(data.Price);
        setEventName(data.EventName); // Assuming the price is stored in the 'price' field of the event details
      } catch (error) {
        console.error("Error fetching event details:", error);
      }
    };

    fetchEventDetails();
  }, []);


  useEffect(() => {
    if (eventPrice > 0) {
      window.paypal
        .Buttons({
          createOrder: (data, actions, err) => {
            return actions.order.create({
              intent: "CAPTURE",
              purchase_units: [
                {
                  description: "Reservation For Event : " + eventName + " - Payment",
                  amount: {
                    currency_code: "USD",
                    value: eventPrice,
                  },
                },
              ],
            });
          },
          onApprove: async (data, actions, event) => {
            const order = await actions.order.capture();
            console.log(order);
            try {
              const formData = {
                ...userData, // Use user data received as props
                EventParticipation: id,
              };
              console.log(formData);
              const res = await axios.post('http://127.0.0.1:8000/user', formData);
              console.log('API Response:', res);
              if (res.status !== 200) {
                console.log('Error');
              }
              setTimeout(() => {
                alert('Payment Successfull!');
                alert('Event Reservation Successfull!');
              }, 1500); // 1.5 second

              setTimeout(() => {
                navigate('/success');
              }, 8500);
            } catch (error) {
              setError(true);
            }
          },

          onError: (err) => {
            console.log(err);
          },
        })
        .render(paypal.current);
    }
  }, [eventPrice]);

  return (
    <div>
      <div ref={paypal}></div>
    </div>
  );
}