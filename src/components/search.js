import React, { useState, useEffect } from 'react'
import { request, gql } from 'graphql-request'
import { useNavigate, Link } from "react-router-dom";
import ReactPlayer from 'react-player'
import Masonry from 'react-masonry-css'


const breakpointColumns = {
  default: 5,
  1540: 4,
  1230: 3,
  920: 2,
  610: 1
};

const getSearch = gql`
    query querySearch($word: String!, $offset: Int!){
      aliases: tokens(where: {editions: {_eq: "1"}, price: {_gt: 0}, artifact_uri: {_is_null: false}, artist_profile: {alias: {_eq: $word}},
        mime_type: {_is_null: false}, fa2_address: {_neq: "KT1EpGgjQs73QfFJs9z7m1Mxm5MTnpC2tqse"}}, limit: 108, order_by: {minted_at: desc}, offset: $offset ) {
          mime_type
          artifact_uri
          display_uri
          fa2_address
          token_id
          artist_address
          artist_profile {
      alias
    }
      }
      tags: tokens(where: {tags: {tag: {_eq: $word}}, artifact_uri: {_is_null: false},
        mime_type: {_is_null: false}, editions: {_eq: "1"}, fa2_address: {_neq: "KT1EpGgjQs73QfFJs9z7m1Mxm5MTnpC2tqse"}}, limit: 108, order_by: {minted_at: desc}, offset: $offset) {
          mime_type
          artifact_uri
          display_uri
          fa2_address
          token_id
          artist_address

      }
    }`
export const Search = ({returnSearch, query, banned}) => {
    const navigate = useNavigate();
    const [search, setSearch] = useState(query?.toLowerCase())
    const [input, setInput] = useState()
    const [loading, setLoading] = useState()
    const [objkts, setObjkts] = useState()
    const [isArtist, setIsArtist] = useState(Boolean)
    const [offset, setOffset] = useState(0);
    const [pageIndex, setPageIndex] = useState(0)

  //   const getSearch = gql`
  //   query querySearch {
  //       tokens(where: {_or: [{tags: {tag: {_ilike: ${search}}}}, {artist_profile: {alias: {_ilike: ${search}}}}],
  //         mime_type: {_is_null: false}, editions: {_eq: "1"}}, limit: 108, order_by: {minted_at: desc}) {
  //           mime_type
  //           artifact_uri
  //           fa2_address
  //           token_id
  //           artist_address
  //           artist_profile {
  //             alias
  //           }
  //         }
  //     }
  // `
  

    const handleKey = (e) => {
        if (e.key === 'Enter') { 
            setSearch(e.target.value.toLowerCase())
            setInput('')
        }
    }

    useEffect(() => {
    const getObjkts = async() => {
        if (search && banned) { 
        setObjkts([])
        setLoading(true)  
        const result = await request(process.env.REACT_APP_TEZTOK_API,  getSearch, {word: search,offset: offset})
        const aliases = result.aliases.filter((i) => !banned.includes(i.artist_address))
        const tags = result.tags.filter((i) => !banned.includes(i.artist_address))
        const tags_artifacts = new Set(tags.map(({ artifact_uri }) => artifact_uri));
        const total = [
          ...tags,
          ...aliases.filter(({ artifact_uri }) => !tags_artifacts.has(artifact_uri))
        ];
        setObjkts(total)
        setIsArtist(total.every((i) => i.artist_profile?.alias === search))
        returnSearch(total)
        navigate({
            pathname: '/',
            search: `search=${search}`,
            replace: false
          });
         setLoading(false); 
        }
        }
        getObjkts();
    }, [search, banned, offset, navigate, returnSearch])

    // if (search && !loading) return (<div>empty return. . .</div>)
    // if (loading) return 'loading. . .'

    return(
  <>
    <div className='container'>
    <div>
        <input
        className='reverse searchbar'
        type="text"
        name="search"
        value={input  ?? ""}
        onInput={e => setInput(String(e.target.value))}
        label="search ↵"
        placeholder="search ↵"
        onKeyPress={handleKey}
      />
    </div>
<p></p>
    {loading && search && <div> <p>searching: {search}. . .</p></div> }
    
    {query && objkts?.length > 0 ? <div><p> {isArtist ? <Link to={`/${search}`}> &nbsp;{search}</Link> : `#${search}`}</p> </div> :
     !loading && query && objkts ? <div> nada. . .<p /> </div> : null} 
       <Masonry
         breakpointCols={breakpointColumns}
         className='grid'
         columnClassName='column'>
       {query && objkts?.length > 0 && objkts.map(p=> (
            <Link className='center' key={p.artifact_uri+p.token_id} to={`/${p.fa2_address}/${p.token_id}`}>
              {p.mime_type.includes('image') && p.mime_type !== 'image/svg+xml' ?
              <img alt='' className= 'pop' src={`https://ipfs.io/ipfs/${p.display_uri ? p.display_uri?.slice(7) : p.artifact_uri.slice(7)}`}/> 
                : p.mime_type.includes('video') ?
                <ReactPlayer className='pop' url={p.artifact_uri?.slice(7)} width='100%' height='100%' muted={true} playing={true} loop={true}/>
                : p.mime_type.includes('audio') ?  
                <div className= 'pop'>
                  <img className= 'pop' alt='' src={'https://ipfs.io/ipfs/' + p.display_uri.slice(7)} />
                  <audio style={{width:'93%'}} src={'https://ipfs.io/ipfs/' + p.artifact_uri.slice(7)} controls />
                </div>
                : p.mime_type.includes('text') ? <div className='text'>{p.description}</div> : ''}
            </Link>
          ))}
       </Masonry>
        </div>
        <div style={{justifyContent: 'center', margin: '18px', flexDirection: 'row'}}>
          {pageIndex >= 1 && !loading && <button onClick={() => {setPageIndex(pageIndex - 1); setOffset(offset-108)}}>Previous  &nbsp;- </button>}
          {query && objkts?.length > 100 && !loading && <button onClick={() => {setPageIndex(pageIndex + 1); setOffset(offset+108)}}>Next</button>}  
          {query && objkts?.length > 100 && !loading && <p/>}
        </div>
       </>
    );
  }
  