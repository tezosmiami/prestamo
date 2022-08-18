import React, { useState, useEffect } from 'react'
import { useTezosContext } from "./context/tezos-context";
import { Routes, Route, Link } from "react-router-dom";
import { Home } from './pages/Home'
import { Gallery } from './pages/Gallery'
import { Objkt } from './pages/Objkt'
import { LightButton } from './components/light-button';
import "./styles/styles.css";

// const fonts = ['Halo', 'Advantage', 'Faster One', 'Monofett', 'Sonsie One', 'Libre Barcode 39 Text','Monoton']

function App() {
  const  app = useTezosContext();
  const axios = require('axios');
  const [banned, setBanned] = useState();
  

  // useEffect(() => {
  //   var r = document.querySelector(':root')
  //   r.style.setProperty('--font', fonts[Math.floor(Math.random()* fonts.length)])
  // }, [])

  useEffect(() => {
    const getBanned = async () => {
    const result = await axios.get('https://raw.githubusercontent.com/teia-community/teia-report/main/restricted.json') ;
    setBanned(result.data)
  }
    getBanned();
  }, [axios])
  return(
    <>
    <header>
    {app.address && <Link to={`/${app.name || app.address}`}>
      {/* {app.address && <a href={`https://hicetnunc.miami/tz/${app.address}`}
      target="blank" rel="noopener noreferrer"> 
       */}
        {(app.name.length > 0 && app.name + ' / ') || (app.address.substr(0, 4) + "..." + app.address.substr(-4)+' / ')}
      {/* </a>} */}
      </Link>}
    
  
      <button onClick={() => !app.activeAccount ? app.logIn() : app.logOut()}> 
        {!app.activeAccount ? "sync" : "unsync"}
      </button>

    </header>     
    <Link className='purple' to="/">prestamo</Link>

    <LightButton />

     <div>
     <Routes>
        <Route path="/" element={<Home banned={banned} />} />
        <Route path='/:account' element={<Gallery banned={banned}/>} />
        <Route path=":contract" >
          <Route path=":id" element={<Objkt banned={banned}/>} />
       </Route>
      </Routes>
    </div>
    <LightButton />
       <a href={`https://www.teztok.com`} target="blank"
         rel="noopener noreferrer"> indexed by teztok</a>
       <p>experimental dApp - enjoy at your own risk. . .</p>
    </>
    )
}

export default App;
