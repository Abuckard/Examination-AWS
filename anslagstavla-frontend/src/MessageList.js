import React, { useEffect, useState, useRef } from 'react';
import './App.css';

function MessageList() {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]); // Håller filtrerade meddelanden
  const [selectedMessage, setSelectedMessage] = useState(null); // Håller reda på det valda meddelandet
  const [updatedText, setUpdatedText] = useState(''); // Håller reda på den uppdaterade texten
  const [searchUsername, setSearchUsername] = useState(''); // Användarnamn för sökning
  const formRef = useRef(null); // Skapa en referens för formuläret

  useEffect(() => {
    fetch('https://9unjzmuoj7.execute-api.eu-north-1.amazonaws.com/dev/messages')
      .then(response => response.json())
      .then(data => {
        setMessages(data);
        setFilteredMessages(data); // Visa alla meddelanden från början
      })
      .catch(error => console.error('Error fetching messages:', error));
  }, []);

  // Hantera förändringar i sökfältet
  const handleSearchChange = (e) => {
    setSearchUsername(e.target.value);
  };

  // Utför sökning när sökknappen klickas
  const handleSearchClick = () => {
    if (searchUsername.trim()) {
      const filtered = messages.filter((msg) => 
        msg.username.toLowerCase().includes(searchUsername.toLowerCase()) // Jämför användarnamn
      );
      setFilteredMessages(filtered);
    } else {
      setFilteredMessages(messages); // Visa alla meddelanden om sökfältet är tomt
    }
  };

  // Välj ett meddelande och fyll i formuläret
  const handleSelectMessage = (message) => {
    setSelectedMessage(message);
    setUpdatedText(message.text); // Fyll formuläret med det valda meddelandets text
  };

  // Scrolla till formuläret när ett meddelande väljs
  useEffect(() => {
    if (selectedMessage && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedMessage]); 

  // Uppdatera meddelandet
  const updateMessage = async () => {
    if (!selectedMessage) return;
    const response = await fetch(`https://9unjzmuoj7.execute-api.eu-north-1.amazonaws.com/dev/messages/${selectedMessage.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: selectedMessage.username, text: updatedText })
    });
    if (response.ok) {
      // Uppdatera meddelandet i listan
      const updatedMessages = messages.map((msg) =>
        msg.id === selectedMessage.id ? { ...msg, text: updatedText } : msg
      );
      setMessages(updatedMessages);
      setFilteredMessages(updatedMessages); // Uppdatera filtrerade meddelanden
      setSelectedMessage(null); // Återställ formuläret
      setUpdatedText('');
    } else {
      console.error('Error updating message:', response.statusText);
    }
  };

  // Sortera meddelanden efter datum
  const sortMessagesByDate = () => {
    const sortedMessages = [...filteredMessages].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setFilteredMessages(sortedMessages);
  };

  // Återställ till alla meddelanden
  const resetFilterAndSorting = () => {
    setFilteredMessages(messages);
    setSearchUsername(''); // Töm sökfältet
  };

  return (
    <div className="message-list-container">
      <h2 className="message-list-title">Messages</h2>
      <h4 className="message-list-subtitle">Click on a message to update it</h4>
      
      {/* Sökfält för användarnamn */}
      <input
        type="text"
        className="search-input"
        placeholder="Search by username..."
        value={searchUsername}
        onChange={handleSearchChange}
      />

      <div className="button-container">
        {/* Sökknapp */}
        <button className="search-button" onClick={handleSearchClick}>Search by Username</button>
        
        {/* Sorteringsknapp */}
        <button className="sort-button" onClick={sortMessagesByDate}>Sort by Date</button> 
      </div>

      <ul className="message-list">
        {filteredMessages.map(message => (
          <li key={message.id} onClick={() => handleSelectMessage(message)} className="message-item">
            <p className="message-text" style={{ cursor: 'pointer' }}>{message.text}</p> {/* Meddelandet visas här */}
            <p className="message-username"><strong>{message.username}</strong></p> {/* Användarnamn på nästa rad */}
            <p className="message-date">Posted at: {new Date(message.createdAt).toLocaleString()}</p> {/* Datum på ytterligare en rad */}
          </li>
        ))}
      </ul>

      {/* Formulär för att uppdatera meddelanden */}
      {selectedMessage && (
        <div className="update-message-form" ref={formRef}> {/* Lägg till ref här */}
          <h3>Update Message</h3>
          <p><strong>Original Author:</strong> {selectedMessage.username}</p>
          <textarea
            className="update-textarea"
            value={updatedText}
            onChange={(e) => setUpdatedText(e.target.value)}
          />
          <button className="update-button" onClick={updateMessage}>
            Update Message
          </button>
          <button className="cancel-button" onClick={() => setSelectedMessage(null)}>
            Cancel
          </button>
        </div>
      )}

      {/* Tillbaka-knapp för att återställa filtrering och sortering */}
      {(searchUsername || filteredMessages.length !== messages.length) && (
        <button className="back-button" onClick={resetFilterAndSorting}>
          Back to All Messages
        </button>
      )}
    </div>
  );
}

export default MessageList;

