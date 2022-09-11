import React from 'react'
import { Borrow } from '../components/borrow';

export const Market = () => {
  // const [toggled, setToggled ] = useState(false);
    return (
      <>
      {/* <a style={{marginLeft:'21px'}}>{!toggled ? 'Sales' : 'Mints'}</a> */}
      {/* <ToggleSwitch
        isToggled={toggled}
        handleToggle={() => setToggled(!toggled)}/>
       {!toggled ? <LatestSales /> : <LatestMints/>} */}
       <Borrow/>
      </>
    );
  }
  
