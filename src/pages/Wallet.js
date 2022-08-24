import React from 'react'
import { Create } from '../components/create';

export const Wallet = () => {
  // const [toggled, setToggled ] = useState(false);
    return (
      <>
      {/* <a style={{marginLeft:'21px'}}>{!toggled ? 'Sales' : 'Mints'}</a> */}
      {/* <ToggleSwitch
        isToggled={toggled}
        handleToggle={() => setToggled(!toggled)}/>
       {!toggled ? <LatestSales /> : <LatestMints/>} */}
       <Create/>
      </>
    );
  }
  
