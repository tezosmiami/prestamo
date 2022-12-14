import React, { useEffect, useState } from 'react'
import ReactPlayer from 'react-player'
import Masonry from 'react-masonry-css'
import { Objkt } from './objkt'
import { ReactComponent as Logo } from '../presta.svg'
import { useTezosContext } from "../context/tezos-context";
import { getMetadata } from '../utils/metadata'
const axios = require('axios')
const breakpointColumns = {
  default: 7,
  1580: 7,
  1280: 6,
  980: 5,
  730: 4,
  680: 3,
};

export const getAmountwithInterest = (amount, interest) => {
  //  
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

export const Markets = () => {
  const app = useTezosContext();
  const [objktView, setObjktView] = useState(false)
  const [degree, setDegree] = useState(0)
  const [objkt, setObjkt] = useState({});
  const [bigmap, setBigmap] = useState()

//   /*
//   useEffect(() => {
//   const getMarket = async () => {
//     let result = await axios.get(
//       "https://api.jakartanet.tzkt.io/v1/bigmaps/98299/keys"
//     );
//     const parse_result = await Promise.all(
//       result.data.map(async (p) => {
//         const token = p.value.tokens.map(async (q) => {
//           const { data } = await getMetadata(q.contract_address, q.token_id);
//           return { ...q, metadata: data };
//         });
//         return Promise.all(token);
//       })
//     );
//     console.log(parse_result);
//     setBigmap(parse_result);
//   };
//   getMarket();
// }, []);
//   */
  useEffect(() => {
    const markets =[]
    const getMarket = async () => {
    const interval = setInterval(() => {
      setDegree((degree) => degree+=3)
    }, 80);
    const result = await axios.get('https://api.jakartanet.tzkt.io/v1/bigmaps/107783/keys')
    const filtered = result.data.filter((f)=>f.value.active)
    for (let i=0; i < filtered.length; i++){
      filtered[i].value.market_id = filtered[i].key
      markets.push(filtered[i].value)
      for(let token of markets[i].tokens){
      const metadata = await getMetadata(token.contract_address, token.token_id)
      token.metadata = metadata
    } 
  } 
    clearInterval(interval);
    setBigmap(markets.reverse())
  }
    getMarket();
  }, [])

 
  const showObjkt = (o) => {
    if (objktView) return (setObjktView(false))
    setObjkt(o)
    setObjktView(true)
  }

  // !bigmap && setInterval(() => {setLoader(!loader); setDegree(degree+33)}, 1000)

  if (!bigmap) return (
      <>
        <Logo  className='loader' style={{width: '33px', height: '33px', transform:`rotate(${degree}deg)`}}/>
        <div style= {{borderBottom: '3px dashed', width: '88%', marginBottom: '1px', marginTop: '27px'}} />
        <div style= {{borderBottom: '3px dashed', width: '88%', marginBottom: '18px'}} />
       </>
    )

  return (
      <>
       <div style={{marginTop:'11px'}}>
        Latest Markets
       </div>

       <div style= {{borderBottom: '3px dashed', width: '88%', marginBottom: '1px', marginTop: '27px'}} />
          <div style= {{borderBottom: '3px dashed', width: '88%', marginBottom: '18px'}} />
         {/* <p><button className='formButton'>create</button></p><p/> */}
          {objktView &&<Objkt objkt={objkt} setObjktView={setObjktView}/>}
      
       <div className='container' style={{opacity: objktView && '.2'}}>
      {/* {app.address && 
        <Link style={{marginRight:'27px'}} to={`/Make`}>
          <div className='formButton'>Make Market</div><p/>
       </Link>} */}
       {bigmap?.length > 0  && bigmap.map((p,i)=> (

        p.active && (!checkTimesUp() || app.address === (p.taker)) &&

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
            <li>Maker: {p.maker &&p.maker.substr(0, 4) + "..." + p.maker.substr(-4)}</li>
            <li>Amount: {p.amount/1000000}???</li>
            <li>Interest: {p.interest/10}%</li>
            <li>Term: {p.term} Minutes</li> 
            {p.taker && <li>Taker: {p.taker.substr(0, 4) + "..." + p.taker.substr(-4)}</li>}
          </ul>
          <div style={{margin: '12px', flexDirection: 'row', width:'auto', alignItems: 'flex-start'}}>
          {p.active && !p.taker && p.maker !== app.address && <button className='formButton' onClick = {() => {app.take_market(p.market_id, p.amount)}}>accept</button>}
          {p.active && !p.taker && app.address === p.maker && <button className='formButton' onClick = {() => {app.cancel_market(p.market_id)}}>cancel</button>}
          {p.active && p.taker && app.address === p.maker
           && !checkTimesUp(p.start_time, p.term)
           &&<button className='formButton' onClick = {() => {app.recover_market(p.market_id, parseFloat(getAmountwithInterest(p.amount, p.interest)))}}> recover</button>}
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
  
