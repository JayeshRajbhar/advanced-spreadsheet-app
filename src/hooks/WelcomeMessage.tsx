import { useEffect, useState } from "react";
import "../index.css";

const useWelcomeMessage = (duration = 5000) => {
  const [showMessage, setShowMessage] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowMessage(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  return showMessage;
};

export const WelcomeMessage = () => {
  const showMessage = useWelcomeMessage(5000);
  
  if (!showMessage) return null;
  
  return <div className="welcome-message">
    <span className="text-center inline-block w-full font-bold font-mono text-lg">Welcome to my Spreadsheet app.</span> 
    <br /> <hr /> <br />
    Extra functionalities implemented are: <br />
    1. Keyboard navigation within the grid using arrow keys. <br />
    2. Column hide toggles in the toolbar is fully functional. <br />
    3. Export button downloads the excel sheet. <br />
    4. Toast messages and log to console for every action is implemented. <br />
    5. Filter option in the footer tabs and sort option for every Column header.
    </div>;
};