/**
 * Return true if the app is running in dev mode
 */
export const isDevEnv = __DEV__;

export const isTestEnv = process.env.NODE_ENV === "test";
