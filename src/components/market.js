import React, { useEffect, useState } from 'react'

import ReactPlayer from 'react-player'
import Masonry from 'react-masonry-css'
import usefetch from '../hooks/useFetch'
import { Objkt } from './objkt'

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

export const Market = ({app}) => {

  const [objktView, setObjktView] = useState(false)
  const [token, setToken] = useState({});
  const [bigmap, setBigmap] = useState([])
  const[count,setCount]=useState(0)

  useEffect(() => {
    const getMarket = async () => {
    const result =  await axios.get('https://api.jakartanet.tzkt.io/v1/bigmaps/98299/keys')
    result && setBigmap(result.data)
  }
    getMarket();
    
  }, [])

  const getMetadata = async(contract, id) => {
    let result = await axios.get(`https://api.jakartanet.tzkt.io/v1/contracts/${contract}/bigmaps/token_metadata/keys/${id}`)
        let bytes=result.data.value.token_info['']
        bytes=hex2a(bytes)
        metadata =  await axios.get(bytes.replace('ipfs://', 'http://ipfs.io/ipfs/'))
     
        return metadata.data
  }
  const hideObjkt = () => {
    setObjktView(false)
  }
  const showObjkt = (q) => {
    setToken(q)
    setObjktView(true)
  }
let metadata = ''
let tokens =0

  return (
      <>
       <div style={{marginTop:'11px'}}>
        Latest Markets
       </div>

       <div style= {{borderBottom: '3px dashed', width: '88%', marginBottom: '1px', marginTop: '27px'}} />
          <div style= {{borderBottom: '3px dashed', width: '88%', marginBottom: '18px'}} />
          {objktView &&<Objkt hideObjkt={hideObjkt} token={token} setObjktView={setObjktView}/>}
      
       {/* <div className='container' style={{opacity: objktView && '.2'}}> */}
       {bigmap && bigmap.map((p,i)=> (
       <div key={i} className='market'>
       <Masonry
        breakpointCols={breakpointColumns}
        className= 'grid'
        columnClassName='column'>
         
         
        {p.value.tokens && p.value.tokens.map(async (q,i) => (
          tokens=tokens+1, console.log(tokens),
          console.log(q),
          metadata = await getMetadata(q.contract_address, q.token_id),
        <div key={i} onClick= {() => {showObjkt(metadata)}}>
        {metadata?.formats[0].mimeType?.includes('image') && metadata.formats[0].mimeType !== 'image/svg+xml' ?
      
        <img alt='' className= 'pop'  src={`https://ipfs.io/ipfs/${metadata.display_uri ? metadata.display_uri?.slice(7) : metadata.artifact_uri.slice(7)}`}/> 
        : metadata.formats[0].mimeType.includes('video') ? 
         <div className='pop'>
           <ReactPlayer url={'https://ipfs.io/ipfs/' + metadata.artifact_uri.slice(7)} width='100%' height='100%' muted={true} playing={false} loop={false}/>
          </div>
          : metadata.formats[0].mimeType.includes('audio') ?  
          <div className= 'pop'>
            <img className= 'pop' alt='' src={'https://ipfs.io/ipfs/' + metadata.display_uri.slice(7)} />
            <audio style={{width:'93%'}} src={'https://ipfs.io/ipfs/' + metadata.artifact_uri.slice(7)} controls />
          </div>
        : metadata.formats[0].mimeType.includes('text') ? <div className='text'>{metadata.description}</div> : ''}

        </div>
       ))}
          </Masonry>
        <p>
          <a style={{margin: '18px'}}>Amount: 12 ꜩ</a>
          <a style={{margin: '18px'}}>Interest: 12 ꜩ</a>
          <a style={{margin: '18px'}}>Term: 22 days</a>
          </p>
          </div>
          
          ))}
        
      {/* </div> */}
 
      <div><p/></div>
     
  </>
    );
  }
  
