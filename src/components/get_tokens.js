import React, { useEffect, useState } from 'react'
import ReactPlayer from 'react-player'
const axios = require('axios')

export function hex2a(hex) {
  var str = '';
  for (var i = 0; i < hex.length; i += 2)
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
}   

export const Tokens = ({tokens}) => {
    const [objktView, setObjktView] = useState(false)
    const [token, setToken] = useState({});
    const [market, setMarket] = useState([]);
  
    
    // useEffect((token) => {
    //   const getMarket = async() => {
    //   const result = await axios.get('https://api.jakartanet.tzkt.io/v1/bigmaps/98299')
    //     console.log(result)
    //   setMarket(result)
    // }
    //   getMarket();
     
    // }, [])

    const hideObjkt = () => {
      setObjktView(false)
    }
    const showObjkt = (q) => {
      setToken(q)
      setObjktView(true)
    }
let metadata=''
    const getMetadata = async(contract, id) => {
        let result = await axios.get(`https://api.jakartanet.tzkt.io/v1/contracts/${contract}/bigmaps/token_metadata/keys/${id}`)
            let bytes=result.data.value.token_info['']
            bytes=hex2a(bytes)
            metadata =  await axios.get(bytes.replace('ipfs://', 'http://ipfs.io/ipfs/'))
         
            return metadata.data
      }
    
    return(
     <>  
    {tokens.map(async q => (
        metadata = getMetadata(q.contract_address, q.token_id),
        console.log(metadata),
      <div key={q} onClick= {() => {showObjkt(metadata)}}>
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
</>) 
    }