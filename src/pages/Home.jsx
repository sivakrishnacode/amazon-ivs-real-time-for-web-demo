import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsernameStore } from '../stores/useUsernameStore.js';
import { User } from '@phosphor-icons/react';

export default function Home() {
  const navigate = useNavigate();
  const { username, setUsername, init } = useUsernameStore();
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (username) {
      setInputValue(username);
    }
  }, [username]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setUsername(trimmed);
    navigate('/demos');
  };

  return (
    <div className="home-page">
      <div className="home-logo">IVS Stage</div>
      <div className="home-subtitle">Google Meet style Real-time Experience</div>

      <form onSubmit={handleSubmit} className="input-group">
        <input
          type="text"
          className="text-input"
          placeholder="Enter your screen name"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          required
        />
        <button type="submit" className="btn-primary">
          <User size={20} weight="bold" />
          Enter Meeting Room
        </button>
      </form>
    </div>
  );
}
