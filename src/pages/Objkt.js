import React, { useState, useEffect } from 'react'
import { useTezosContext } from "../context/tezos-context";
import { request, gql } from 'graphql-request'
import ReactPlayer from 'react-player'
import { useParams, Link } from 'react-router-dom';



export const Objkt = ({banned}) => {
  const [objkt, setObjkt] = useState([]);
  const [message, setMessage] = useState();
  const app = useTezosContext();
  const params = useParams();

  
    useEffect(() => {
      const getObjkt = async() => {
          if (params && banned) { 
          const result = await request(process.env.REACT_APP_TEZTOK_API, queryObjkt)
          const filtered = result.tokens.filter((i) => !banned.includes(i.artist_address))
          setObjkt(filtered[0] || ['nada'] )
          }
          }
          getObjkt();
      }, [params, banned, queryObjkt])

    if (objkt.length === 0) return <div>loading. . .<p/></div>
    if (objkt[0] === 'nada') return <div>nada. . .<p/></div>

    const handleCollect = () => async() => {
      !app.address && setMessage('please sync. . .') 
      if(app.address) try {
          setMessage('ready wallet. . .');
          const isCollected = await app.collect({swap_id: objkt.listings[0].swap_id || objkt.listings[0].ask_id, price: objkt.price,
             contract: objkt.listings[0].contract_address, platform: objkt.listings[0].type.includes('OBJKT') ? 'OBJKT' : objkt.platform});
          setMessage(isCollected ? 'congratulations - you got it!' : 'transaction denied. . .');
        
      } catch(e) {
          setMessage('errors. . .');
          console.log('Error: ', e);
      }
      setTimeout(() => {
          setMessage(null);
      }, 3200);
    };
    console.log(objkt)
return(
  <>
  
   {objkt.mime_type?.includes('image') && objkt.mime_type !== 'image/svg+xml' ?  
    // <a 
    //   href={params.contract ==='KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton' ? 
    //   `https://hicetnunc.miami/objkt/${params.id}` : 
    //   params.contract === 'KT1LjmAdYQCLBjwv4S2oFkEzyHVkomAf5MrW' ? 
    //   `https://versum.xyz/token/versum/${params.id}`
    //   : `https://objkt.com/asset/${params.contract}/${params.id}`} target="blank"  rel="noopener noreferrer">  
    <a href = {`https://ipfs.io/ipfs/${objkt.artifact_uri.slice(7)}`} target='blank'  rel='noopener noreferrer'>
    <img alt='' className= 'view' src={`https://ipfs.io/ipfs/${objkt.platform === '8BIDOU' ? objkt.display_uri.slice(7) : objkt.artifact_uri.slice(7)}`}/> 
    </a>
    // </a>
    :
   objkt?.mime_type?.includes('video') ?  
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
    : objkt?.mime_type?.includes('audio') ?  
    <div className='view'>
       <img className='view' alt='' style={{width:'90%', margin: '12px'}} src={'https://ipfs.io/ipfs/' + objkt.display_uri.slice(7)} />
      <audio  style={{ margin: '6px'}}src={'https://ipfs.io/ipfs/' + objkt.artifact_uri.slice(7)} controls />
    </div>
    :  objkt.mime_type.includes('text') ? <a className='view' href = {`https://ipfs.io/ipfs/${objkt.artifact_uri.slice(7)}`} target='blank'  rel='noopener noreferrer'><div className='textObjkt'>{objkt.description}</div></a> : null}
    <div>
    <div style= {{borderBottom: '6px dotted', width: '63%', marginTop:'33px'}} />
        
        <p hidden={objkt.mime_type.includes('text')}>{objkt.name} </p>
       
         <div style= {{borderBottom: '6px dotted', width: '63%', marginBottom: '27px'}} />

        </div>
       
        <p hidden={objkt.mime_type.includes('text')} className='descript'> {objkt.description}</p>
        {!objkt.mime_type.includes('text') && <div style= {{borderBottom: '6px dotted', width: '63%', margin: '33px'}} />}
        {/* <a href={params.contract ==='KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton' ? `https://hicetnunc.miami/objkt/${params.id}` : 
              params.contract === 'KT1LjmAdYQCLBjwv4S2oFkEzyHVkomAf5MrW' ? `https://versum.xyz/token/versum/${params.id}` 
             : `https://objkt.com/asset/${params.contract}/${params.id}`} target="blank"  rel="noopener noreferrer">   */}
            <div>
            
            <Link to={`/${objkt.minter_profile?.alias || objkt.artist_address}`}>created by:  {objkt.minter_profile?.alias
               ? objkt.minter_profile?.alias : objkt?.artist_address ? objkt.artist_address?.substr(0, 5) + ". . ." + objkt.artist_address?.substr(-5) :   `${objkt.creators[0]}, ${objkt.creators[1]}`}</Link>
           <p>[-]</p>
            <div>{objkt.price > 0 ?
                 <div onClick={handleCollect()}>
                   {`collect for ${objkt.price/1000000}ꜩ`}
                  <a className='center'>-</a>
                 </div> : ''} 
                 <a href={objkt.platform ==='HEN' ? `https://hicetnunc.miami/objkt/${params.id}` 
                    : objkt.platform === 'VERSUM' ? `https://versum.xyz/token/versum/${params.id}` 
                    : objkt.platform === '8BIDOU' && objkt.eightbid_rgb.length < 800 ? `https://ui.8bidou.com/item/?id=${params.id}` 
                    : objkt.platform === '8BIDOU' &&  objkt.eightbid_rgb.length > 800 ? `https://ui.8bidou.com/item_r/?id=${params.id}` 
                    : objkt.platform === 'TYPED' ? `https://typed.art/${params.id}`  
                    : `https://objkt.com/asset/${params.contract}/${params.id}`} target="blank"  rel="noopener noreferrer">
                    
                    {objkt.platform === 'HEN' ? 'H=N' : objkt.platform === "VERSUM" ? objkt.platform 
                    : objkt.platform === '8BIDOU' ? '8BiDOU'
                    : objkt.platform === 'TYPED' ? 'TYPEDART' :'OBJKT'}</a>
                </div>
            </div>
            {objkt.holdings[objkt.holdings.length-1].holder_address != objkt.artist_address
             && <Link to={`/${objkt.holdings[objkt.holdings.length-1]?.holder_profile?.alias || objkt.holdings[objkt.holdings.length-1].holder_address}`}><p>curated by: {objkt.holdings[objkt.holdings.length-1].holder_profile?.alias || objkt.holdings[objkt.holdings.length-1]?.holder_address.substr(0, 5) + ". . ." + objkt.holdings[objkt.holdings.length-1]?.holder_address.substr(-5)}</p></Link>}
            {/* {console.log(objkt)} */}
            {message}
             <div style= {{borderBottom: '6px dotted', width: '63%', marginTop:'27px'}} />
        <div style= {{borderBottom: '6px dotted', width: '63%', marginBottom: '33px'}} />
  </>
)
}