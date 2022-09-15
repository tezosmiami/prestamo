import React, { useRef } from 'react'
import ReactPlayer from 'react-player'
import { useOutsideClick } from '../hooks/useOutsideClick'

export const Objkt = ({setObjktView, objkt}) => {
  const ref = useRef();
  useOutsideClick(ref, () => setObjktView(false));
return(
  <>
    <div ref={ref} className='objkt'>
    <button onClick= {() => {setObjktView(false)}}><p/>x</button>
    {objkt && objkt.metadata.formats[0].mimeType.includes('image') && objkt.metadata.formats[0].mimeType !== 'image/svg+xml' ?  
   
    <a href = {`https://ipfs.io/ipfs/${objkt.metadata.artifactUri.slice(7)}`} target='blank'  rel='noopener noreferrer'>
    <img alt='' className= 'view' src={`https://ipfs.io/ipfs/${objkt.metadata.artifactUri.slice(7) || objkt.metadata.displayUri.slice(7)}`}/> 
    </a>
    :
   objkt.metadata.formats[0].mimeType.includes('video') ?  
  
      <div className='view'>
        <a href = {`https://ipfs.io/ipfs/${objkt.metadata.artifactUri.slice(7)}`} target='blank'  rel='noopener noreferrer'>
        <ReactPlayer url={'https://ipfs.io/ipfs/' + objkt.metadata.artifactUri.slice(7)} width='100%' height='100%' muted={true} playing={true} loop={true} controls={true}/>
         </a>
      </div>
   
    : objkt.metadata.formats[0].mimeType.includes('audio') ?  
    <div className='view'>
       <img alt='' className='view' style={{width:'90%', margin: '12px'}} src={'https://ipfs.io/ipfs/' + objkt.metadata.displayUri.slice(7)} />
      <audio  style={{ margin: '3px'}}src={'https://ipfs.io/ipfs/' + objkt.metadata.artifactUri.slice(7)} controls />
    </div>
    :  objkt.metadata.formats[0].mimeType.includes('text') ? <a className='view' href = {`https://ipfs.io/ipfs/${objkt.metadata.artifactUri.slice(7)}`} target='blank'  rel='noopener noreferrer'><div className='textObjkt'>{objkt.metadata.description}</div></a> : null}
    <div>
    <div style= {{borderBottom: '3px dashed', width: '63%', marginTop:'33px'}} />
        <p hidden={objkt.metadata.formats[0].mimeType?.includes('text')}>{objkt.metadata.name} </p>
         <div style= {{borderBottom: '3px dashed', width: '63%', marginBottom: '27px'}} />
        </div>
        <p hidden={objkt.metadata.formats[0].mimeType.includes('text')} className='descript'> {objkt.metadata.description}</p>
        {!objkt.metadata.formats[0].mimeType.includes('text') && <div style= {{borderBottom: '3px dashed', width: '63%', margin: '33px'}} />}
            <div>
            
            <p>created by: {objkt.metadata.creators[0].substr(0, 5) + "..." + objkt.metadata.creators[0].substr(-5)}</p>
            {/* <p>editions: {objkt.metadata.editions}</p> */}
            <div>[-]</div>
            <p>contract: {objkt.contract_address ? objkt.contract_address.substr(0, 5) + "..." + objkt.contract_address.substr(-5)
                          : objkt.contract.address.substr(0, 5) + "..." + objkt.contract.address.substr(-5)}</p>
               {/* <div>
                 <a href={objkt.platform ==='HEN' ? `https://hicetnunc.miami/objkt/${token.token_id}` 
                    : objkt.platform === 'VERSUM' ? `https://versum.xyz/token/versum/${token.token_id}` 
                    : objkt.platform === '8BIDOU' && objkt.eightbid_rgb.length < 800 ? `https://ui.8bidou.com/item/?id=${token.token_id}` 
                    : objkt.platform === '8BIDOU' &&  objkt.eightbid_rgb.length > 800 ? `https://ui.8bidou.com/item_r/?id=${token.token_id}` 
                    : objkt.platform === 'TYPED' ? `https://typed.art/${token.token_id}`  
                    : `https://objkt.com/asset/${token.fa2_address}/${token.token_id}`} target="blank"  rel="noopener noreferrer">
                    
                    {objkt.platform === 'HEN' ? 'H=N' : objkt.platform === "VERSUM" ? objkt.platform 
                    : objkt.platform === '8BIDOU' ? '8BiDOU'
                    : objkt.platform === 'TYPED' ? 'TYPEDART' :'OBJKT'}</a>
               </div> */}
               <p/>
                </div>
            </div>

  </>
)
}