import React from 'react';
import SpreadsheetApp from './components/SpreadsheetApp.tsx';
import './index.css';
import { Toaster } from 'sonner';
import { WelcomeMessage } from './hooks/WelcomeMessage.tsx';

const App: React.FC = () => {
  return (
    <div className="App">
      <WelcomeMessage />
      <SpreadsheetApp />
      <Toaster 
        position="bottom-right"
        richColors
        closeButton
      />
    </div>
  );
};

export default App;
