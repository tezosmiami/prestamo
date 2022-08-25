import React, { useState } from 'react'
import { Main } from '../components/main';
import { Search } from '../components/search';
import { useSearchParams } from 'react-router-dom';
import { Markets } from '../components/markets';
// import ToggleSwitch from '../components/toggle';

export const Home = () => {
  // const [toggled, setToggled ] = useState(false);
  const [searchData,setSearchData] = useState([]);
  const [searchParams] = useSearchParams();


// if(!app.address) return <div><p>sync to begin</p><p/></div> 
    return (
      <>
       
      {!searchParams.get('search') ? <Markets/> : null}

      </>
    );
  }
  
