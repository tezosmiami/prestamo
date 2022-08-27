import React, { useState, useEffect } from 'react'
import ReactPlayer from 'react-player'
import { useParams, useNavigate } from 'react-router-dom';
import { Objkt } from './objkt'
import Masonry from 'react-masonry-css'
import { useTezosContext } from "../context/tezos-context";
import { ErrorMessage, Field, Form, Formik } from 'formik';
import * as yup from 'yup';

const axios = require('axios')

const min_term = 1;
const max_term = 365;
const min_amount = 1.1;
const max_amount = 1000000;
const min_interest = 1;
const max_interest = 50;

const validationSchema = yup.object().shape({
  
  loan_term: yup.number()
      .min(min_term)
      .max(max_term),
  loan_amount: yup.number()
    .min(min_amount)
    .max(max_amount),
  interest: yup.number()
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

export const Make = () => {
  const [objktView, setObjktView] = useState(false)
  const [objkt, setObjkt] = useState({});
  const [view, setView] = useState(0)
  const [choices, setChoices] = useState([])
  const [count, setCount] = useState(0)
  const [marketPayload, setMarketPayload] = useState({})
  const [objkts, setObjkts] = useState()
  const [submit, setSubmit] = useState(false)
  const [message, setMessage] = useState('')
  const  app = useTezosContext();
  const navigate = useNavigate();
  const account = app.address

  useEffect(() => {
    let bytes=''
    const getObjkts = async () => {
      if(account) {
      let result = await axios.get(`https://api.jakartanet.tzkt.io/v1/tokens/balances?account=${app.address}&balance.gt=0`)
     setObjkts(result.data)}
  }
    getObjkts();
  }, [account])


 
  
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


  const initialValues = {
    loan_term: marketPayload?.term || '',
    loan_amount: marketPayload?.loan_amount || '',
    interest: marketPayload?.interest || ''
  };
const handleSubmit = async (values) => {
    const fa2s = []
    let isMade =''
    choices.map(p => (
             fa2s.push({
              'contract_address': p.contract.address, 
              'token_id': p.tokenId,
              'token_amount': parseFloat(1)
            })))
     !app.address && setMessage('please sync. . .') 
      if(app.address) try {
          setMessage('ready wallet. . .');
          isMade = await  app.make_market(fa2s, values)
          setMessage(isMade ? 'Congratulations - Market Made!' : 'transaction issues - try again. . .');
        
      } catch(e) {
          setMessage('errors. . .');
          console.log('Error: ', e);
      }
      setTimeout(() => {
          setMessage(null)
      }, 3200)

      isMade && navigate('/')
    }
    
   


  const showObjkt = (o) => {
    if (objktView) return (setObjktView(false))
    setObjkt(o)
    setObjktView(true)
  }

  return (
      <>
       <div style={{marginTop:'11px'}}>
       <div>
        {objkts && objkts.length == 0 ? 'no objkts in this Wallet'
          : 'select objkts for collateral'}
       </div>
       </div>
      
       <div style= {{borderBottom: '3px dashed', width: '88%', marginBottom: '1px', marginTop: '27px'}} />
          <div style= {{borderBottom: '3px dashed', width: '88%', marginBottom: '18px'}} />
  
       {count > 0 && <button onClick= {() => setSubmit(!submit)}><p>{!submit ? 'next >' : '< back'}</p></button>}
       <div className='container' >
       <Masonry
        breakpointCols={breakpointColumns}
        className={view===1 ? '' : 'grid'}
         columnClassName='column'>
        {objkts && !submit && objkts.map((p,i)=> (
        p.token.metadata && (
        <div style ={{backgroundColor: choices.includes(p.token) && getComputedStyle(document.body).getPropertyValue('--text')}} key={i} onClick={() => {return add_remove(p.token)}}>
        {p.token.metadata.formats[0].mimeType.includes('image') && p.token.metadata.formats[0].mimeType !== 'image/svg+xml' ?
      
        <img alt='' className= 'pop'  src={`https://ipfs.io/ipfs/${p.token.metadata.displayUri ? p.token.metadata.displayUri?.slice(7) : p.token.metadata.artifactUri?.slice(7)}`}/> 
        : p.token.metadata.formats[0].mimeType.includes('video') ? 
         <div className='pop'>
           <ReactPlayer url={'https://ipfs.io/ipfs/' + p.token.metadata.artifactUri.slice(7)} width='100%' height='100%' muted={true} playing={false} loop={false}/>
          </div>
          : p.token.metadata.formats[0].mimeType.includes('audio') ?  
          <div className= 'pop'>
            <img className= 'pop' alt='' src={'https://ipfs.io/ipfs/' + p.token.metadata.displayUri.slice(7)} />
            <audio style={{width:'93%'}} src={'https://ipfs.io/ipfs/' + p.token.metadata.artifactUri.slice(7)} controls />
          </div>
        : p.token.metadata.formats[0].mimeType.includes('text') ? <div className='text'>{p.token.metadata.description}</div> : ''}
        
        </div>
          )))} 

          </Masonry>
          </div>
          {objktView && <Objkt objkt={objkt} setObjktView={setObjktView}/>}
    <div className='container' style={{opacity: objktView && '.2'}}>
       <Masonry
        breakpointCols={breakpointColumns}
        className={view===1 ? '' : 'grid'}
         columnClassName='column'>
      
        {objkts && submit && choices.map((p,i)=> (

        // <Link  key={p.metadata.artifactUri+ p.token_id} to={`/${p.fa2_address}/${p.token_id}`}>
        <div  key={i} onClick= {() => {showObjkt(p)}}>
        {p.metadata.formats[0].mimeType.includes('image') && p.metadata.formats[0].mimeType !== 'image/svg+xml' ?
      
        <img alt='' className= 'pop'  src={`https://ipfs.io/ipfs/${p.metadata.displayUri ? p.metadata.displayUri?.slice(7) : p.metadata.artifactUri.slice(7)}`}/> 
        : p.metadata.formats[0].mimeType.includes('video') ? 
         <div className='pop'>
           <ReactPlayer url={'https://ipfs.io/ipfs/' + p.metadata.artifactUri.slice(7)} width='100%' height='100%' muted={true} playing={false} loop={false}/>
          </div>
          : p.metadata.formats[0].mimeType.includes('audio') ?  
          <div className= 'pop'>
            <img className= 'pop' alt='' src={'https://ipfs.io/ipfs/' + p.metadata.displayUri.slice(7)} />
            <audio style={{width:'93%'}} src={'https://ipfs.io/ipfs/' + p.metadata.artifactUri.slice(7)} controls />
          </div>
        : p.metadata.formats[0].mimeType.includes('text') ? <div className='text'>{p.metadata.description}</div> : ''}
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
                            >Loan Amount :&nbsp;
                            </label>
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
                            />&nbsp;ꜩ
                        </div>
                    
              
                <div className='formField'>
                            <label
                                className='label'
                                htmlFor='term'
                                name="loan_term"
                            >Loan Term     
                            </label> 
                            <a style={{marginLeft:'33px'}}>:&nbsp; </a>
                            <Field
                                className='formInput'
                                // style={{marginLeft:'22px'}}
                                id="loan_term"
                                name="loan_term"
                                type="number"
                                placeholder='minutes'
                            /> &nbsp;minutes
                            <ErrorMessage
                                component="span"
                                className='errorMessage'
                                name="loan_term"
                            />
                            <p/>  
                        </div>
                        <div className='formField'>
                            <label
                                className='label'
                                htmlFor='interest'
                                name="loan_term"
                            >Interest 
                            </label>
                            <a style={{marginLeft:'44px'}}>:&nbsp; </a>
                            <Field
                                className='formInput'
                                id="interest"
                                name="interest"
                                type="number"
                                placeholder='%'
                            />&nbsp;%<p/>
                            <ErrorMessage
                                component="span"
                                className='errorMessage'
                                name="interest"
                            />
                            <p/>  
                        </div>

         
                        <div style= {{borderBottom: '3px dashed', width: '100%', marginBottom: '1px', marginTop: '27px'}} />
                       <div style= {{borderBottom: '3px dashed', width: '100%', marginBottom: '18px'}} />
                  <p/>
                      <button
                      className='formButton'
                      style={{marginLeft:'108px'}}
                      type="submit"
                      >Submit
                        </button> 
                    
                  </Form>

                  
            }    
            </Formik>}
        
        <p>{message}</p> 
        <div><p/><p/></div>
     
     
   
       {/* {count > 0 && <button onClick= {() => setSubmit(!submit)}><p>{!submit ? 'next' : 'go back'}</p></button>} */}
      
       {/* <div>
          {pageIndex >= 1 && <button onClick={() => {setPageIndex(pageIndex - 1); setlOffset(offset-99); setOffsetNew(offsetNew-27); mutate('/api/objkts')}}>Previous  &nbsp;- </button>}
          <button onClick={() => {setPageIndex(pageIndex + 1); setOffset(offset+99); setOffsetNew(offsetNew+27); mutate('/api/objkts')}}>Next</button>   
       </div> */}
  </>
    );
  }
  
