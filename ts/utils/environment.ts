import { environment } from "../config";

/**
 * Return true if the app is running with local env
 */
export const isLocalEnv = environment === "DEV";

/**
 * Return true if the app is running in dev mode
 */
export const isDevEnv = __DEV__;

// true if the env is in testing phase
export const isTestEnv = process.env.NODE_ENV === "test";
