import React from 'react';

export default function UserAvatar({ username }) {
  const char = username ? String(username).charAt(0).toUpperCase() : '?';
  return <div className="user-avatar">{char}</div>;
}
