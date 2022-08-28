import React from 'react'
import { useTezosContext } from "../context/tezos-context"
import { Link } from 'react-router-dom'

export const Menu = ({ open, setOpen}) => {
    const  app = useTezosContext();

    return (
    <>
    {open &&
      <div style={{flexDirection:'row',  transition: 'all 1s linear', justifyContent:'space-evenly'}}>
       
        <Link to={`/${app.alias || app.address}`}  onClick={() => setOpen(false)} >account</Link>
        <Link to='/Make' onClick={() => setOpen(false)} >make market</Link>
        <Link to={`/Faqs`}  onClick={() => {app.unsync(); setOpen(false)}}>faqs</Link>
        <Link to={`/`}  onClick={() => {app.unsync(); setOpen(false)}}>unsync</Link>
        </div>}
        
        <div style= {{borderBottom: '3px dashed', width: '88%', marginBottom: '1px',  marginTop: '27px'}} />
        
        <div style= {{borderBottom: '3px dashed', width: '88%', marginBottom: '18px'}} />
      


     </>
  )
}

