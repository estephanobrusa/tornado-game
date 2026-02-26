import React, { useState } from 'react';
import '../styles.css';

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
    <div className="join-room-modal-overlay">
      <div className="join-room-modal-box">
        <h2 className="join-room-title">Join a Room</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label className="join-room-label">Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              placeholder="Enter your name"
              className="join-room-input"
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label className="join-room-label">Room ID:</label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => {
                setRoomId(e.target.value);
                setError('');
              }}
              placeholder="Enter room ID"
              className="join-room-input"
            />
          </div>
          
          {error && (
            <div className="join-room-error">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            className="join-room-btn"
          >
            Join Room
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinRoomModal;