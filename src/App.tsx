import React from 'react';
import SpreadsheetApp from './components/SpreadsheetApp.tsx';
import './index.css';
import { Toaster } from 'sonner';

const App: React.FC = () => {
  return (
    <div className="App">
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
