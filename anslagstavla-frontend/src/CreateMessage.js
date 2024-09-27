import React, { useState } from 'react';

function CreateMessage({ onMessageCreated }) {
  const [username, setUsername] = useState('');
  const [text, setText] = useState('');

  const postMessage = async () => {
    const response = await fetch('https://9unjzmuoj7.execute-api.eu-north-1.amazonaws.com/dev/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, text })
    });
    if (response.ok) {
      setUsername('');
      setText('');
      onMessageCreated(); 
    }
  };

  
  const isButtonDisabled = !username || !text;

  return (
    <div className="create-message-container">
      <h2 className="create-message-title">Create New Message</h2>
      <input className='username-input'
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <textarea
        className='message-input'
        placeholder="Message"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button 
        className='post-message-button' 
        onClick={postMessage} 
        disabled={isButtonDisabled} 
      >
        Post Message
      </button>
    </div>
  );
}

export default CreateMessage;
