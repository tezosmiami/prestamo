import React, { useState } from 'react'
import { request, gql } from 'graphql-request'
import useSWR from 'swr';
import ReactPlayer from 'react-player'
import { useParams } from 'react-router-dom';
import Masonry from 'react-masonry-css'
import { ErrorMessage, Field, Form, Formik } from 'formik';
import * as yup from 'yup';
import { subscribe } from 'graphql';
// import { Search } from '../components/search';
// import { useSearchParams } from 'react-router-dom';
const min_term = 1;
const max_term = 365;
const min_amount = 1;
const max_amount = 1000000;
const min_interest = 1;
const max_interest = 50;

const validationSchema = yup.object().shape({
  
  term_days: yup.number()
      .min(min_term)
      .max(max_term),
  loan_amount: yup.number()
    .min(min_amount)
    .max(max_amount),
  loan_interest: yup.number()
    .min(min_interest)
    .max(max_interest),
});

const breakpointColumns = {
  default: 7,
  1580: 7,
  1280: 6,
  980: 5,
  730: 4,
  680: 3,
};

export const getAddressbyAlias = gql`
query alias($param: String!) {
  tzprofiles(where: {alias: {_eq: $param}}) {
      account
      twitter
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
  const [marketPayload, setMarketPayload] = useState({})
  const [submit, setSubmit] = useState(false)
  let { account } = useParams();
  if (!account) {account = app.alias || app.address};

  const { data: alias } = useSWR(account.length !== 36 ? ['/api/alias', getAddressbyAlias, account] : null, fetcher)
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

  if (alias && !address) return <div><p/>nada. . .<p/></div>
  if (error) return <p>error</p>
  if (!data ) return <div><p/>loading. . .<p/></div>  
  if(data.tokens.length === 0) return <div><p/>no nfts in this wallet. . .<p/></div>
  const filtered = data.tokens.filter((i) => !banned.includes(i.artist_address))
  
  const initialValues = {
    loan_term: marketPayload?.term || '',
    loan_amount: marketPayload?.loan_amount || '',
    interest: marketPayload?.interest || ''
  };
const handleSubmit = (values) => {
    setMarketPayload({fa2: choices, terms: values });
    console.log(values)
  };

// const triggerMarket = () => {
//     setIsMinting(true)
//     // handleMint(mintPayload);
// };

console.log(marketPayload)
  return (
      <>
       <div style={{marginTop:'11px'}}>
          select objkts for collateral
       </div>
      
       <div style= {{borderBottom: '3px dashed', width: '88%', marginBottom: '1px', marginTop: '27px'}} />
          <div style= {{borderBottom: '3px dashed', width: '88%', marginBottom: '18px'}} />
      
       {/* <Search returnSearch={setSearchData} query={searchParams.get('search')} banned={banned}/> */}

       {count > 0 && <button onClick= {() => setSubmit(!submit)}><p>{!submit ? 'next' : 'back'}</p></button>}
       <div className='container' >
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
          <p/>
          <div style= {{borderBottom: '3px dashed', width: '88%', marginBottom: '1px'}} />
          <div style= {{borderBottom: '3px dashed', width: '88%', marginBottom: '18px'}} />
          <p/>

          {submit && 
          <Formik
                onSubmit={handleSubmit}
                initialValues={initialValues}
                validationSchema={validationSchema}
            >
          {(formik) =>
            <Form className='form' >
                <div className='formField'>
                            <label
                                className='label'
                                htmlFor='loan_amount'
                                name='loan_amount'
                            >Loan Amount : </label>
                            <Field
                                className='formInput'
                                id="loan_amount"
                                name="loan_amount"
                                type="number"
                                placeholder="ꜩ"
                            />
                            <ErrorMessage
                                component="span"
                                className='errorMessage'
                                name="loan_amount"
                            />
                        </div>
                    
               

                <div className='formField'>
                            <label
                                className='label'
                                htmlFor='term'
                            >Loan Term    :     </label>
                            <Field
                                className='formInput'
                                id="loan_term"
                                name="loan_term"
                                type="number"
                                placeholder='days'
                            />
                            <ErrorMessage
                                component="span"
                                className='errorMessage'
                                name="royalties"
                            />
                            <p/>  
                        </div>
                        <div className='formField'>
                            <label
                                className='label'
                                htmlFor='interest'
                                name='interest'
                            >Interest    :    </label>
                            <Field
                                className='formInput'
                                id="linterest"
                                name="interest"
                                type="number"
                                placeholder="%"
                            />
                            <ErrorMessage
                                component="span"
                                className='errorMessage'
                                name="interest"
                            />
                        </div>
                        <div style= {{borderBottom: '3px dashed', width: '100%', marginBottom: '1px', marginTop: '27px'}} />
          <div style= {{borderBottom: '3px dashed', width: '100%', marginBottom: '18px'}} />
                <p/>
                      <button
                      className='formButton'
                      type="submit"
                      >Submit
                        </button> 
                    
                  </Form>

                  
            }    
            </Formik>}
       
         <div><p/></div>
     
     
   
       {/* {count > 0 && <button onClick= {() => setSubmit(!submit)}><p>{!submit ? 'next' : 'go back'}</p></button>} */}
      
       {/* <div>
          {pageIndex >= 1 && <button onClick={() => {setPageIndex(pageIndex - 1); setlOffset(offset-99); setOffsetNew(offsetNew-27); mutate('/api/objkts')}}>Previous  &nbsp;- </button>}
          <button onClick={() => {setPageIndex(pageIndex + 1); setOffset(offset+99); setOffsetNew(offsetNew+27); mutate('/api/objkts')}}>Next</button>   
       </div> */}
  </>
    );
  }
  
