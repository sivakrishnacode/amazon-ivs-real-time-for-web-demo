/**
 * stage.js — Backend API helpers
 *
 * Fixes:
 * - Uses userId (not username) as the hostId for /create — the API expects
 *   a stable unique ID, not a display name.
 * - /join body matches the exact schema the IVSRealTimeDemo Lambda expects.
 * - Detailed error messages surface the API response body on failure.
 */
import { DEMO_API_URL, DEMO_API_KEY } from '../../constants.js';

const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'X-API-Key': DEMO_API_KEY,
};

/**
 * Fetch a participant token.
 * @param {string} userId  — stable user ID (not display name)
 * @param {string} demo    — demo id: 'meeting' | 'audio' | 'pk' | 'guest'
 * @param {string|null} hostId — if present, guest joins existing stage
 * @returns {Promise<string>} participantToken
 */
export const fetchDemoToken = async (userId, demo, hostId = null) => {
  const isAudio = demo === 'audio';
  const type = isAudio ? 'AUDIO' : 'VIDEO';

  let url, body;

  if (hostId) {
    // Guest joining an existing stage
    url = `${DEMO_API_URL}/join`;
    body = {
      hostId,
      userId,
      attributes: { username: userId },
    };
  } else {
    // Host creating a new stage
    url = `${DEMO_API_URL}/create`;
    body = {
      hostId: userId,
      userId,
      type,
      cid: 'k0ljndvw90',
      hostAttributes: { username: userId },
    };
  }

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  } catch (networkErr) {
    throw new Error(`Network error reaching API: ${networkErr.message}`);
  }

  if (!response.ok) {
    let detail = '';
    try { detail = await response.text(); } catch (_) {}
    throw new Error(
      `API returned ${response.status} ${response.statusText}${detail ? ': ' + detail : ''}`
    );
  }

  const parsed = await response.json();

  if (hostId) {
    // Guest join response
    const token = parsed?.token;
    if (!token) {
      throw new Error(`No token in join response: ${JSON.stringify(parsed)}`);
    }
    return token;
  } else {
    // Host create response — token nested inside hostParticipantToken
    const token =
      parsed?.hostParticipantToken?.token ||
      parsed?.token ||
      parsed?.participantToken?.token;
    if (!token) {
      throw new Error(`No token in create response: ${JSON.stringify(parsed)}`);
    }
    return token;
  }
};

// ── Participant helpers ───────────────────────────────────────────────────────

export const isLocalParticipant = (info) => info.isLocal;

export const createParticipant = (info) => ({
  ...info,
  streams: [],
});

export const getRemovedStreams = (participant, updatedStreams) => {
  if (!participant?.streams?.length) return [];
  return participant.streams.filter(
    (s) => !updatedStreams.find((r) => s.id === r.id)
  );
};
