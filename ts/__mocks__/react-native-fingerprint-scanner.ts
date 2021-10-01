export default {
  isSensorAvailable: () => Promise.resolve("Touch ID"),
  authenticate: () => Promise.resolve(),
  release: () => Promise.resolve()
};
