const axios = require('axios')

export const getMetadata = async(contract, id) => {
    const hex2a = (hex) => {
        var str = '';
        for (var i = 0; i < hex.length; i += 2)
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        return str;
      }        
    let result = await axios.get(`https://api.jakartanet.tzkt.io/v1/contracts/${contract}/bigmaps/token_metadata/keys/${id}`)
    let bytes=result.data.value.token_info['']
        bytes=hex2a(bytes)
        let data =  await axios.get(bytes.replace('ipfs://', 'https://ipfs.io/ipfs/'))
        let metadata = await data.data
        return metadata
}

export const setMetadata = async({values, file}) => {
    const { create } = await import('ipfs-http-client')
    const auth =
    'Basic ' + Buffer.from(process.env.REACT_APP_INFURA_ID + ':' + process.env.REACT_APP_INFURA_KEY).toString('base64');

    // const infuraUrl = 'ipfs.infura.io:5001'
    //const apiKey = process.env.REACT_APP_IPFS_KEY
    //const storage = new NFTStorage({ token: apiKey })

    const ipfs = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth,
    },
    });
    
    const addToIpfs = async(file) => {
        const hash = await ipfs.add(file);
        return `ipfs://${hash.path}`;
        };
        
    
    // let reader = new window.FileReader();
    // reader.readAsArrayBuffer(file);
    // reader.onloadend = async () =>{ 

    const artifactUri = await addToIpfs(file.buffer);
    const displayUri = await addToIpfs(file.buffer);

    console.log(artifactUri);
    console.log(displayUri);
    
    const metadata = Buffer.from(
        JSON.stringify({
            name: values.title, 
            description: values.description,
            tags: values.tags.replace(/\s/g, '').split(','),
            symbol: 'OBJKT',
            artifactUri,
            displayUri,
            creators: [values.address],
            harbergerFee: values.harberger+'%',
            formats: [
                {
                    uri: artifactUri,
                    mimeType: file.type,
                }],
            decimals: 0,
            isBooleanAmount: false,
            shouldPreferSymbol: false
        },null,2)
    );
    console.log(metadata.toString());
    const md = await addToIpfs(metadata);
    console.log(md)
    return md
    
}



