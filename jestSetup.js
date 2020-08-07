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

NativeModules.PlatformConstants = NativeModules.PlatformConstants || {
  forceTouchAvailable: false
};
