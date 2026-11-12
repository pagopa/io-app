export const formatTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString();

export const formatDuration = (milliseconds: number) =>
  milliseconds < 1000
    ? `${milliseconds} ms`
    : `${(milliseconds / 1000).toFixed(1)} s`;
