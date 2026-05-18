/**
 * GridStage.jsx
 * Renders local + remote participants in a responsive CSS grid.
 * Reads from participantsMap (not a plain array) so it always reflects reality.
 */
import React from 'react';
import { useStageStore } from '../../stores/useStageStore.js';
import ParticipantTile from './ParticipantTile.jsx';

export default function GridStage() {
  const localParticipant = useStageStore((s) => s.localParticipant);
  const participantsMap = useStageStore((s) => s.participantsMap);
  const stageJoined = useStageStore((s) => s.stageJoined);

  const remoteList = Object.values(participantsMap);
  const list = [];
  if (localParticipant) list.push(localParticipant);
  remoteList.forEach((p) => list.push(p));

  if (list.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 16,
        color: 'var(--text-secondary)',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'var(--bg-surface)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.8rem',
        }}>🎥</div>
        <div style={{ fontWeight: 500 }}>
          {stageJoined ? 'Waiting for others to join…' : 'Connecting to stage…'}
        </div>
        <div style={{ fontSize: '0.85rem', opacity: 0.6 }}>
          Share the meeting link to invite participants
        </div>
      </div>
    );
  }

  const count = list.length;
  let gridTemplate;
  if (count === 1) {
    gridTemplate = { gridTemplateColumns: '1fr', gridTemplateRows: '1fr' };
  } else if (count === 2) {
    gridTemplate = { gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr' };
  } else if (count <= 4) {
    gridTemplate = { gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' };
  } else if (count <= 6) {
    gridTemplate = { gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr' };
  } else {
    gridTemplate = { gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' };
  }

  return (
    <div className="participant-grid" style={gridTemplate}>
      {list.map((p) => (
        <ParticipantTile key={p.id || p.userId} participant={p} />
      ))}
    </div>
  );
}
