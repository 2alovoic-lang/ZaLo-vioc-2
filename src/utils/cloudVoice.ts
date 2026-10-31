let activeCloudAudio: HTMLAudioElement | null = null;

export const stopCloudVoice = () => {
  if (activeCloudAudio) {
    activeCloudAudio.pause();
    activeCloudAudio.currentTime = 0;
    activeCloudAudio.src = '';
    activeCloudAudio = null;
  }
};

export const speakWithCloudVoice = async (text: string): Promise<boolean> => {
  if (typeof window === 'undefined' || !text.trim()) return false;

  try {
    const response = await fetch('/api/voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.trim() }),
    });
    if (!response.ok) return false;

    const payload = await response.json();
    if (typeof payload.audioContent !== 'string' || !payload.audioContent) return false;

    stopCloudVoice();
    const binary = atob(payload.audioContent);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);

    const audio = new Audio(URL.createObjectURL(new Blob([bytes], { type: 'audio/mpeg' })));
    activeCloudAudio = audio;
    audio.onended = () => {
      URL.revokeObjectURL(audio.src);
      if (activeCloudAudio === audio) activeCloudAudio = null;
    };
    audio.onerror = () => {
      URL.revokeObjectURL(audio.src);
      if (activeCloudAudio === audio) activeCloudAudio = null;
    };
    await audio.play();
    return true;
  } catch {
    return false;
  }
};
