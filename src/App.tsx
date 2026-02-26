import React, { useState } from 'react';
import './App.css';
import './styles.css';
import useMouseTrail from './useMouseTrail';
import JoinRoomModal from './components/JoinRoomModal';
import WinnerModal from './components/WinnerModal';

const App: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  

  const { canvasRef, isConnected, playerCount, playerId, score, winnerResult } = useMouseTrail(
    showModal ? null : 'http://localhost:3001',
    username,
    roomId
  );
  const handleRestart = () => {
    setShowModal(true);
    setUsername('');
    setRoomId('');
  };

  const handleJoinRoom = (newUsername: string, newRoomId: string) => {
    setUsername(newUsername);
    setRoomId(newRoomId);
    setShowModal(false);
  };

  return (
    <div className="App">
      {showModal && <JoinRoomModal onJoinRoom={handleJoinRoom} />}
      {winnerResult && (
        <WinnerModal winnerResult={winnerResult} onRestart={handleRestart} />
      )}
      <canvas
        ref={canvasRef}
        className="canvas-main"
      />
      <div className="content">
        <section className="mainContainer">
          <div className="connection-info">
            <div className={isConnected ? 'connection-status' : 'connection-status disconnected'}>
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </div>
            <div>Room: {roomId}</div>
            <div>User: {username}</div>
            <div>Players: {playerCount}</div>
            {playerId && <div>Your ID: {playerId}</div>}
            <div>Score: {score}</div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default App;