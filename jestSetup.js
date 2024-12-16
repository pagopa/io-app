/* eslint-disable @typescript-eslint/no-var-requires */
/* globals jest, NativeModules, require, global */
/**
 * Set up of the testing environment
 */

import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";
import mockClipboard from "@react-native-clipboard/clipboard/jest/clipboard-mock.js";
import nodeFetch from "node-fetch";
import { NativeModules, AccessibilityInfo } from "react-native";
import mockRNDeviceInfo from "react-native-device-info/jest/react-native-device-info-mock";
import mockZendesk from "./ts/__mocks__/io-react-native-zendesk.ts";

import "react-native-get-random-values";

jest.mock("@pagopa/io-react-native-zendesk", () => mockZendesk);
jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);
jest.mock("@react-native-community/push-notification-ios", () => jest.fn());
jest.mock("@react-native-cookies/cookies", () => jest.fn());
jest.mock("react-native-share", () => jest.fn());
jest.mock("@react-native-clipboard/clipboard", () => mockClipboard);

jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");

  // The mock misses the `addWhitelistedUIProps` implementation
  // So we override it with a no-op
  // eslint-disable-next-line functional/immutable-data,@typescript-eslint/no-empty-function, prettier/prettier
  Reanimated.default.addWhitelistedUIProps = () => {};

  return {
    ...Reanimated,
    useScrollViewOffset: jest.fn
  };
});

jest.mock("react-native-blob-util", () => ({
  DocumentDir: () => jest.fn(),
  polyfill: () => jest.fn()
}));

// eslint-disable-next-line functional/immutable-data
NativeModules.PlatformConstants = NativeModules.PlatformConstants || {
  forceTouchAvailable: false
};

// We need to override the global fetch and AbortController to make the tests
// compatible with node-fetch

const {
  AbortController
} = require("abortcontroller-polyfill/dist/cjs-ponyfill");
// eslint-disable-next-line functional/immutable-data
global.fetch = nodeFetch;
// eslint-disable-next-line functional/immutable-data
global.AbortController = AbortController;

jest.mock("remark-directive", () => jest.fn());
jest.mock("remark-rehype", () => jest.fn());
jest.mock("rehype-stringify", () => jest.fn());
jest.mock("rehype-format", () => jest.fn());
jest.mock("unist-util-visit", () => jest.fn());
jest.mock("hastscript", () => jest.fn());

jest.mock("react-native-device-info", () => mockRNDeviceInfo);

// eslint-disable-next-line no-underscore-dangle, functional/immutable-data
global.__reanimatedWorkletInit = () => jest.fn();

jest.mock("@gorhom/bottom-sheet", () => {
  const rn = require("react-native");

  return {
    __esModule: true,
    BottomSheetModal: rn.Modal,
    BottomSheetScrollView: rn.ScrollView,
    TouchableWithoutFeedback: rn.TouchableWithoutFeedback,
    useBottomSheetModal: () => ({
      dismissAll: jest.fn()
    }),
    namedExport: {
      ...require("react-native-reanimated/mock"),
      ...jest.requireActual("@gorhom/bottom-sheet")
    }
  };
});

jest.mock("react-native-device-info", () => mockRNDeviceInfo);

jest.mock("react-native-pdf", () => jest.fn());

jest.mock("react-native-permissions", () =>
  require("react-native-permissions/mock")
);

/*
 * Turbo modules mocks.
 */

jest.mock("react-native/Libraries/TurboModule/TurboModuleRegistry", () => {
  const turboModuleRegistry = jest.requireActual(
    "react-native/Libraries/TurboModule/TurboModuleRegistry"
  );
  return {
    ...turboModuleRegistry,
    getEnforcing: name => {
      // List of TurboModules libraries to mock.
      const modulesToMock = [
        "RNDocumentPicker",
        "RNHapticFeedback",
        "RNCWebViewModule"
      ];
      if (modulesToMock.includes(name)) {
        return null;
      }
      return turboModuleRegistry.getEnforcing(name);
    }
  };
});

jest.mock("mixpanel-react-native", () => ({
  __esModule: true,
  default: () => jest.fn(),
  Mixpanel: jest.fn(() => ({
    init: jest.fn()
  }))
}));

jest.mock("react-native", () => {
  const RN = jest.requireActual("react-native"); // use original implementation, which comes with mocks out of the box

  // eslint-disable-next-line functional/immutable-data
  RN.NativeModules.JailMonkey = jest.requireActual("jail-monkey");

  return RN;
});

// eslint-disable-next-line functional/immutable-data
NativeModules.CameraView = {
  getConstants: jest.fn()
};

jest.mock("react-native-vision-camera", () => ({
  useCodeScanner: jest.fn(() => ({
    codeTypes: ["qr", "data-matrix"],
    onCodeScanned: jest.fn()
  }))
}));

/* Force the useBoldTextEnabled to return false to resolve tests */
jest.mock("@pagopa/io-app-design-system", () => {
  const actual = jest.requireActual("@pagopa/io-app-design-system");
  return {
    ...actual,
    useBoldTextEnabled: jest.fn(() => Promise.resolve(false))
  };
});

jest
  .spyOn(AccessibilityInfo, "isBoldTextEnabled")
  .mockImplementation(() => Promise.resolve(false));

/**
 * NefInfo's `fetch` method mock
 */
jest.mock("@react-native-community/netinfo", () => ({
  fetch: jest.fn().mockResolvedValue({ isConnected: true })
}));
