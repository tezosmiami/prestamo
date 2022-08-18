import React, { useState } from 'react'
import { Main } from '../components/main';
import { Search } from '../components/search';
import { useSearchParams } from 'react-router-dom';
// import ToggleSwitch from '../components/toggle';

export const Home = ({banned}) => {
  // const [toggled, setToggled ] = useState(false);
  const [searchData,setSearchData] = useState([]);
  const [searchParams] = useSearchParams();


 
    return (
      <>
      {/* <a style={{marginLeft:'21px'}}>{!toggled ? 'Sales' : 'Mints'}</a> */}
      {/* <ToggleSwitch
        isToggled={toggled}
        handleToggle={() => setToggled(!toggled)}/>
       {!toggled ? <LatestSales /> : <LatestMints/>} */}
      <Search returnSearch={setSearchData} query={searchParams.get('search')} banned={banned}/>

      {!searchParams.get('search') ? <Main banned={banned}/> : null}

      </>
    );
  }
  
