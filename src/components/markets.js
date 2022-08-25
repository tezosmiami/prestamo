import React, { useEffect, useState } from 'react'

import ReactPlayer from 'react-player'
import Masonry from 'react-masonry-css'
import { Objkt } from './objkt'
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

export function hex2a(hex) {
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
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
    const result = await axios.get('https://api.jakartanet.tzkt.io/v1/bigmaps/98299/keys')

    for (let i=0; i < result.data.length; i++){
      result.data[i].value.market_id = result.data[i].key
      markets.push(result.data[i].value)
      for(let token of result.data[i].value.tokens){
      const metadata = await getMetadata(token.contract_address, token.token_id)
      token.metadata = metadata
      console.log(metadata)
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
  console.log(bigmap)
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
       {bigmap?.length > 0  && bigmap.map((p,i)=> (
                console.log(p),
        p.active &&
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
        <p>
          <a style={{margin: '18px'}}>Amount: {p.amount/1000000}ꜩ</a>
          <a style={{margin: '18px'}}>Interest: {p.interest/10}%</a>
          <a style={{margin: '18px'}}>Term: {p.term} minutes</a>
          {p.active && !p.taker && <button className='formButton' onClick= {() => {app.take_market(p.market_id, p?.amount)}}>accept</button>}
          {p.active && !p.taker && app.address == p.maker && <button className='formButton'>cancel</button>}
          {/* {p.active && wallet == p.maker && !p.taker && <button className='formButton'>recover</button>} */}
           {p.active && app.address == p.taker && p.taker &&  <button className='formButton'onClick= {() => {app.claim_market(p.market_id)}} >claim</button>}
            </p>
          </div>
          
          ))}
        
      </div>
 
      <div><p/></div>
     
  </>
    );
  }
  