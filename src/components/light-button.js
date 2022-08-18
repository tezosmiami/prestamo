import { useState, useEffect } from 'react';

export const LightButton = () => {
  const [lightMode, setLightMode] = useState(false);

  useEffect(() => {
      const localLight = window.localStorage.getItem('lightMode');
      if(localLight === 'true') {document.documentElement.classList.add('lightMode');
      setLightMode(true);
     }
  }, [])
 
  function handleLightToggle() {
      if(!lightMode) {
          document.body.classList.add('lightMode');
          document.documentElement.classList.add('lightMode')
          window?.localStorage.setItem('lightMode', "true");
      } else {
          document.body.classList.remove('lightMode');
          document.documentElement.classList.remove('lightMode')
          window?.localStorage.setItem('lightMode', 'false');
      }
      setLightMode(!lightMode);
  }
  return(
  <div>
        <p style={{marginTop:0}}>
            <button
                onClick={handleLightToggle}
                id={'lightButton'}
                title={'Toggle Light mode'}
                className={'icon'}
                fontSize={'188px'}
            >ꜩ</button>
        </p>
 </div>
  )
}
