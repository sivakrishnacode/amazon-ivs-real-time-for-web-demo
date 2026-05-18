import React from 'react';
import { useStageStore } from '../../stores/useStageStore.js';
import ParticipantTile from './ParticipantTile.jsx';

export default function GridStage() {
  const participants = useStageStore((s) => s.participants);
  const localParticipant = useStageStore((s) => s.localParticipant);

  // Group all participants to display in the grid
  const list = [];
  if (localParticipant) {
    list.push(localParticipant);
  }
  participants.forEach((p) => {
    list.push(p);
  });

  if (list.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
        Waiting for participants to join...
      </div>
    );
  }

  // Choose layout based on participant count
  const getGridTemplate = () => {
    const count = list.length;
    if (count === 1) return { gridTemplateColumns: '1fr', gridTemplateRows: '1fr' };
    if (count === 2) return { gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr' };
    if (count <= 4) return { gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' };
    return { gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr' };
  };

  return (
    <div className="participant-grid" style={getGridTemplate()}>
      {list.map((p) => (
        <ParticipantTile key={p.id || p.userId} participant={p} />
      ))}
    </div>
  );
}
