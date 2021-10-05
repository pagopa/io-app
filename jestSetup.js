/* globals jest, NativeModules, require, global */
/**
 * Set up of the testing environment
 */

import { NativeModules } from "react-native";
import mockAsyncStorage from "@react-native-community/async-storage/jest/async-storage-mock";
import mockClipboard from "@react-native-clipboard/clipboard/jest/clipboard-mock.js";
import nodeFetch from "node-fetch";

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
jest.mock("@react-native-clipboard/clipboard", () => mockClipboard);

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

// We need to override the global fetch and AbortController to make the tests
// compatible with node-fetch

const {
  AbortController
  // eslint-disable-next-line @typescript-eslint/no-var-requires
} = require("abortcontroller-polyfill/dist/cjs-ponyfill");
// eslint-disable-next-line @typescript-eslint/no-explicit-any,functional/immutable-data
global.fetch = nodeFetch;
// eslint-disable-next-line @typescript-eslint/no-explicit-any,functional/immutable-data
global.AbortController = AbortController;

jest.mock("remark-directive", jest.fn());
jest.mock("remark-rehype", jest.fn());
jest.mock("rehype-stringify", jest.fn());
jest.mock("rehype-format", jest.fn());
jest.mock("unist-util-visit", jest.fn());
jest.mock("hastscript", jest.fn());
