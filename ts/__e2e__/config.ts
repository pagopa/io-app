// 10 seconds seems a lot in development, but lower values are causing false positives
// on the CI environment. Don't touch it if you don't know what you are doing.
export const E2E_WAIT_RENDER_TIMEOUT_MS = 10 * 1000;
export const E2E_PIN_CHAR = "2";
