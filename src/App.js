import React, { useState, useEffect } from 'react'
import { useTezosContext } from "./context/tezos-context";
import { Routes, Route, Link } from "react-router-dom";
import { Home } from './pages/Home'
import { Wallet } from './pages/Wallet'
import { Market } from './pages/Market'
// import { Objkt } from './pages/Objkt'
import { LightButton } from './components/light-button';
import "./styles/styles.css";

// const fonts = ['Halo', 'Advantage', 'Faster One', 'Monofett', 'Sonsie One', 'Libre Barcode 39 Text','Monoton']

function App() {
  const  app = useTezosContext();


  

  // useEffect(() => {
  //   var r = document.querySelector(':root')
  //   r.style.setProperty('--font', fonts[Math.floor(Math.random()* fonts.length)])
  // }, [])


  return(
    <>
    <header>
   
    <Link className='purple' to="/">prestamo</Link>
    <LightButton />
 
    <div style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
    {app.address && <Link to={`/${app.alias || app.address}`}>
    {(app.alias.length > 0 && app.alias + ' / ') || (app.address.substr(0, 4) + "..." + app.address.substr(-4)+' / ')}
      </Link>}
      <button onClick={() => !app.activeAccount ? app.logIn() : app.logOut()}> 
        {!app.activeAccount ? "sync" : "unsync"}
      </button>
      </div>
      
    </header>     
     <div style= {{borderBottom: '3px dashed', width: '88%', marginBottom: '18px'}} />


    

     <div>
     <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/:account' element={<Wallet />} />
        <Route path="/Make" element={<Market />} />
        <Route path=":contract" >
          {/* <Route path=":id" element={<Objkt/>} /> */}
       </Route>
      </Routes>
    </div>
       <a href={`https://www.tzkt.io`} target="blank"
         rel="noopener noreferrer"> indexed by tzkt</a>
       <p>experimental dApp - enjoy at your own risk. . .</p>
    </>
    )
}

export default App;
