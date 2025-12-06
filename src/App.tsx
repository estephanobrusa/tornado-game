import React, { useState } from 'react';
import './App.css';
import useMouseTrail from './useMouseTrail';
import JoinRoomModal from './components/JoinRoomModal';

const App: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  
  const { canvasRef, isConnected, playerCount, playerId, score } = useMouseTrail(
    showModal ? null : 'http://localhost:3001',
    username,
    roomId
  );

  const handleJoinRoom = (newUsername: string, newRoomId: string) => {
    setUsername(newUsername);
    setRoomId(newRoomId);
    setShowModal(false);
  };

  return (
    <div className="App">
      {showModal && <JoinRoomModal onJoinRoom={handleJoinRoom} />}
      
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          border: '2px solid rgba(100, 200, 255, 0.3)',
          borderRadius: '8px',
          boxShadow: '0 0 20px rgba(100, 200, 255, 0.2)',
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          zIndex: 10
        }}
      />
      <div className="content">
        <section className="mainContainer">
          <div className="connection-info" style={{
            position: 'fixed',
            top: '0px',
            right: '20px',
            padding: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            zIndex: 20
          }}>
            <div style={{ color: isConnected ? '#4CAF50' : '#f44336' }}>
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </div>
            <div>Room: {roomId}</div>
            <div>User: {username}</div>
            <div>Players: {playerCount}</div>
            {playerId && <div>Tu ID: {playerId}</div>}
            <div>Puntuación: {score}</div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default App;