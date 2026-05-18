import React from 'react';

const AVATAR_COLORS = [
  ['#ff7b00', '#ffae00'],
  ['#1a73e8', '#0097fb'],
  ['#0f9d58', '#00c853'],
  ['#ea4335', '#ff6d00'],
  ['#9c27b0', '#e040fb'],
  ['#00838f', '#26c6da'],
];

function getColorIndex(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % AVATAR_COLORS.length;
}

export default function UserAvatar({ username = '?', size = 40 }) {
  const initial = String(username).charAt(0).toUpperCase() || '?';
  const [from, to] = AVATAR_COLORS[getColorIndex(username)];
  const fontSize = Math.max(12, Math.round(size * 0.38));

  return (
    <div
      className="user-avatar"
      style={{
        width: size,
        height: size,
        minWidth: size,
        fontSize,
        background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
      }}
    >
      {initial}
    </div>
  );
}
