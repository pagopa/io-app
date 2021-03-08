/**
 * Set up of the testing environment
 */

import { NativeModules } from "react-native";
import mockAsyncStorage from "@react-native-community/async-storage/jest/async-storage-mock";

NativeModules.RNGestureHandlerModule = {
  attachGestureHandler: jest.fn(),
  createGestureHandler: jest.fn(),
  dropGestureHandler: jest.fn(),
  updateGestureHandler: jest.fn(),
  forceTouchAvailable: jest.fn(),
  State: {},
  Directions: {}
};

jest.mock("@react-native-community/async-storage", () => mockAsyncStorage);
jest.mock("@react-native-community/push-notification-ios", jest.fn());
jest.mock("react-native-permissions", jest.fn());
jest.mock("@react-native-community/cookies", jest.fn());
jest.mock("react-native-share", () => jest.fn());

/**
 * adds as for documentation suggestion
 * https://docs.swmansion.com/react-native-reanimated/docs/1.x.x/getting_started/#testing
 */
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");

  // The mock misses the `addWhitelistedUIProps` implementation
  // So we override it with a no-op
  Reanimated.default.addWhitelistedUIProps = () => {};

  return Reanimated;
});

NativeModules.PlatformConstants = NativeModules.PlatformConstants || {
  forceTouchAvailable: false
};
