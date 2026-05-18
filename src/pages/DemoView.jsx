import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStageStore } from '../stores/useStageStore.js';
import MeetingDemo from '../demos/MeetingDemo.jsx';
import AudioOnlyDemo from '../demos/AudioOnlyDemo.jsx';
import GuestSpotDemo from '../demos/GuestSpotDemo.jsx';
import PKModeDemo from '../demos/PKModeDemo.jsx';

export default function DemoView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const stageCreated = useStageStore((s) => s.stageCreated);

  useEffect(() => {
    // If stage connection hasn't been initialized/created, go back to list
    if (!stageCreated) {
      navigate('/demos');
    }
  }, [stageCreated]);

  const renderDemo = () => {
    switch (id) {
      case 'meeting':
        return <MeetingDemo />;
      case 'audio':
        return <AudioOnlyDemo />;
      case 'guest':
        return <GuestSpotDemo />;
      case 'pk':
        return <PKModeDemo />;
      default:
        return <div style={{ padding: 24, textAlign: 'center' }}>Demo not found.</div>;
    }
  };

  return <div className="demo-view-page" style={{ height: '100%' }}>{renderDemo()}</div>;
}
