import { useEffect, useState, createContext, useContext} from "react";
import { TezosToolkit, OpKind } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";

const getAliasbyAddress = `
query Alias($address: String!) {
  tzprofiles(where: {account: {_eq: $address}}) {
    alias
    }
  }
`

async function fetchGraphQL(queryObjkts, name, variables) {
  let result = await fetch(process.env.REACT_APP_TEZTOK_API, {
    method: 'POST',
    body: JSON.stringify({
      query: queryObjkts,
      variables: variables,
      operationName: name,
    }),
  })
  return await result.json()
}

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
  const operator = "KT1KwLzwHwWvCRhU9bXNpkhBPSMUh6vHsnr9"

  useEffect(() => {
     const getLoggedIn = async () => {
        if (await wallet?.client?.getActiveAccount()) { 
          setActiveAccount(await wallet?.client?.getActiveAccount());
          const address =  await wallet.getPKH();
          setAddress(address);
          tezos.setWalletProvider(wallet);
          setTezos(tezos)
          if(address) {
            const { errors, data } = await fetchGraphQL(getAliasbyAddress, 'Alias', { address: address});
           if (errors) {
             console.error(errors);
           }
           console.log(data)
           data?.tzprofiles[0]?.alias && 
           setAlias(data.tzprofiles[0].alias);
          }
      }
    };
      getLoggedIn();
    }, [tezos]);
  
  async function logIn() {
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
    if(address) {
        const { errors, data } = await fetchGraphQL(getAliasbyAddress, 'Alias', { address: address});
     if (errors) {
       console.error(errors);
     }
     if(data?.hic_et_nunc_holder[0]?.name) {
        setAlias(data.hic_et_nunc_holder[0].name);
      }
    }
   
  }

  async function logOut() {
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
  .at(operator)
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
  .then((hash) => console.log(`Operation injected: https://ithaca.tzstats.com/${hash}`))
  .catch((error) => console.log(`Error: ${JSON.stringify(error, null, 2)}`));
}

async function claim_market(id) {
  tezos.wallet
  .at(operator)
  .then((wallet) => {

    return wallet.methods.repo_market(id).send()
  })
  .then((op) => {
    console.log(`Waiting for ${op.opHash} to be confirmed...`);
    return op.confirmation(1).then(() => op.opHash);
  })
  .then((hash) => console.log(`Operation injected: https://ithaca.tzstats.com/${hash}`))
  .catch((error) => console.log(`Error: ${JSON.stringify(error, null, 2)}`));
}

async function make_market(fa2s, values) {
  let transactions = []
  let contract =''

await Promise.all(fa2s.map(async p=>{
  contract = await tezos.wallet.at(p.contract_address)
  return (transactions.push([{"kind": OpKind.TRANSACTION, ...contract.methods.update_operators(
    [{add_operator: {
          operator: operator ,
          token_id: parseFloat(p.token_id), 
          owner: address }}]).toTransferParams({ amount: 0, mutez: true, storageLimit: 150 })
        }]))
      }))


  contract = await tezos.wallet.at(operator)
  transactions.push([{"kind": OpKind.TRANSACTION, ...contract.methods.make_market(
          parseFloat(values.loan_amount*1000000),
          parseFloat(values.interest), 
          parseFloat(values.loan_term),
          fa2s
        ).toTransferParams({amount: 0, mutez: true, storageLimit: 150 })
      }])

await Promise.all(fa2s.map(async p=>{
  contract = await tezos.wallet.at(p.contract_address)
  return (transactions.push([{"kind": OpKind.TRANSACTION, ...contract.methods.update_operators(
    [{remove_operator: {
          operator: operator ,
          token_id: parseFloat(p.token_id), 
          owner: address }}]).toTransferParams({ amount: 0, mutez: true, storageLimit: 150 })
        }]))
      }))

  console.log(transactions)
 
  const batch = await tezos.wallet.batch(transactions)
  const batchOp = await batch.send();
  console.log('Operation hash:', batchOp.hash);
  await batchOp.confirmation();
  return true;
};

  const wrapped = { ...app, tezos, make_market, take_market, claim_market, logIn, logOut, activeAccount, address, alias};

  return (
   
    <TezosContext.Provider value={wrapped}>
           {children}
    </TezosContext.Provider>
  
  );
};

export default TezosContextProvider;