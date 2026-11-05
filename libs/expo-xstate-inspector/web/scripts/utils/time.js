export const formatTime = timestamp => new Date(timestamp).toLocaleTimeString();

export const formatDuration = milliseconds =>
  milliseconds < 1000
    ? `${milliseconds} ms`
    : `${(milliseconds / 1000).toFixed(1)} s`;
