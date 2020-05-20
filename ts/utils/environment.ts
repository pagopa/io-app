/**
 * Return true if the app is running in dev mode
 */
export const isDevEnv = __DEV__;

// true if the env is in testing phase
export const isTestEnv = process.env.NODE_ENV === "test";
