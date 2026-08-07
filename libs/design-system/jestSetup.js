/* globals jest, NativeModules */
/**
 * Set up of the testing environment
 */

import nodeFetch from "node-fetch";
import { NativeModules } from "react-native";

// eslint-disable-next-line functional/immutable-data
NativeModules.RNGestureHandlerModule = {
  attachGestureHandler: jest.fn(),
  createGestureHandler: jest.fn(),
  dropGestureHandler: jest.fn(),
  updateGestureHandler: jest.fn(),
  forceTouchAvailable: jest.fn(),
  flushOperations: jest.fn(),
  State: {},
  Directions: {}
};

// Mock react-native-worklets for tests (must be before reanimated)
jest.mock("react-native-worklets", () =>
  require("react-native-worklets/lib/module/mock")
);

// Setup Reanimated for testing using the new v4 approach
// eslint-disable-next-line @typescript-eslint/no-var-requires
require("react-native-reanimated").setUpTests();

// Pulsar is a TurboModule, so importing it under Jest throws: there is no
// native module for TurboModuleRegistry.getEnforcing("RNPulsar") to bind to.
// eslint-disable-next-line @typescript-eslint/no-var-requires
jest.mock("react-native-pulsar", () => require("./__mocks__/pulsarJestMock"));

// eslint-disable-next-line functional/immutable-data
NativeModules.PlatformConstants = NativeModules.PlatformConstants || {
  forceTouchAvailable: false
};

jest.mock("react-native/Libraries/EventEmitter/RCTDeviceEventEmitter", () => ({
  default: jest.fn()
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any,functional/immutable-data
global.fetch = nodeFetch;
// eslint-disable-next-line @typescript-eslint/no-explicit-any,functional/immutable-data
global.AbortController = AbortController;
// eslint-disable-next-line functional/immutable-data, no-underscore-dangle
global.__reanimatedWorkletInit = jest.fn();

jest.mock("./src/utils/accessibility", () => ({
  useBoldTextEnabled: () => false,
  useIOFontDynamicScale: () => ({
    dynamicFontScale: 1,
    spacingScaleMultiplier: 1
  })
}));
