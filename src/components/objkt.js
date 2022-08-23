import React, { useState, useEffect, useContext } from 'react'
import { useTezosContext } from "../context/tezos-context";
import { request, gql } from 'graphql-request'
import useSWR, { useSWRConfig } from 'swr';
import ReactPlayer from 'react-player'
import { Link } from 'react-router-dom';


// const token={'token_id': 600038, 'fa2_address': 'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton'}
export const Objkt = ({setObjktView, token}) => {
  const [objkt, setObjkt] = useState([]);
  const [message, setMessage] = useState();
  const app = useTezosContext();
console.log(token)
  const queryObjkt = gql`
    query objkt {
      tokens(where: {editions: {_gte: "1"}, fa2_address: {_eq: "${token.fa2_address}", _neq: "KT1EpGgjQs73QfFJs9z7m1Mxm5MTnpC2tqse"}, token_id: {_eq: "${token.token_id}"}}) {
        artist_address
        artifact_uri
        display_uri
        creators
        name
        editions
        description
        minter_profile {
          alias
          twitter
        }
        price
        mime_type
        description
        platform
        eightbid_rgb
        tags {
          tag
        }
        listings (order_by: {created_at: desc}){
          price
          swap_id
          contract_address
          ask_id
          type
        }
        holdings(where: {amount: {_gt: "0"}}, order_by: {first_received_at: asc}) {
          holder_address
          holder_profile {
            alias
          }
        }
      }
    }  
    `
    useEffect(() => {
      const getObjkt = async() => {
          const result = await request(process.env.REACT_APP_TEZTOK_API, queryObjkt)
          setObjkt(result.tokens[0])
        }
          getObjkt();
      }, [])

    if (objkt.length === 0) return <div>loading. . .<p/></div>
    if (objkt[0] === 'nada') return <div>nada. . .<p/></div>

    // const handleCollect = () => async() => {
    //   !app.address && setMessage('please sync. . .') 
    //   if(app.address) try {
    //       setMessage('ready wallet. . .');
    //       const isCollected = await app.collect({swap_id: objkt.listings[0].swap_id || objkt.listings[0].ask_id, price: objkt.price,
    //          contract: objkt.listings[0].contract_address, platform: objkt.listings[0].type.includes('OBJKT') ? 'OBJKT' : objkt.platform});
    //       setMessage(isCollected ? 'congratulations - you got it!' : 'transaction denied. . .');
        
    //   } catch(e) {
    //       setMessage('errors. . .');
    //       console.log('Error: ', e);
    //   }
    //   setTimeout(() => {
    //       setMessage(null);
    //   }, 3200);
    // };
    console.log(objkt)
return(
  <>
    <div className='objkt'>
    <button onClick= {() => {setObjktView(false)}}><p/>x</button>
    {objkt && objkt.mime_type.includes('image') && objkt.mime_type !== 'image/svg+xml' ?  
    // <a 
    //   href={token.contract ==='KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton' ? 
    //   `https://hicetnunc.miami/objkt/${token.id}` : 
    //   token.contract === 'KT1LjmAdYQCLBjwv4S2oFkEzyHVkomAf5MrW' ? 
    //   `https://versum.xyz/token/versum/${token.id}`
    //   : `https://objkt.com/asset/${token.contract}/${token.id}`} target="blank"  rel="noopener noreferrer">  
    <a href = {`https://ipfs.io/ipfs/${objkt.artifact_uri.slice(7)}`} target='blank'  rel='noopener noreferrer'>
    <img alt='' className= 'view' src={`https://ipfs.io/ipfs/${objkt.platform === '8BIDOU' ? objkt.display_uri.slice(7) : objkt.artifact_uri.slice(7)}`}/> 
    </a>
    // </a>
    :
   objkt.mime_type.includes('video') ?  
  //  <a key={objkt.artifact_uri+objkt.token_id} 
  //     href={objkt.fa2_address === 'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton' ?
  //    `https://hicetnunc.miami/objkt/${objkt.token_id}` : 
  //     objkt.fa2_address === 'KT1LjmAdYQCLBjwv4S2oFkEzyHVkomAf5MrW' ? 
  //    `https://versum.xyz/token/versum/${objkt.token_id}` 
  //      : `https://objkt.com/asset/${objkt.fa2_address}/${objkt.token_id}`} target="blank"  rel="noopener noreferrer"> 
      <div className='view'>
        <a href = {`https://ipfs.io/ipfs/${objkt.artifact_uri.slice(7)}`} target='blank'  rel='noopener noreferrer'>
        <ReactPlayer url={'https://ipfs.io/ipfs/' + objkt.artifact_uri.slice(7)} width='100%' height='100%' muted={true} playing={true} loop={true} controls={true}/>
         </a>
      </div>
    // </a> 
    : objkt.mime_type.includes('audio') ?  
    <div className='view'>
       <img className='view' style={{width:'90%', margin: '12px'}} src={'https://ipfs.io/ipfs/' + objkt.display_uri.slice(7)} />
      <audio  style={{ margin: '3px'}}src={'https://ipfs.io/ipfs/' + objkt.artifact_uri.slice(7)} controls />
    </div>
    :  objkt.mime_type.includes('text') ? <a className='view' href = {`https://ipfs.io/ipfs/${objkt.artifact_uri.slice(7)}`} target='blank'  rel='noopener noreferrer'><div className='textObjkt'>{objkt.description}</div></a> : null}
    <div>
    <div style= {{borderBottom: '3px dashed', width: '63%', marginTop:'33px'}} />
        
        <p hidden={objkt.mime_type?.includes('text')}>{objkt.name} </p>
       
         <div style= {{borderBottom: '3px dashed', width: '63%', marginBottom: '27px'}} />

        </div>
       
        <p hidden={objkt.mime_type.includes('text')} className='descript'> {objkt.description}</p>
        {!objkt.mime_type.includes('text') && <div style= {{borderBottom: '3px dashed', width: '63%', margin: '33px'}} />}
        {/* <a href={token.contract ==='KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton' ? `https://hicetnunc.miami/objkt/${token.id}` : 
              token.contract === 'KT1LjmAdYQCLBjwv4S2oFkEzyHVkomAf5MrW' ? `https://versum.xyz/token/versum/${token.id}` 
             : `https://objkt.com/asset/${token.contract}/${token.id}`} target="blank"  rel="noopener noreferrer">   */}
            <div>
            
            <a>created by:  {objkt.minter_profile?.alias
               ? objkt.minter_profile?.alias : objkt?.artist_address ? objkt.artist_address?.substr(0, 5) + ". . ." + objkt.artist_address?.substr(-5) :   `${objkt.creators[0]}, ${objkt.creators[1]}`}</a>
            <p>editions: {objkt.editions}</p>
            {/* <a>[-]</a> */}
               <div>
                 <a href={objkt.platform ==='HEN' ? `https://hicetnunc.miami/objkt/${token.token_id}` 
                    : objkt.platform === 'VERSUM' ? `https://versum.xyz/token/versum/${token.token_id}` 
                    : objkt.platform === '8BIDOU' && objkt.eightbid_rgb.length < 800 ? `https://ui.8bidou.com/item/?id=${token.token_id}` 
                    : objkt.platform === '8BIDOU' &&  objkt.eightbid_rgb.length > 800 ? `https://ui.8bidou.com/item_r/?id=${token.token_id}` 
                    : objkt.platform === 'TYPED' ? `https://typed.art/${token.token_id}`  
                    : `https://objkt.com/asset/${token.fa2_address}/${token.token_id}`} target="blank"  rel="noopener noreferrer">
                    
                    {objkt.platform === 'HEN' ? 'H=N' : objkt.platform === "VERSUM" ? objkt.platform 
                    : objkt.platform === '8BIDOU' ? '8BiDOU'
                    : objkt.platform === 'TYPED' ? 'TYPEDART' :'OBJKT'}</a>
               </div>
               <p/>
                </div>
            </div>
            {/* {objkt.holdings[objkt.holdings.length-1].holder_address != objkt.artist_address
             && <Link to={`/${objkt.holdings[objkt.holdings.length-1]?.holder_profile?.alias || objkt.holdings[objkt.holdings.length-1].holder_address}`}><p>curated by: {objkt.holdings[objkt.holdings.length-1].holder_profile?.alias || objkt.holdings[objkt.holdings.length-1]?.holder_address.substr(0, 5) + ". . ." + objkt.holdings[objkt.holdings.length-1]?.holder_address.substr(-5)}</p></Link>} */}
            {/* {console.log(objkt)} */}
            {message}
             {/* <div style= {{borderBottom: '3px dashed', width: '63%', marginTop:'27px'}} /> */}
        {/* <div style= {{borderBottom: '3px dashed', width: '63%', marginBottom: '33px'}} /> */}

  </>
)
}