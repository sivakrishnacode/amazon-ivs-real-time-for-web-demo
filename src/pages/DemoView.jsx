/**
 * DemoView.jsx — Route guard + demo renderer
 *
 * Fix: guard checks stageCreated (set before join completes) not stageJoined
 * so navigation doesn't bounce during the async connection window.
 * Also: renders a graceful "reconnecting" state instead of an instant redirect.
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStageStore } from '../stores/useStageStore.js';
import MeetingDemo from '../demos/MeetingDemo.jsx';
import AudioOnlyDemo from '../demos/AudioOnlyDemo.jsx';
import GuestSpotDemo from '../demos/GuestSpotDemo.jsx';
import PKModeDemo from '../demos/PKModeDemo.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';

const DEMO_COMPONENTS = {
  meeting: MeetingDemo,
  audio: AudioOnlyDemo,
  guest: GuestSpotDemo,
  pk: PKModeDemo,
};

export default function DemoView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const stageCreated = useStageStore((s) => s.stageCreated);
  const stageJoined = useStageStore((s) => s.stageJoined);
  const [guardExpired, setGuardExpired] = useState(false);

  useEffect(() => {
    // Give the stage 8 seconds to connect before redirecting
    if (!stageCreated) {
      const timer = setTimeout(() => setGuardExpired(true), 8000);
      return () => clearTimeout(timer);
    }
  }, [stageCreated]);

  useEffect(() => {
    if (guardExpired && !stageCreated) {
      navigate('/demos');
    }
  }, [guardExpired, stageCreated]);

  if (!stageCreated && !guardExpired) {
    return (
      <LoadingSpinner
        text={stageJoined ? 'Loading demo…' : 'Connecting to stage…'}
      />
    );
  }

  const DemoComponent = DEMO_COMPONENTS[id];
  if (!DemoComponent) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
        Demo "{id}" not found.{' '}
        <button
          className="btn-primary"
          style={{ display: 'inline-flex', width: 'auto', marginTop: 12 }}
          onClick={() => navigate('/demos')}
        >
          Back to demos
        </button>
      </div>
    );
  }

  return (
    <div className="demo-view-page" style={{ height: '100%' }}>
      <DemoComponent />
    </div>
  );
}
