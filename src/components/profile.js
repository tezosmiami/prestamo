import React, { useState } from 'react'
import { request, gql } from 'graphql-request'
import useSWR from 'swr';
import ReactPlayer from 'react-player'
import { useParams } from 'react-router-dom';
import Masonry from 'react-masonry-css'
// import { Search } from '../components/search';
// import { useSearchParams } from 'react-router-dom';

const breakpointColumns = {
  default: 7,
  1580: 7,
  1280: 6,
  980: 5,
  730: 4,
  680: 3,
};

export const getAddressbyName = gql`
query alias($param: String!) {
  tzprofiles(where: {alias: {_eq: $param}}) {
      account
      twitter
    }
  }
`

export const getAddressbySubjkt = gql`
query subjkt($param: String!) {
  hic_et_nunc_holder(where: { name: {_eq: $param}}) {
    address
  }
}
`
export const getObjkts = gql`
query walletName($param: String!) {
  tokens(where: {holdings: {holder_address: {_eq: $param}, amount: {_gte: "1"}}, artifact_uri: {_is_null: false}, mime_type: {_is_null: false}}, order_by: {minted_at: desc}) {
    artifact_uri
    display_uri
    platform
    fa2_address
    token_id
    mime_type
  }
}
` 
  
const fetcher = (key, query, param) => request(process.env.REACT_APP_TEZTOK_API, query, {param})

export const Profile = ({banned, app}) => {
  // const [searchData,setSearchData] = useState([]);
  // const [searchParams] = useSearchParams();
//   const [pageIndex, setPageIndex] = useState(0);
  // const [offset, setOffset] = useState(0)
  const [view, setView] = useState(0)
  const [choices, setChoices] = useState([])
  const [count, setCount] = useState(0)
  const [submit, setSubmit] = useState(false)
  let { account } = useParams();
  console.log(account)
  if (!account) account = app.address;

  const { data: alias } = useSWR(account.length !== 36 ? ['/api/name', getAddressbyName, account] : null, fetcher)
  // const { data: subjkt } = useSWR(account.length !== 36 ? ['/api/subjkt', getAddressbySubjkt, account.toLowerCase().replace(/\s+/g, '')] : null, hicFetcher)
  const address = account?.length === 36 ? account : alias?.tzprofiles[0]?.account || null
  const { data, error } = useSWR(address?.length === 36 ? ['/api/profile', getObjkts, address] : null, fetcher, { refreshInterval: 15000 })
  
  const add_remove = (p) => {
  
    if(choices.includes(p)){
      choices.splice(choices.findIndex(item => item === p), 1)
      setCount(count-1)
  } else {
    choices.push(p)
    setCount(count+1)
  }
  // choices.length > 0 ? setSubmit(true) : setSubmit(false)
  }

  if (alias && !address) return <div>nada. . .<p/></div>
  if (error) return <p>error</p>
  if (!data ) return <div>loading. . .<p/></div>  
  if(data.tokens.length === 0) return <div>no nfts in this wallet. . .<p/></div>
  const filtered = data.tokens.filter((i) => !banned.includes(i.artist_address))
  



    return (
      <>
        <a style={{fontSize:'27px'}} href={alias?.tzprofiles[0]?.twitter ? `https://twitter.com/${alias.tzprofiles[0].twitter}`: null} target="blank"  rel="noopener noreferrer">
        {account?.length===36 ? address.substr(0, 4) + "..." + address.substr(-4) : account}
      </a>
      {/* <img className='avatar' src={filteredcreated ? filteredcreated[0].minter_profile?.logo : null}/> */}

     
          <div style= {{borderBottom: '6px dashed', width: '80%', marginTop:'33px'}} />
         <div style= {{borderBottom: '6px dashed', width: '80%'}} />
       <div>
          <p></p>
       </div>
       {/* <Search returnSearch={setSearchData} query={searchParams.get('search')} banned={banned}/> */}

       {count > 0 && <button onClick= {() => setSubmit(!submit)}><p>{!submit ? 'next' : 'back'}</p></button>}
       <div className='container'>
       <Masonry
        breakpointCols={breakpointColumns}
        className={view===1 ? '' : 'grid'}
         columnClassName='column'>
        {filtered && !submit && filtered.map(p=> (
        // <Link  key={p.artifact_uri+ p.token_id} to={`/${p.fa2_address}/${p.token_id}`}>
        <div style ={{backgroundColor: choices.includes(p) && getComputedStyle(document.body).getPropertyValue('--text')}} key={p.artifact_uri + p.token_id} onClick={() => {return add_remove(p)}}>
        {p.mime_type.includes('image') && p.mime_type !== 'image/svg+xml' ?
      
        <img alt='' className= 'pop'  src={`https://ipfs.io/ipfs/${p.display_uri ? p.display_uri?.slice(7) : p.artifact_uri.slice(7)}`}/> 
        : p.mime_type.includes('video') ? 
         <div className='pop'>
           <ReactPlayer url={'https://ipfs.io/ipfs/' + p.artifact_uri.slice(7)} width='100%' height='100%' muted={true} playing={false} loop={false}/>
          </div>
          : p.mime_type.includes('audio') ?  
          <div className= 'pop'>
            <img className= 'pop' alt='' src={'https://ipfs.io/ipfs/' + p.display_uri.slice(7)} />
            <audio style={{width:'93%'}} src={'https://ipfs.io/ipfs/' + p.artifact_uri.slice(7)} controls />
          </div>
        : p.mime_type.includes('text') ? <div className='text'>{p.description}</div> : ''}
        {/* //  </Link> */}
        </div>
          ))}
          </Masonry>
          </div>

          <div className='container'>
       <Masonry
        breakpointCols={breakpointColumns}
        className={view===1 ? '' : 'grid'}
         columnClassName='column'>
        {filtered && submit && choices.map(p=> (
        // <Link  key={p.artifact_uri+ p.token_id} to={`/${p.fa2_address}/${p.token_id}`}>
        <div  key={p.artifact_uri + p.token_id}>
        {p.mime_type.includes('image') && p.mime_type !== 'image/svg+xml' ?
      
        <img alt='' className= 'pop'  src={`https://ipfs.io/ipfs/${p.display_uri ? p.display_uri?.slice(7) : p.artifact_uri.slice(7)}`}/> 
        : p.mime_type.includes('video') ? 
         <div className='pop'>
           <ReactPlayer url={'https://ipfs.io/ipfs/' + p.artifact_uri.slice(7)} width='100%' height='100%' muted={true} playing={false} loop={false}/>
          </div>
          : p.mime_type.includes('audio') ?  
          <div className= 'pop'>
            <img className= 'pop' alt='' src={'https://ipfs.io/ipfs/' + p.display_uri.slice(7)} />
            <audio style={{width:'93%'}} src={'https://ipfs.io/ipfs/' + p.artifact_uri.slice(7)} controls />
          </div>
        : p.mime_type.includes('text') ? <div className='text'>{p.description}</div> : ''}
        {/* //  </Link> */}
        </div>
          ))}
          </Masonry>
          </div>
       <div>
          <p></p>
       </div>
     
   
       {count > 0 && <button onClick= {() => setSubmit(!submit)}><p>{!submit ? 'next' : 'back'}</p></button>}
       {/* <div>
          {pageIndex >= 1 && <button onClick={() => {setPageIndex(pageIndex - 1); setOffset(offset-99); setOffsetNew(offsetNew-27); mutate('/api/objkts')}}>Previous  &nbsp;- </button>}
          <button onClick={() => {setPageIndex(pageIndex + 1); setOffset(offset+99); setOffsetNew(offsetNew+27); mutate('/api/objkts')}}>Next</button>   
       </div> */}
     </>
    );
  }
  
