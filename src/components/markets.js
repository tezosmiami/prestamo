import React, { useEffect, useState } from 'react'
import { Link } from "react-router-dom";
import ReactPlayer from 'react-player'
import Masonry from 'react-masonry-css'
import { Objkt } from './objkt'
import { useTezosContext } from "../context/tezos-context";
import { parse } from 'graphql';

const axios = require('axios')
const breakpointColumns = {
  default: 7,
  1580: 7,
  1280: 6,
  980: 5,
  730: 4,
  680: 3,
};

export const hex2a = (hex) => {
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}   
export const getAmountwithInterest = (amount,interest) => {
  interest = ((parseFloat(amount)/1000) * parseFloat(interest))
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
  const [objkt, setObjkt] = useState({});
  const [bigmap, setBigmap] = useState()
  const [tokens,setTokens] = useState([])
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
    let bytes=''
    const markets =[]
    const getMarket = async () => {
    const result = await axios.get('https://api.jakartanet.tzkt.io/v1/bigmaps/106622/keys')

    for (let i=0; i < result.data.length; i++){
      result.data[i].value.market_id = result.data[i].key
      markets.push(result.data[i].value)
      for(let token of result.data[i].value.tokens){
      const metadata = await getMetadata(token.contract_address, token.token_id)
      token.metadata = metadata
    } 
  }
    setBigmap(markets)
  }
    getMarket();
  }, [])

  const getMetadata = async(contract, id) => {
    let metadata = ''
    let result = await axios.get(`https://api.jakartanet.tzkt.io/v1/contracts/${contract}/bigmaps/token_metadata/keys/${id}`)
    let data =await result.data   
    let bytes=data.value.token_info['']
        bytes=hex2a(bytes)
        metadata =  await axios.get(bytes.replace('ipfs://', 'http://ipfs.io/ipfs/'))
        data = await metadata.data
        return data
  }
  
  const showObjkt = (o) => {
    if (objktView) return (setObjktView(false))
    setObjkt(o)
    setObjktView(true)
  }

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
      {app.address && 
        <Link style={{marginRight:'27px'}} to={`/Make`}>
          <div className='formButton'>Make Market</div><p/>
       </Link>}
       {bigmap?.length > 0  && bigmap.reverse().map((p,i)=> (

        p.active && (!checkTimesUp() || app.address==(p.taker)) &&

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
        <a style={{margin: '15px'}}>Maker: {p.maker &&p.maker.substr(0, 4) + "..." + p.maker.substr(-4)}</a>
         <a style={{margin: '15px'}}>Amount: {p.amount/1000000}ꜩ</a>
          <a style={{margin: '15px'}}>Interest: {p.interest/10}%</a>
          <a style={{margin: '15px'}}>Term: {p.term} Minutes</a> 
          {p.taker && <a >Taker: {p.taker.substr(0, 4) + "..." + p.taker.substr(-4)}</a>}

          <div style={{flexDirection: 'row', width:'auto', alignItems: 'flex-start'}}>
          {p.active && !p.taker && p.maker !== app.address && <button className='formButton' onClick = {() => {app.take_market(p.market_id, p.amount)}}>accept</button>}
          {p.active && !p.taker && app.address == p.maker && <button className='formButton' onClick = {() => {app.cancel_market(p.market_id)}}>cancel</button>}
          {p.active && p.taker && app.address == p.maker
           && !checkTimesUp(p.start_time, p.term)
           &&<button className='formButton' onClick = {() => {app.recover_market(p.market_id, getAmountwithInterest(p.amount,p.interest))}}> recover</button>}
          {p.active && app.address == p.taker && p.taker && checkTimesUp(p.start_time, p.term) && <button className='formButton'onClick = {() => {app.claim_market(p.market_id)}} >claim</button>}
          </div>
            </div>
          </div>
          
          ))}
        
      </div>
 
      <div><p/></div>
     
  </>
    );
  }
  
