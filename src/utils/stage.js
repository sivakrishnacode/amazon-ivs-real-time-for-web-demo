import { DEMO_API_URL, DEMO_API_KEY } from '../../constants';

export const fetchDemoToken = async (userId = '', demo, hostId = null) => {
  const isAudio = demo.toLowerCase() === 'audio';
  const type = isAudio ? 'AUDIO' : 'VIDEO';

  let url = `${DEMO_API_URL}/create`;
  let body = {};

  if (hostId) {
    // Guest joining an existing stage
    url = `${DEMO_API_URL}/join`;
    body = {
      attributes: {
        username: userId,
      },
      userId,
      hostId,
    };
  } else {
    // Host creating a fresh stage
    body = {
      hostAttributes: {
        username: userId,
      },
      hostId: userId,
      type,
      cid: 'k0ljndvw90',
    };
  }

  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'X-API-Key': DEMO_API_KEY,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.text();
  const parsed = JSON.parse(result);

  if (hostId) {
    if (!parsed || !parsed.token) {
      throw new Error('Token is missing in the join response');
    }
    return parsed.token;
  } else {
    if (!parsed || !parsed.hostParticipantToken || !parsed.hostParticipantToken.token) {
      throw new Error('Token is missing in the create response');
    }
    return parsed.hostParticipantToken.token;
  }
};

export const isLocalParticipant = (info) => {
  return info.isLocal;
};

export const createParticipant = (participantInfo) => {
  return {
    ...participantInfo,
    streams: [],
  };
};

export const getRemovedStreams = (participant, updatedStreams) => {
  if (!participant) return [];
  if (!participant.streams?.length) return [];
  return participant.streams?.filter(
    (existingStream) =>
      !updatedStreams.find(
        (removedStream) => existingStream.id === removedStream.id
      )
  );
};
