import React from 'react'
import { Profile } from '../components/profile';

export const Gallery = ({banned}) => {
  // const [toggled, setToggled ] = useState(false);
    return (
      <>
      {/* <a style={{marginLeft:'21px'}}>{!toggled ? 'Sales' : 'Mints'}</a> */}
      {/* <ToggleSwitch
        isToggled={toggled}
        handleToggle={() => setToggled(!toggled)}/>
       {!toggled ? <LatestSales /> : <LatestMints/>} */}
       <Profile banned={banned}/>
      </>
    );
  }
  
