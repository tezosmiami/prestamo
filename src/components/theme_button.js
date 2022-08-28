import {  useEffect } from 'react';

export const ThemeButton = ({darkMode, setDarkMode}) => {
 

  useEffect(() => {
      const localMode = window.localStorage.getItem('darkMode');
      if(localMode) {document.documentElement.classList.add('darkMode');
      setDarkMode(true);
     }
  }, [setDarkMode])
 
  function handleThemeToggle() {
      if(!darkMode) {
          document.body.classList.add('darkMode');
          document.documentElement.classList.add('darkMode')
          window?.localStorage.setItem('darkMode', true);
      } else {
          document.body.classList.remove('darkMode');
          document.documentElement.classList.remove('darkMode')
          window?.localStorage.setItem('darkMode', false);
      }
      setDarkMode(!darkMode);
  }
  return(

        <p>
            <button
                onClick={handleThemeToggle}
                id={'themeButton'}
                title={'Toggle Light mode'}
                className={'icon'}
                fontSize={'188px'}
            >ꜩ</button>
        </p>

  )
}
