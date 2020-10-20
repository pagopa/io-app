/**
 * Set up of the testing environment
 */

import { NativeModules } from "react-native";

NativeModules.RNGestureHandlerModule = {
  attachGestureHandler: jest.fn(),
  createGestureHandler: jest.fn(),
  dropGestureHandler: jest.fn(),
  updateGestureHandler: jest.fn(),
  forceTouchAvailable: jest.fn(),
  State: {},
  Directions: {}
};

jest.mock("@react-native-community/push-notification-ios", jest.fn());
jest.mock("react-native-permissions", jest.fn());
jest.mock("@react-native-community/cookies", jest.fn());

/**
 * adds as for documentation suggestion
 * https://docs.swmansion.com/react-native-reanimated/docs/1.x.x/getting_started/#testing
 */
jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock")
);
NativeModules.PlatformConstants = NativeModules.PlatformConstants || {
  forceTouchAvailable: false
};
