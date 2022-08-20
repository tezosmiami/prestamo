import { useEffect, useState, createContext, useContext} from "react";
import { TezosToolkit } from "@taquito/taquito";
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
  preferredNetwork: 'mainnet'
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
  const [tezos, setTezos] = useState(new TezosToolkit("https://mainnet.ecadinfra.com"));
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
        type: 'mainnet',
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

  async function collect({swap_id, price, contract, platform}) {
    console.log(swap_id, platform)
    try {
      const interact = await tezos.wallet.at(contract)
        const op = platform === 'VERSUM' ? await interact.methods['collect_swap'](1,swap_id)
                  : platform === 'HEN' || 'TYPED' ? await interact.methods['collect'](swap_id)
                  : platform === '8BIDOU'? await interact.methods['buy'](swap_id, 1, price) 
                  : platform === 'OBJKT'? await interact.methods['fulfill_ask'](swap_id)
                  : ''

        if(op) {await op.send({
          amount: price,
          mutez: true,
          storageLimit: 310
      }) 
      // await op.confirmation(2)}
    }

    } catch(e) {
        console.log('Error:', e);
        return false;
    }
    return true;
};

async function proposal({objkts}) {
  const contract = await tezos.wallet.at('kt1..');
  const batch = tezos.wallet.batch() // or Tezos.contract.batch()
  .withContractCall(contract.methods.interact('tezos'))
  const batchOp = await batch.send();
  console.log('Operation hash:', batchOp.hash);
await batchOp.confirmation();
    // try {
      // const interact = await tezos.wallet.at(contract)
      //   const op = platform === 'VERSUM' ? await interact.methods['collect_swap'](1,swap_id)
      //             : platform === 'HEN' || 'TYPED' ? await interact.methods['collect'](swap_id)
      //             : platform === '8BIDOU'? await interact.methods['buy'](swap_id, 1, price) 
      //             : platform === 'OBJKT'? await interact.methods['fulfill_ask'](swap_id)
      //             : ''

      //   if(op) {await op.send({
      //     amount: price,
      //     mutez: true,
      //     storageLimit: 310
      // }) 
      // await op.confirmation(2)}
    // }

    // } catch(e) {
    //     console.log('Error:', e);
    //     return false;
    // }
    return true;
};
  const wrapped = { ...app, tezos, proposal, collect, logIn, logOut, activeAccount, address, alias};

  return (
   
    <TezosContext.Provider value={wrapped}>
           {children}
    </TezosContext.Provider>
  
  );
};

export default TezosContextProvider;