export const createAudioContext = () => {
  return new (window.AudioContext || window.webkitAudioContext)();
};

export const destroyAudioContext = (audioContext) => {
  return new Promise((resolve) => {
    if (!audioContext || audioContext.state === 'closed') {
      resolve();
      return;
    }

    audioContext
      .close()
      .then(() => {
        resolve();
      })
      .catch((error) => {
        console.error('Error closing AudioContext:', error);
        resolve(); // Always resolve to avoid blocking UI cleanup
      });
  });
};

export const calculateRMS = (array) => {
  let rms = 0;
  for (let i = 0; i < array.length; i++) {
    const floatSample = (array[i] - 128) / 128;
    rms += floatSample * floatSample;
  }
  rms = Math.sqrt(rms / array.length);
  return rms;
};

export const getNormalizedGain = (analyserNode) => {
  if (!analyserNode) return 0;
  const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
  analyserNode.getByteTimeDomainData(dataArray);
  const rms = calculateRMS(dataArray);
  // Return scaled value suitable for UI animation
  return rms;
};
