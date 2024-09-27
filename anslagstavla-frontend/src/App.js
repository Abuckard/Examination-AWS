import React, { useState } from 'react';
import './App.css';
import MessageList from './MessageList';
import CreateMessage from './CreateMessage';


function App() {
  const [refresh, setRefresh] = useState(false);

  const handleMessageCreated = () => {
    setRefresh(!refresh); // Uppdaterar meddelandelistan
  };

  return (
    <div className="App-container">
      <h1 className="App-title">Bulletinboard</h1>
      <CreateMessage onMessageCreated={handleMessageCreated} />
      <MessageList key={refresh} />
    </div>
  );
}

export default App;
