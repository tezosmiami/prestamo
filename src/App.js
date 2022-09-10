import React, { useState } from 'react'
import { useTezosContext } from "./context/tezos-context"
import { Routes, Route, Link } from 'react-router-dom'
import { Home } from './pages/Home'
import { Wallet } from './pages/Wallet'
import { Market } from './pages/Market'
import { Mint } from './pages/Mint'
import { About } from './pages/About'
import { Menu } from './components/menu'
import { ThemeButton } from './components/theme_button'
import presta from './presta.png'
import presta2 from './presta2.png'
import "./styles/styles.css"

function App() {
  const  app = useTezosContext();
  const [open, setOpen] = useState(false)
  const [darkMode, setDarkMode] = useState()

  return(
    <>
    <header>
    <Link className='purple' to="/">prestamo</Link>
    <ThemeButton darkMode={darkMode} setDarkMode={setDarkMode} />
 
    <div style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
    {app.address && <Link to={`/${app.alias || app.address}`}>
    {(app.alias.length > 0 && app.alias) || (app.address.substr(0, 4) + "..." + app.address.substr(-4))}
      </Link>}
      <button onClick={() => !app.activeAccount ? app.sync() : setOpen(!open)}> 
        {!app.activeAccount ? "sync" : <div className='menubar' style={{transform: open ? 'rotate(90deg' : ''}}/>}
      </button>
      </div>
      
    </header>     
     <div style= {{borderBottom: '3px dashed', width: '88%', marginTop: '1px', marginBottom: '18px'}} />
  
    {open &&<Menu app={app} open={open} setOpen={setOpen}/>}
  
     <div style={{minHeight: '50vh', opacity:open && '0.2'}}>
     <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/:account' element={<Wallet />} />
        <Route path="/Make" element={<Market />} />
        <Route path="/Mint" element={<Mint />} />
        <Route path="/About" element={<About />} />
        {/* <Route path=":contract" >
          <Route path=":id" element={<Objkt/>} />
       </Route> */}
      </Routes>
    </div>
    <div style={{opacity: open && '0.2'}}>
    <a href={`https://faucet.jakartanet.teztnets.xyz/`} target="blank"
         rel="noopener noreferrer"> ꜩ faucet </a><p/>

      {darkMode !== null && <img alt ='' style={{width:'55px', height:'55px'}} src={darkMode ? presta : presta2}/>}
      <p/>
       <a href={`https://www.tzkt.io`} target="blank"
         rel="noopener noreferrer"> Indexed by tzkt</a>
       <p>experimental dApp - enjoy at your own risk. . .</p>
       </div>
    </>
    )
}

export default App;
