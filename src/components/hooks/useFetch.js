import { useState, useEffect } from "react";
import axios from "axios";


const useFetch = (url) => {
    const [data,setData] = useState()
    
  useEffect(() => {
  
    let result= axios.get('https://api.jakartanet.tzkt.io/v1/bigmaps/98299/keys') 
    setData(result)  
  }, [])

  return data;
}
export default useFetch;