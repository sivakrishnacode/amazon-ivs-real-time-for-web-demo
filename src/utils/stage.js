import { DEMO_API_URL } from '../../constants';

export const fetchDemoToken = async (userId = '', demo) => {
  const body = JSON.stringify({ userId, id: demo.toUpperCase() });
  const headers = { 'Content-Type': 'application/json; charset=utf-8' };
  const response = await fetch(`${DEMO_API_URL}/create`, {
    method: 'POST',
    headers,
    body,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.text();
  const parsed = JSON.parse(result);

  if (!parsed || !parsed.token) {
    throw new Error('Token is missing in the backend response');
  }

  return parsed.token;
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
