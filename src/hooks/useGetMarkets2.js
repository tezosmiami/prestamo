import { useState, useEffect } from "react";
import axios from "axios";
export const useGetMarkets = () => {
  const [markets, setMarkets] = useState({}); // initialize here
  function hex2a(hex) {
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}   

  useEffect(() => {
  
    const getMarket = async () => {
      let bytes=''
      let metadata=''
     let _market=[]
    let result= await axios.get('https://api.jakartanet.tzkt.io/v1/bigmaps/98299/keys') ;

      result.data.map(async p=> (
        console.log(p),
        p.value.tokens.map(async (q,i)=> (
            metadata = await axios.get(`https://api.jakartanet.tzkt.io/v1/contracts/${q.contract_address}/bigmaps/token_metadata/keys/${q.token_id}`),
            bytes=metadata.data.value.token_info[''],
            bytes=hex2a(bytes),
            metadata = await axios.get(bytes.replace('ipfs://', 'https://ipfs.io/ipfs/')),
            metadata = metadata.data,
            // q = {...q, 'metadata': metadata},
            p.value.tokens[i].metadata=metadata
        
            )),
            console.log(p),
          _market.push(p.value)
         
       
      ))
      console.log(_market)
     setMarkets(_market);
       
  }
    getMarket();
  }, [])
  return markets;
};

