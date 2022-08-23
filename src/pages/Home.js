import React, { useState } from 'react'
import { Main } from '../components/main';
import { Search } from '../components/search';
import { useSearchParams } from 'react-router-dom';
import { Market } from '../components/market';
import { useTezosContext } from "../context/tezos-context";
// import ToggleSwitch from '../components/toggle';

export const Home = ({banned}) => {
  // const [toggled, setToggled ] = useState(false);
  const [searchData,setSearchData] = useState([]);
  const [searchParams] = useSearchParams();
  const  app = useTezosContext();

if(!app.address) return <div><p>sync to begin</p><p/></div> 
    return (
      <>
      {/* <a style={{marginLeft:'21px'}}>{!toggled ? 'Sales' : 'Mints'}</a> */}
      {/* <ToggleSwitch
        isToggled={toggled}
        handleToggle={() => setToggled(!toggled)}/>
       {!toggled ? <LatestSales /> : <LatestMints/>} */}
      {/* <Search returnSearch={setSearchData} query={searchParams.get('search')} banned={banned}/> */}
       
      {!searchParams.get('search') ? <Market banned={banned} app={app}/> : null}

      </>
    );
  }
  
