import React, { useState } from 'react';

interface JoinRoomModalProps {
  onJoinRoom: (username: string, roomId: string) => void;
}

const JoinRoomModal: React.FC<JoinRoomModalProps> = ({ onJoinRoom }) => {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    
    if (!roomId.trim()) {
      setError('Room ID is required');
      return;
    }
    
    onJoinRoom(username.trim(), roomId.trim());
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        width: '400px',
        maxWidth: '90vw'
      }}>
        <h2 style={{
          margin: '0 0 20px 0',
          color: '#333',
          textAlign: 'center',
          fontSize: '24px'
        }}>Join a Room</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#555',
              fontWeight: 'bold'
            }}>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              placeholder="Enter your name"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#555',
              fontWeight: 'bold'
            }}>Room ID:</label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => {
                setRoomId(e.target.value);
                setError('');
              }}
              placeholder="Enter room ID"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          {error && (
            <div style={{
              color: '#f44336',
              marginBottom: '15px',
              textAlign: 'center',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}
          
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
            onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#45a049'}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#4CAF50'}
          >
            Join Room
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinRoomModal;