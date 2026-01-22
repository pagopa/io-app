/* eslint-disable @typescript-eslint/no-var-requires */
/* globals jest, require, global */
/**
 * Set up of the testing environment
 */

import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";
import mockClipboard from "@react-native-clipboard/clipboard/jest/clipboard-mock.js";
import nodeFetch from "node-fetch";
import { NativeModules, AccessibilityInfo, AppState } from "react-native";
import mockRNDeviceInfo from "react-native-device-info/jest/react-native-device-info-mock";
import mockZendesk from "./ts/__mocks__/io-react-native-zendesk.ts";
import { initI18n } from "./ts/i18n.ts";

void initI18n();

const mockRNQRGenerator = {
  default: {
    detect: jest.fn().mockResolvedValue(null),
    generate: jest.fn().mockResolvedValue({
      uri: "mock-qr-uri"
    })
  }
};

import "react-native-get-random-values";
require("@shopify/flash-list/jestSetup");
jest.mock("rn-qr-generator", () => mockRNQRGenerator);
jest.mock("react-native-screenshot-prevent", () => ({}));
jest.mock("react-native-haptic-feedback", () => ({
  ...jest.requireActual("react-native-haptic-feedback"),
  trigger: jest.fn()
}));

// eslint-disable-next-line functional/immutable-data
global.CanvasKit = {
  MakeCanvas: jest.fn(),
  MakeImage: jest.fn(),
  MakePicture: jest.fn(),
  MakePath: jest.fn(),
  MakePaint: jest.fn(),
  MakeMatrix: jest.fn(),
  MakeColor: jest.fn(),
  MakeFont: jest.fn(),
  MakeTypeface: jest.fn(),
  MakeTextBlob: jest.fn(),
  MakeVertices: jest.fn(),
  MakeShader: jest.fn(),
  MakeImageFilter: jest.fn(),
  MakeColorFilter: jest.fn(),
  MakeBlendMode: jest.fn(),
  MakeRuntimeEffect: jest.fn(),
  MakeSkottieAnimation: jest.fn(() => ({
    fps: jest.fn(() => 30),
    duration: jest.fn(() => 1)
  })),
  MakeManagedAnimation: jest.fn(() => ({
    fps: jest.fn(() => 30),
    duration: jest.fn(() => 1)
  }))
};

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
  // eslint-disable-next-line functional/immutable-data,@typescript-eslint/no-empty-function
  Reanimated.default.addWhitelistedUIProps = () => {};

  return {
    ...Reanimated,
    LayoutAnimationConfig: require("react-native").View,
    useScrollViewOffset: jest.fn,
    useReducedMotion: jest.fn
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

jest.mock("@sentry/react-native");

jest.mock("react-native-device-info", () => mockRNDeviceInfo);

jest.mock("react-native-pdf", () => jest.fn());

jest.mock("react-native-permissions", () =>
  require("react-native-permissions/mock")
);

const mockSubscription = {
  callback: jest.fn(),
  remove: jest.fn()
};

jest.mock("react-native", () => {
  const RN = jest.requireActual("react-native"); // use original implementation, which comes with mocks out of the box

  // eslint-disable-next-line functional/immutable-data
  RN.NativeModules.JailMonkey = jest.requireActual("jail-monkey");

  // eslint-disable-next-line functional/immutable-data
  RN.NativeModules.AppReviewModule = {
    requestReview: jest.fn()
  };

  return RN;
});

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
        "RNCWebViewModule",
        "AppState"
      ];
      if (modulesToMock.includes(name)) {
        return null;
      }
      return turboModuleRegistry.getEnforcing(name);
    }
  };
});

jest.mock(
  "react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo",
  () => {
    const accessibilityInfo = jest.requireActual(
      "react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo"
    );

    return {
      ...accessibilityInfo,
      addEventListener: () => ({
        remove: jest.fn()
      })
    };
  }
);
jest.spyOn(AppState, "addEventListener").mockImplementation(() => ({remove: jest.fn()}));

jest.mock("mixpanel-react-native", () => ({
  __esModule: true,
  default: () => jest.fn(),
  Mixpanel: jest.fn(() => ({
    init: jest.fn()
  }))
}));

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

jest
  .spyOn(AccessibilityInfo, "isBoldTextEnabled")
  .mockImplementation(() => Promise.resolve(false));

/**
 * NefInfo's `fetch` method mock
 */
jest.mock("@react-native-community/netinfo", () => ({
  fetch: jest.fn().mockResolvedValue({ isConnected: true })
}));

// eslint-disable-next-line functional/immutable-data
window.navigator = {};
jest.mock("reactotron-react-native", () => ({
  configure: jest.fn().mockReturnThis(),
  setAsyncStorageHandler: jest.fn().mockReturnThis(),
  useReactNative: jest.fn().mockReturnThis(),
  use: jest.fn().mockReturnThis(),
  connect: jest.fn().mockReturnThis(),
  onCustomCommand: jest.fn()
}));

jest.mock("uuid", () => ({
  v4: () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789".split("");
    return Array.from({ length: 36 })
      .map((_, i) =>
        i === 8 || i === 13 || i === 18 || i === 23
          ? "-"
          : chars[Math.floor(Math.random() * chars.length)]
      )
      .join("");
  }
}));

jest.mock("react-native-bluetooth-state-manager", () => ({
  getState: jest.fn().mockResolvedValue(true)
}));

jest.mock("@pagopa/io-react-native-iso18013", () => ({
  CBOR: {
    decodeIssuerSigned: jest.fn(() => Promise.resolve("test"))
  },
  COSE: {
    verify: jest.fn(() => Promise.resolve(true))
  }
}));

jest.mock("@pagopa/io-react-native-cie", () => ({
  CieManager: jest.fn()
}));
