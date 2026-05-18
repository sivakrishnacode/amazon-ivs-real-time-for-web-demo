import React, { useState } from 'react';
import { useChatStore } from '../../stores/useChatStore.js';
import { PaperPlaneRight } from '@phosphor-icons/react';

export default function ChatMessages() {
  const { messages, sendMessage } = useChatStore();
  const [inputText, setInputText] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setInputText('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
      {/* Messages View */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.map((msg) => {
          const isSelf = msg.sender.userId === 'Me';
          return (
            <div
              key={msg.id}
              style={{
                alignSelf: isSelf ? 'flex-end' : 'flex-start',
                background: isSelf ? 'var(--blue)' : 'var(--bg-surface-hover)',
                padding: '8px 12px',
                borderRadius: isSelf ? '12px 12px 0 12px' : '12px 12px 12px 0',
                maxWidth: '80%',
                fontSize: '0.85rem',
                wordBreak: 'break-word',
              }}
            >
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>
                {msg.sender.userId}
              </div>
              <div>{msg.content}</div>
            </div>
          );
        })}
      </div>

      {/* Message Input Form */}
      <form onSubmit={handleSend} className="chat-input-area" style={{ display: 'flex', gap: 8, padding: 8, borderTop: '1px solid var(--border)' }}>
        <input
          type="text"
          className="text-input"
          style={{ padding: '8px 12px', borderRadius: 20, fontSize: '0.85rem' }}
          placeholder="Say something..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button
          type="submit"
          className="btn-primary"
          style={{ width: 'auto', height: 36, padding: '0 12px', borderRadius: '50%', boxShadow: 'none' }}
        >
          <PaperPlaneRight size={18} weight="fill" />
        </button>
      </form>
    </div>
  );
}
