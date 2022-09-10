import React, { useState, useRef, useEffect} from 'react';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useTezosContext } from '../context/tezos-context'
import { setMetadata }  from '../utils/ipfs'
import Dropzone from 'react-dropzone'
import * as yup from 'yup'

const min_mint = 1;
const max_mint = 10000;
const max_fee = 100;
const min_royalties = 1
const max_royalties = 25

const mintPayload=''
const validationSchema = yup.object().shape({
    title: yup.string().required(),
    description: yup.string().required(),
    tags: yup.string().required(),
    editions: yup.number().required()
    .min(min_mint)
    .max(max_mint),
    royalties: yup.number().required()
    .min(min_royalties)
    .max(max_royalties)
});

const bytesToMb = bytes => bytes / 1_000_000;




export const Mint = () => {
    const [mintPayload, setMintPayload] = useState();
    const [isMinting, setIsMinting] = useState(false);
    const [isForm, setIsForm] = useState(true);
    const [file, setFile] = useState(null);
    const [isPreview, setIsPreview] = useState(false)
    const [preview, setPreview] = useState(null)
    const [loaded, setLoaded] = useState(false)
    const [message, setMessage] = useState('')
    const app = useTezosContext()
    const scrollRef = useRef()

    const handleDrop = (file) => {
        if (!file[0]?.type) return
        setPreview(URL.createObjectURL(file[0]))
        let reader = new window.FileReader();
        reader.readAsArrayBuffer(file[0]);
        reader.onloadend = async()=>{
        file[0].buffer=reader.result
     }
        setFile(file[0])
        setLoaded(true)
    }

    useEffect(() => {
        scrollRef.current && loaded && 
        setTimeout(() => {
            scrollRef.current.scrollIntoView(({behavior: 'smooth'}));
            console.log( scrollRef.current)
        }, 800)
        
        
      }, [loaded, scrollRef]);

    const initialValues = {
        title: mintPayload?.title || '',
        description: mintPayload?.description || '',
        tags: mintPayload?.tags || '',
        editions: mintPayload?.editions || '',
        royalties: mintPayload?.royalties || ''

    };
    const handleMint = async () => {
        setIsMinting(true)
        setMessage('Ipfs. . .')
        const metadataUri = await setMetadata({values: mintPayload , file: file, setMessage})
        console.log(metadataUri)
        setMessage('Minting. . .');
        const isSuccessful = await app.mint(metadataUri, mintPayload.editions, mintPayload.royalties);
        setMessage(isSuccessful ? 'Completed' : 'Failed to mint');
        setIsMinting(false)
        setTimeout(() => {
            setMessage(null);
        }, 1500)
    };





            // let isMinted = ''
            // !app.address && setMessage('please sync. . .') 
            //   if(app.address) try {
            //       setMessage('ready wallet. . .');
            //       isMinted = await app.mint(mintPayload)
            //       setMessage(isMade ? 'Congratulations - Market Made!' : 'transaction issues - try again. . .');
                
            //   } catch(e) {
            //       setMessage('errors. . .');
            //       console.log('Error: ', e);
            //   }
            //   setTimeout(() => {
            //       setMessage(null)
            //   }, 3200)
            //   setMarketPayload({fa2s,values})
            //   isMade && navigate('/')
            // }
            
           
       
    const handleSubmit = (values) => { 
        setIsMinting(false)
        values.address=app.address
        setMintPayload(values);
        setIsPreview(true)
        // const element = document.getElementById("formik");
       
       
        // setIsForm(false);
        // console.log(values)
    };
   
    
    if(!app.address) return(<p>please sync to mint</p>)

    return (
        <div >
            <Dropzone multiple={false}  
            // accept={
            //        'image/png, image/gif, image/jpeg, video/mp4'
            //      } 
                onDrop={file => handleDrop(file)}>
                {({getRootProps, getInputProps}) => (
               
                    <div {...getRootProps()}>
                       
                        { !loaded ? (<input {...getInputProps()} />,
                        <div className='view'> 
                        <p>drag 'n' drop file here - or click to select</p>
                        <p>[jpeg, png, gif, mp4]</p></div>) 
    
                        : file.type.includes('image') ? <img className='view' src={preview} />
                        : file.type.includes('video') ? <video className='view' src={preview}  controls autoPlay/>
                        : null}
                   
                    </div>
                  
                 
                )}
            </Dropzone><p/>
           
            {loaded && !isPreview && <Formik
                onSubmit={handleSubmit}
                initialValues={initialValues}
                validationSchema={validationSchema}
            >
                {(formik) =>
                    <Form className='form' >
                        <div className='formField'>
                            <label
                                className='label'
                                htmlFor={'title'}
                                ref={scrollRef}
                                id='formik'
                            >Title  </label>
                              <span style={{marginLeft:'80px'}}>:&nbsp; </span>
                            <Field
                                className='fields'
                                id="title"
                                name="title"
                                type="text"
                                autoFocus={true}
                            />
                            <ErrorMessage
                                component="span"
                                className='errorMessage'
                                name="title"
                            />
                        </div>
                        <div className='formField' >
                            <label
                                className='label'
                                htmlFor={'description'}
                            >Description  </label>
                              <span style={{marginLeft:'15px'}}>:&nbsp; </span>
                            <Field
                                className='fields'
                                id="description"
                                name="description"
                                component="textarea"
                            />
                            <ErrorMessage
                                component="span"
                                className='errorMessage'
                                name="description"
                            />
                        </div>
                        <div className='formField'>
                            <label
                                className='label'
                                htmlFor={'tags'}
                            >Tags    </label>
                              <span style={{marginLeft:'90px'}}>:&nbsp; </span>
                            <Field
                                className='fields'
                                id="tags"
                                name="tags"
                                type="text"
                                placeholder="tags (comma separated)"
                            />
                            <ErrorMessage
                                component="span"
                                className='errorMessage'
                                name="tags"
                            />
                        </div>
                        <div className='formField'>
                            <label
                                className='label'
                                htmlFor={'editions'}
                            >Editions </label>
                              <span style={{marginLeft:'47px'}}>:&nbsp; </span>
                            <Field
                                className='fields'
                                id="editions"
                                name="editions"
                                type="number"
                                placeholder="# of editions to mint"
                            />
                            <ErrorMessage
                                component="span"
                                className='errorMessage'
                                name="editions"
                            />
                        </div>
                        <div className='formField'>
                            <label
                                className='label'
                                htmlFor={'editions'}
                            >Royalties</label>
                              <span style={{marginLeft:'36px'}}>:&nbsp; </span>
                            <Field
                                className='fields'
                                id="royalties"
                                name="royalties"
                                type="number"
                                placeholder="% of sale for royalties"
                            />
                            <ErrorMessage
                                component="span"
                                className='errorMessage'
                                name="royalties"
                            />
                        </div>
                       
                       
            
                                         <p/>
                        <div>
                        <button
                            // className='formButton'
                            type="submit"
                        >Preview
                        </button>
                        <p/>
                        </div>
                    </Form>
                    
                }
            </Formik>
           }
           {isPreview && <div>
            <div style= {{borderBottom: '3px dashed', width: '60%', marginTop: '1px', marginBottom: '18px'}} />
            <ul>
                <li> Title: {mintPayload.title}</li>
                <li >Decription: {mintPayload.description}</li>
                <li>Tags: {mintPayload.tags} </li>
                <li>Editions: {mintPayload.editions} </li>
                <li>Royalties: {mintPayload.royalties} </li>
                <li>Created by: {`${app.alias || app.address.substr(0, 4) + ". . ." + app.address.substr(-4)}`}</li>
                <p/>
            </ul>

            {/* <p>ꜩ</p>
            <p>Prestamo</p> */}
         
            <div style= {{borderBottom: '3px dashed', width: '60%', marginTop: '1px', marginBottom: '18px'}} />
            <p/>
          <button onClick={()=> handleMint()}>[ ::  Mint  :: ]<p/></button> <button style={{fontSize: '27px'}} onClick={() => setIsPreview(false)}>{`<`}<p/></button>
           
            {message}
            <p/>
          </div>
        }
        </div >
    );
};

