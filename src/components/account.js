import React, { useEffect, useState } from 'react'
import ReactPlayer from 'react-player'
import Masonry from 'react-masonry-css'
import { ReactComponent as Logo } from '../presta.svg'
import { Objkt } from './objkt'
import { getMetadata } from '../utils/metadata'
import { useTezosContext } from "../context/tezos-context";

const axios = require('axios')
const breakpointColumns = {
  default: 7,
  1580: 7,
  1280: 6,
  980: 5,
  730: 4,
  680: 3,
};


export const getAmountwithInterest = (amount,interest) => {
  interest = ((parseFloat(interest)/1000) * parseFloat(amount))
  let total= interest + parseFloat(amount)
  return total
}
export const checkTimesUp = (start_time, term) => {

  //minutes for dev check again
  let st = new Date(start_time)
  let end_time=st.getTime() + parseFloat(term) *60000
  let now = Date.now()
  return(end_time < now)
}

export const Account = () => {
  const app = useTezosContext();
  const [objktView, setObjktView] = useState(false)
  const [objkt, setObjkt] = useState({})
  const [borrowed, setBorrowed] = useState()
  const [requests, setRequests] = useState()
  const [loanedOut, setLoanedOut] = useState()
  const [degree, setDegree] = useState(0)
  const [loaded, setLoaded] =useState(false)

  useEffect(() => {
    const markets =[]
    const getMarket = async () => {
     let interval= setInterval(() => {
        setDegree((degree) => degree+=3)
      }, 80);
    const result = await axios.get('https://api.jakartanet.tzkt.io/v1/bigmaps/107783/keys')
    const filtered = result.data.filter((f)=>((f.value.maker || f.value.taker) === app.address) && f.value.active)

    for (let i=0; i < filtered.length; i++){
      filtered[i].value.market_id = filtered[i].key
      markets.push(filtered[i].value)
      for(let token of markets[i].tokens){
      const metadata = await getMetadata(token.contract_address, token.token_id)
      token.metadata = metadata
    } 
  }
    if (app.address) {
    setRequests(markets.filter(e => (e.maker===app.address && !e.taker)).reverse())
    setBorrowed(markets.filter(e => (e.maker===app.address && e.taker)).reverse())
    setLoanedOut(markets.filter(e => (e.taker===app.address)).reverse())
    setLoaded(true)
    }
    
    clearInterval(interval)
  }
    getMarket();
  }, [app])

  const showObjkt = (o) => {
    if (objktView) return (setObjktView(false))
    setObjkt(o)
    setObjktView(true)
  }

  if (!loaded) return (
    <>
      <Logo  className='loader' style={{width: '33px', height: '33px', transform:`rotate(${degree}deg)`}}/>
      <div style= {{borderBottom: '3px dashed', width: '88%', marginBottom: '1px', marginTop: '27px'}} />
      <div style= {{borderBottom: '3px dashed', width: '88%', marginBottom: '18px'}} />
    </>
  )

  return (
      <>
      
       <div style={{marginTop:'11px'}}>
        Account Prestamos
       </div>
       <div style= {{borderBottom: '3px dashed', width: '88%', marginBottom: '1px', marginTop: '27px'}} />
          <div style= {{borderBottom: '3px dashed', width: '88%', marginBottom: '18px'}} />
          {objktView &&<Objkt objkt={objkt} setObjktView={setObjktView}/>}
          {loaded && requests && loanedOut && borrowed && requests.length < 1 &&  borrowed.length < 1 && loanedOut.length < 1
           && <div>No Prestamos</div>}
       <div className='container' style={{opacity: objktView && '.2'}}>
       {requests?.length > 0 && <p>Active Requests</p>}
       {requests?.length > 0 && requests.map((p,i)=> (
       (!checkTimesUp() || app.address===(p.taker)) &&
       <div key={i} className='market'>
        
       <Masonry
        breakpointCols={breakpointColumns}
        className= 'grid'
        columnClassName='column'>

        {p.tokens.map((q,i) => (
        <div key={i} onClick= {() => {window.scrollTo({top: 180, behavior: 'smooth'}); showObjkt(q)}}>
        {q.metadata.formats[0].mimeType?.includes('image') && q.metadata.formats[0].mimeType !== 'image/svg+xml' ?
      
        <img alt='' className= 'pop'  src={`https://ipfs.io/ipfs/${q.metadata.displayUri ? q.metadata.displayUri?.slice(7) : q.metadata.artifactUri?.slice(7)}`}/> 
        : q.metadata.formats[0].mimeType.includes('video') ? 
         <div className='pop'>
           <ReactPlayer url={'https://ipfs.io/ipfs/' + q.metadata.artifactUri?.slice(7)} width='100%' height='100%' muted={true} playing={false} loop={false}/>
          </div>
          : q.metadata.formats[0].mimeType.includes('audio') ?  
          <div className= 'pop'>
            <img className= 'pop' alt='' src={'https://ipfs.io/ipfs/' + q.metadata.displayUri.slice(7)} />
            <audio style={{width:'93%'}} src={'https://ipfs.io/ipfs/' + q.metadata.artifactUri.slice(7)} controls />
          </div>
        : q.metadata.formats[0].mimeType.includes('text') ? <div className='text'>{q.metadata.description}</div> : ''}

        </div>
       ))}
          </Masonry>

          
        <div className='marketInfo' style={{alignItems:'flex-start'}}>
        <ul>
        <li style={{margin: '15px'}}>Maker: {p.maker &&p.maker.substr(0, 4) + "..." + p.maker.substr(-4)}</li>
         <li style={{margin: '15px'}}>Amount: {p.amount/1000000}ꜩ</li>
          <li style={{margin: '15px'}}>Interest: {p.interest/10}%</li>
          <li style={{margin: '15px'}}>Term: {p.term} Minutes</li> 
          {p.taker && <li >Taker: {p.taker.substr(0, 4) + "..." + p.taker.substr(-4)}</li>}
          </ul>
          <div style={{flexDirection: 'row', width:'auto', alignItems: 'flex-start'}}>
          {p.active && !p.taker && p.maker !== app.address && <button className='formButton' onClick = {() => {app.take_market(p.market_id, p.amount)}}>accept</button>}
          {p.active && !p.taker && app.address === p.maker && <button className='formButton' onClick = {() => {app.cancel_market(p.market_id)}}>cancel</button>}
          {p.active && p.taker && app.address === p.maker
           && !checkTimesUp(p.start_time, p.term)
           &&<button className='formButton' onClick = {() => {app.recover_market(p.market_id, getAmountwithInterest(p.amount,p.interest))}}> recover</button>}
          {p.active && app.address === p.taker && p.taker && checkTimesUp(p.start_time, p.term) && <button className='formButton'onClick = {() => {app.claim_market(p.market_id)}} >claim</button>}
          </div>
            </div>
          </div>
          
          ))}
   
      </div>
      <div className='container' style={{opacity: objktView && '.2'}}>
       {borrowed?.length > 0  &&  <p>Active Loans Received</p>}
       {borrowed?.length > 0  && borrowed.map((p,i)=> (
       (!checkTimesUp() || app.address===(p.taker)) &&
       <div key={i} className='market'>
        
       <Masonry
        breakpointCols={breakpointColumns}
        className= 'grid'
        columnClassName='column'>

        {p.tokens.map((q,i) => (
        <div key={i} onClick= {() => {showObjkt(q)}}>
        {q.metadata.formats[0].mimeType?.includes('image') && q.metadata.formats[0].mimeType !== 'image/svg+xml' ?
      
        <img alt='' className= 'pop'  src={`https://ipfs.io/ipfs/${q.metadata.displayUri ? q.metadata.displayUri?.slice(7) : q.metadata.artifactUri?.slice(7)}`}/> 
        : q.metadata.formats[0].mimeType.includes('video') ? 
         <div className='pop'>
           <ReactPlayer url={'https://ipfs.io/ipfs/' + q.metadata.artifactUri?.slice(7)} width='100%' height='100%' muted={true} playing={false} loop={false}/>
          </div>
          : q.metadata.formats[0].mimeType.includes('audio') ?  
          <div className= 'pop'>
            <img className= 'pop' alt='' src={'https://ipfs.io/ipfs/' + q.metadata.displayUri.slice(7)} />
            <audio style={{width:'93%'}} src={'https://ipfs.io/ipfs/' + q.metadata.artifactUri.slice(7)} controls />
          </div>
        : q.metadata.formats[0].mimeType.includes('text') ? <div className='text'>{q.metadata.description}</div> : ''}

        </div>
       ))}
          </Masonry>

          
        <div className='marketInfo' style={{alignItems:'flex-start'}}>
        <ul>
        <li style={{margin: '15px'}}>Maker: {p.maker &&p.maker.substr(0, 4) + "..." + p.maker.substr(-4)}</li>
         <li style={{margin: '15px'}}>Amount: {p.amount/1000000}ꜩ</li>
          <li style={{margin: '15px'}}>Interest: {p.interest/10}%</li>
          <li style={{margin: '15px'}}>Term: {p.term} Minutes</li> 
          {p.taker && <li >Taker: {p.taker.substr(0, 4) + "..." + p.taker.substr(-4)}</li>}
          </ul>
          <div style={{flexDirection: 'row', width:'auto', alignItems: 'flex-start'}}>
          {p.active && !p.taker && p.maker !== app.address && <button className='formButton' onClick = {() => {app.take_market(p.market_id, p.amount)}}>accept</button>}
          {p.active && !p.taker && app.address === p.maker && <button className='formButton' onClick = {() => {app.cancel_market(p.market_id)}}>cancel</button>}
          {p.active && p.taker && app.address === p.maker
           && !checkTimesUp(p.start_time, p.term)
           &&<button className='formButton' onClick = {() => {app.recover_market(p.market_id, getAmountwithInterest(p.amount,p.interest))}}> recover</button>}
          {p.active && app.address === p.taker && p.taker && checkTimesUp(p.start_time, p.term) && <button className='formButton'onClick = {() => {app.claim_market(p.market_id)}} >claim</button>}
          </div>
            </div>
          </div>
          
          ))}
   
      </div>
      <div className='container' style={{opacity: objktView && '.2'}}>
      {loanedOut?.length > 0  && <p>Active Loans</p>}
       {loanedOut?.length > 0  && loanedOut.map((p,i)=> (
        (!checkTimesUp() || app.address===(p.taker)) &&
       <div key={i} className='market'>
        
       <Masonry
        breakpointCols={breakpointColumns}
        className= 'grid'
        columnClassName='column'>

        {p.tokens.map((q,i) => (
        <div key={i} onClick= {() => {showObjkt(q)}}>
        {q.metadata.formats[0].mimeType?.includes('image') && q.metadata.formats[0].mimeType !== 'image/svg+xml' ?
      
        <img alt='' className= 'pop'  src={`https://ipfs.io/ipfs/${q.metadata.displayUri ? q.metadata.displayUri?.slice(7) : q.metadata.artifactUri?.slice(7)}`}/> 
        : q.metadata.formats[0].mimeType.includes('video') ? 
         <div className='pop'>
           <ReactPlayer url={'https://ipfs.io/ipfs/' + q.metadata.artifactUri?.slice(7)} width='100%' height='100%' muted={true} playing={false} loop={false}/>
          </div>
          : q.metadata.formats[0].mimeType.includes('audio') ?  
          <div className= 'pop'>
            <img className= 'pop' alt='' src={'https://ipfs.io/ipfs/' + q.metadata.displayUri.slice(7)} />
            <audio style={{width:'93%'}} src={'https://ipfs.io/ipfs/' + q.metadata.artifactUri.slice(7)} controls />
          </div>
        : q.metadata.formats[0].mimeType.includes('text') ? <div className='text'>{q.metadata.description}</div> : ''}

        </div>
       ))}
          </Masonry>

          
        <div className='marketInfo' style={{alignItems:'flex-start'}}>
          <ul>
             <li style={{margin: '15px'}}>Maker: {p.maker &&p.maker.substr(0, 4) + "..." + p.maker.substr(-4)}</li>
             <li style={{margin: '15px'}}>Amount: {p.amount/1000000}ꜩ</li>
             <li style={{margin: '15px'}}>Interest: {p.interest/10}%</li>
             <li style={{margin: '15px'}}>Term: {p.term} Minutes</li> 
          {p.taker && <li>Taker: {p.taker.substr(0, 4) + "..." + p.taker.substr(-4)}</li>}
          </ul>
          <div style={{flexDirection: 'row', width:'auto', alignItems: 'flex-start'}}>
          {p.active && !p.taker && p.maker !== app.address && <button className='formButton' onClick = {() => {app.take_market(p.market_id, p.amount)}}>accept</button>}
          {p.active && !p.taker && app.address === p.maker && <button className='formButton' onClick = {() => {app.cancel_market(p.market_id)}}>cancel</button>}
          {p.active && p.taker && app.address === p.maker
           && !checkTimesUp(p.start_time, p.term)
           &&<button className='formButton' onClick = {() => {app.recover_market(p.market_id, getAmountwithInterest(p.amount,p.interest))}}> recover</button>}
          {p.active && app.address === p.taker && p.taker && checkTimesUp(p.start_time, p.term) && <button className='formButton'onClick = {() => {app.claim_market(p.market_id)}} >claim</button>}
          </div>
            </div>
          </div>
          
          ))}
        
      </div>

      <div><p/></div>
     
  </>
    );
  }
  
