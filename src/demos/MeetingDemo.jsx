import React, { useEffect } from 'react';
import { useStageStore } from '../stores/useStageStore.js';
import GridStage from '../components/stage/GridStage.jsx';
import ControlBar from '../components/ui/ControlBar.jsx';
import ChatMessages from '../components/ui/ChatMessages.jsx';

export default function MeetingDemo() {
  const { stageJoined, leaveStage, toggleMic, toggleCam, micEnabled, camEnabled } = useStageStore();

  useEffect(() => {
    return () => {
      leaveStage();
    };
  }, []);

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', minWidth: 0 }}>
        {/* Responsive Grid View */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <GridStage />
        </div>

        {/* Chat overlap/bottom view */}
        <div style={{ height: 160, width: '100%', overflow: 'hidden' }}>
          <ChatMessages demoMode={true} />
        </div>

        {/* Google Meet control bar */}
        <ControlBar
          isJoined={stageJoined}
          micEnabled={micEnabled}
          camEnabled={camEnabled}
          showChat={true}
          onToggleMic={toggleMic}
          onToggleCam={toggleCam}
          onLeave={leaveStage}
          onJoin={() => {}}
          joinLabel=""
        />
      </div>
    </div>
  );
}
