import React, { useEffect, useState } from 'react'
import { request, gql } from 'graphql-request'
// import useSWR from 'swr';
import ReactPlayer from 'react-player'
import Masonry from 'react-masonry-css'
import { Objkt } from './objkt'
import {useGetMarkets} from '../hooks/useGetMarkets'

const axios = require('axios')


const chunkSize = 3

const breakpointColumns = {
  default: 7,
  1580: 7,
  1280: 6,
  980: 5,
  730: 4,
  680: 3,
};

export const getLatestMarkets = gql`
query getMarkets {
  tokens(where: {holdings: {holder_address: {_eq: "tz2WNxPcE7JZhAFfqGEHkMtd2gcHaeiJKMWE"}, amount: {_gte: "1"}}, artifact_uri: {_is_null: false}, formats[0].mimeType: {_is_null: false}}, order_by: {minted_at: desc}, limit: 20) {
    artifact_uri
    display_uri
    platform
    fa2_address
    token_id
    formats[0].mimeType
  }
}
` 

export function hex2a(hex) {
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}   

// const fetcher = (key, query, param) => request(process.env.REACT_APP_TEZTOK_API, query)

export const Market = ({banned, app}) => {

  const [objktView, setObjktView] = useState(false)
  const [token, setToken] = useState({});



  
  const market=useGetMarkets()
  
console.log(market)


 
  const hideObjkt = () => {
    setObjktView(false)
  }
  const showObjkt = (q) => {
    setToken(q)
    setObjktView(true)
  }
let metadata = ''
console.log(market)

  return (
      <>
       <div style={{marginTop:'11px'}}>
        Latest Markets
       </div>

       <div style= {{borderBottom: '3px dashed', width: '88%', marginBottom: '1px', marginTop: '27px'}} />
          <div style= {{borderBottom: '3px dashed', width: '88%', marginBottom: '18px'}} />
          {objktView &&<Objkt hideObjkt={hideObjkt} token={token} setObjktView={setObjktView}/>}
       {/* <Search returnSearch={setSearchData} query={searchParams.get('search')} banned={banned}/> */}
       <div className='container' style={{opacity: objktView && '.2'}}>
       {/* {count > 0 && <button onClick= {() => setSubmit(!submit)}><p>{!submit ? 'next >' : '< back'}</p></button>} */}
 
       {market && market.map(p=> (
        console.log(p), 
       <div className='market'>
       <Masonry
        breakpointCols={breakpointColumns}
        className= 'grid'
        columnClassName='column'>
        {p.tokens.map(q=>(
         console.log('test',q.metadata ),
        <div onClick= {() => {showObjkt(p)}}>
        
        {q.metadata.formats[0].mimeType?.includes('image') && q?.metadata?.formats[0].mimeType !== 'image/svg+xml' ?
      
        <img alt='' className= 'pop'  src={`https://ipfs.io/ipfs/${q.metadata.display_uri ? q.metadata.display_uri?.slice(7) : q.metadata.artifact_uri.slice(7)}`}/> 
        : q.metadata.formats[0].mimeType.includes('video') ? 
         <div className='pop'>
           <ReactPlayer url={'https://ipfs.io/ipfs/' + q.metadata.artifact_uri.slice(7)} width='100%' height='100%' muted={true} playing={false} loop={false}/>
          </div>
          : q.metadata.formats[0].mimeType.includes('audio') ?  
          <div className= 'pop'>
            <img className= 'pop' alt='' src={'https://ipfs.io/ipfs/' + q.metadata.display_uri.slice(7)} />
            <audio style={{width:'93%'}} src={'https://ipfs.io/ipfs/' + q.metadata.artifact_uri.slice(7)} controls />
          </div>
        : q.metadata.formats[0].mimeType.includes('text') ? <div className='text'>{q.metadata.description}</div> : ''}
        {/* //  </Link> */}
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
        
      </div>
  
      <div><p/></div>
     
     
   
     {/* {count > 0 && <button onClick= {() => setSubmit(!submit)}><p>{!submit ? 'next' : 'go back'}</p></button>} */}
      
      {/* <div>
          {pageIndex >= 1 && <button onClick={() => {setPageIndex(pageIndex - 1); setlOffset(offset-99); setOffsetNew(offsetNew-27); mutate('/api/objkts')}}>Previous  &nbsp;- </button>}
          <button onClick={() => {setPageIndex(pageIndex + 1); setOffset(offset+99); setOffsetNew(offsetNew+27); mutate('/api/objkts')}}>Next</button>   
        </div> */}
  </>
    );
  }
  
