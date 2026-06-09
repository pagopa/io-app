import { Platform } from "react-native";

/**
 * A lightweight wrapper around React Native’s `Platform.select`.
 *
 * This function exists to allow overriding and mocking `Platform.select`
 * in tests, making it easier to simulate different platform scenarios
 * (iOS, Android, Web, etc.).
 *
 * @param specifics - The configuration object passed to `Platform.select`.
 * @returns The value corresponding to the current platform.
 */
export const platformSelect: typeof Platform.select = specifics =>
  Platform.select(specifics);
