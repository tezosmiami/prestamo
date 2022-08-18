import React from "react";
import "./toggle.css";

const ToggleSwitch = ({ isToggled, handleToggle }) =>{
  return (
    <label className="toggle-switch">
      <input type="checkbox" checked={isToggled} onChange={handleToggle} />
      <span className="switch" />
    </label>
  );
}
export default ToggleSwitch;