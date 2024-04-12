import React, { useEffect, useState } from 'react';
import './style/App.css';
import GetEvents from './components/GetEvents';
import Navbar from './components/Navbar';
import Form from './components/Form';
import Home from './components/Home';
import About from './components/About';
import Success from './components/Success';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  const [eventList, setEventList] = useState([]);
  const [eventLateList, setEventLateList] = useState([]);
  const [AdInfo, setAdInfo] = useState([]);

  useEffect(()=>{
async function fetchEventList(){
  try{
    const requestUrl='http://127.0.0.1:8000/event';
    const reponse = await fetch(requestUrl);
    const reponseJSON=await reponse.json();
    //console.log(reponseJSON);
    setEventList(reponseJSON)
  }catch{

  }
  
}
async function fetchEventLateList(){
  try{
    const requestUrl2='http://127.0.0.1:8000/event/recent';
    const reponse = await fetch(requestUrl2);
    const reponseJSON=await reponse.json();
    //console.log(reponseJSON);
    setEventLateList(reponseJSON)
  }catch{

  }
  
}

async function fetchEventAdList(){
  try{
    const requestUrl2='http://127.0.0.1:8000/admins/detail/1';
    const reponse = await fetch(requestUrl2);
    const reponseJSON=await reponse.json();
    //console.log(reponseJSON);
    setAdInfo(reponseJSON)
  }catch{

  }
  
}

fetchEventList();
fetchEventLateList();
fetchEventAdList();
  },[])

  return (
    <div className="App">
 

      <Router>
        <Navbar></Navbar>
     
        <Routes>
        <Route path="/" element={<Home eventLateList={eventLateList}/>} />
            <Route path="/home" element={<Home eventLateList={eventLateList}/>} />
            <Route path="/events" element={ <GetEvents eventList={eventList}/>} />
            <Route path="/about" element={<About AdInfo={AdInfo}/>} />
            <Route path="/form/:id" element={<Form />} />
            <Route path="/success" element={<Success />} />
        </Routes>
    </Router>
   
      
    </div>
  );
}

export default App;
