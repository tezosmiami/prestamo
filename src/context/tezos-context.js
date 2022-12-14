import { useEffect, useState, createContext, useContext} from "react";
import { TezosToolkit, OpKind, MichelsonMap } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";

// const getAliasbyAddress = `
// query Alias($address: String!) {
//   tzprofiles(where: {account: {_eq: $address}}) {
//     alias
//     }
//   }
// `

// async function fetchGraphQL(queryObjkts, name, variables) {
//   let result = await fetch(process.env.REACT_APP_TEZTOK_API, {
//     method: 'POST',
//     body: JSON.stringify({
//       query: queryObjkts,
//       variables: variables,
//       operationName: name,
//     }),
//   })
//   return await result.json()
// }

const TezosContext = createContext();
const options = {
  name: 'prestamo.art',
  preferredNetwork: 'jakartanet'
 };
  
const wallet = new BeaconWallet(options);

export const useTezosContext = () => {

  const app = useContext(TezosContext);
  if (!app) {
    throw new Error(
      `!app`
    );
  }
  return app;
};

export const TezosContextProvider = ({ children }) => {
  
  const [app, setApp] = useState("");
  const [address, setAddress] = useState("");
  const [tezos, setTezos] = useState(new TezosToolkit("https://jakartanet.ecadinfra.com"));
  const [activeAccount, setActiveAccount] = useState("");
  const [alias, setAlias] = useState("")
 

  useEffect(() => {
     const getLoggedIn = async () => {
        if (await wallet?.client?.getActiveAccount()) { 
          setActiveAccount(await wallet?.client?.getActiveAccount());
          const address =  await wallet.getPKH();
          setAddress(address);
          tezos.setWalletProvider(wallet);
          setTezos(tezos)
          // if(address) {
          //   const { errors, data } = await fetchGraphQL(getAliasbyAddress, 'Alias', { address: address});
          //  if (errors) {
          //    console.error(errors);
          //  }
          // //  data?.tzprofiles[0]?.alias && 
          // //  setAlias(data.tzprofiles[0].alias);
          // }
      }
    };
      getLoggedIn();
    }, [tezos]);
  
  async function sync() {
    app.currentWallet && await app.currentWallet?.logOut();
    await wallet.client.clearActiveAccount();
    await wallet.client.requestPermissions({
      network: {
        type: 'jakartanet',
      },
    });

    tezos.setWalletProvider(wallet);
    setTezos(tezos)
    let address=await wallet.getPKH()
    setAddress(address);
    setActiveAccount(await wallet?.client?.getActiveAccount());
    setApp(app)
    // if(address) {
    //     const { errors, data } = await fetchGraphQL(getAliasbyAddress, 'Alias', { address: address});
    //  if (errors) {
    //    console.error(errors);
    //  }
    // }
   
  }

  async function unsync() {
    await wallet.client.clearActiveAccount();
    setActiveAccount("")
    setAddress("");
    setAlias("")
    //  window.location.reload();
  }

// async function getBigMap() {
//   const contract = await tezos.wallet.at('KT1HbQepzV1nVGg8QVznG7z4RcHseD5kwqBn');
//   const storage = await contract.storage();
//   console.log(storage)
//   return storage
// }

async function take_market(id, amount) {
  tezos.wallet
  .at(process.env.REACT_APP_PRESTAMO)
  .then((wallet) => {

    return wallet.methods.take_market(id).send({
          amount: parseFloat(amount),
          mutez: true,
          storageLimit: 310
    });
  })
  .then((op) => {
    console.log(`Waiting for ${op.opHash} to be confirmed...`);
    return op.confirmation(1).then(() => op.opHash);
  })
  .then((hash) => console.log(`Operation injected: https://jakarata.tzkt.io/${hash}`))
  .catch((error) => console.log(`Error: ${JSON.stringify(error, null, 2)}`));
}

async function claim_market(id, amount) {
  tezos.wallet
  .at(process.env.REACT_APP_PRESTAMO)
  .then((wallet) => {

    return wallet.methods.claim_market(id).send(amount)
  })
  .then((op) => {
    console.log(`Waiting for ${op.opHash} to be confirmed...`);
    return op.confirmation(1).then(() => op.opHash);
  })
  .then((hash) => console.log(`Operation injected: https://jakarta.tzkt.io/${hash}`))
  .catch((error) => console.log(`Error: ${JSON.stringify(error, null, 2)}`));
}

async function make_market(fa2s, values) {
  let transactions = []
  let contract =''
console.log(app.address, fa2s)
await Promise.all(fa2s.map(async p=>{
  contract = await tezos.wallet.at(p.contract_address)
  return (transactions.push({"kind": OpKind.TRANSACTION, ...contract.methods.update_operators(
    [{add_operator: {
          operator: process.env.REACT_APP_PRESTAMO ,
          token_id: parseFloat(p.token_id), 
          owner: address }}]).toTransferParams({ amount: 0, mutez: true, storageLimit: 180 })
        }))
      }))


  contract = await tezos.wallet.at(process.env.REACT_APP_PRESTAMO)
  transactions.push({"kind": OpKind.TRANSACTION, ...contract.methods.make_market(
          parseFloat(values.loan_amount*1000000),
          parseFloat(values.interest*10), 
          parseFloat(values.loan_term),
          fa2s
        ).toTransferParams({amount: 0, mutez: true, storageLimit: 360 })
      })

await Promise.all(fa2s.map(async p=>{
  contract = await tezos.wallet.at(p.contract_address)
  return (transactions.push({"kind": OpKind.TRANSACTION, ...contract.methods.update_operators(
    [{remove_operator: {
          operator: process.env.REACT_APP_PRESTAMO ,
          token_id: parseFloat(p.token_id), 
          owner: address }}]).toTransferParams({ amount: 0, mutez: true, storageLimit: 180 })
        }))
      }))
 
  const batch = await tezos.wallet.batch(transactions)
  const batchOp = await batch.send();
  console.log('Operation hash:', batchOp.hash);
  await batchOp.confirmation();
  return true;
};

async function recover_market(id, amount) {
  console.log(id)
    console.log(amount)
  tezos.wallet
  .at(process.env.REACT_APP_PRESTAMO)
  .then((wallet) => {
    return wallet.methods.recover_market(id).send({
      amount: parseFloat(amount),
      mutez: true,
      storageLimit: 310
})
  })
  .then((op) => {
    console.log(`Waiting for ${op.opHash} to be confirmed...`);
    return op.confirmation(1).then(() => op.opHash);
  })
  .then((hash) => console.log(`Operation injected: https://jakarta.tzkt.io/${hash}`))
  .catch((error) => console.log(`Error: ${JSON.stringify(error, null, 2)}`));
}

async function cancel_market(id) {
  tezos.wallet
  .at(process.env.REACT_APP_PRESTAMO)
  .then((wallet) => {
    return wallet.methods.cancel_market(id).send()
  })
  .then((op) => {
    console.log(`Waiting for ${op.opHash} to be confirmed...`);
    return op.confirmation(1).then(() => op.opHash);
  })
  .then((hash) => console.log(`Operation injected: https://jakarta.tzkt.io/${hash}`))
  .catch((error) => console.log(`Error: ${JSON.stringify(error, null, 2)}`));
}

const mint = async(metadata, editions, royalties ) => {
   
  const token_metadata = new MichelsonMap()
  token_metadata.set(
   '',
   metadata.split('')
     .reduce(
         (hex, c) =>
             (hex += c.charCodeAt(0)
                 .toString(16)
                 .padStart(2, '0')),
         ''
     )
   );
  console.log(token_metadata)
   try {
       const contract = await tezos.wallet
           .at(process.env.REACT_APP_PRESTAMO_MINT);
       const operation = await contract.methods.mint(
          process.env.REACT_APP_PRESTAMO_FA2, 
          editions,
          token_metadata,
          parseFloat(royalties) * 10
       ).send({amount: 0, storageLimit: 310});
       await operation.confirmation(1);
       console.log('Minted');
       console.log('Operation hash:', operation.hash);
   } catch(e) {
       console.log('Error:', e);
       return false;
   }
   return true;
};
  const wrapped = { ...app, tezos, mint, make_market, take_market, claim_market, recover_market, cancel_market, sync, unsync, activeAccount, address, alias};

  return (
   
    <TezosContext.Provider value={wrapped}>
           {children}
    </TezosContext.Provider>
  
  );
};

export default TezosContextProvider;