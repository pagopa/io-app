// Expo transpiles only this file; tsx lets the nested ./plugins/*.ts imports load.
// Must stay the first import.
import "tsx/cjs";

import type { ConfigContext, ExpoConfig } from "expo/config";

import {
  AndroidConfig,
  type ConfigPlugin,
  withPlugins,
  withStringsXml
} from "expo/config-plugins";

import enLocale from "./app-config/locales/en.json";
import withAndroidAppCustomizations from "./plugins/withAndroidAppCustomizations";
import withAndroidGradle from "./plugins/withAndroidGradle";
import withCie from "./plugins/withCie";
import withIosAppDelegate from "./plugins/withIosAppDelegate";
import withIosPodfile from "./plugins/withIosPodfile";
import withReactNativeConfig from "./plugins/withReactNativeConfig";
import withSplashScreen from "./plugins/withSplashScreen";

/**
 * Selects which app the native projects are generated for, e.g.
 * `APP_VARIANT=canary expo prebuild`. Production is the default.
 */
enum AppVariant {
  Canary = "canary",
  Production = "production"
}

type VariantSettings = {
  androidAdaptiveIcon: NonNullable<ExpoConfig["android"]>["adaptiveIcon"];
  androidAppName: string;
  androidPackage: string;
  iosBundleIdentifier: string;
  iosEntitlements: Record<string, unknown>;
  iosIcon: NonNullable<ExpoConfig["ios"]>["icon"];
};

const APPLE_TEAM_ID = "M2X5YQ4BJ7";
const IOS_DEPLOYMENT_TARGET = "16.4";

// Minification is disabled, the rules are kept for when it gets enabled
const ANDROID_EXTRA_PROGUARD_RULES = `
# devsupport
-keep class com.facebook.react.devsupport.** { *; }
-dontwarn com.facebook.react.devsupport.**

# MixPanel
-keep class com.kevinejohn.RNMixpanel.** { *; }
-dontwarn com.kevinejohn.RNMixpanel.**

# React Native Config must referencing to BuildConfig
-keep class it.pagopa.io.app.BuildConfig { *; }

# React-native svg
-keep public class com.horcrux.svg.** {*;}
-dontwarn com.horcrux.svg.**

# React-native cie
-keep public class it.ipzs.** {*;}
-dontwarn it.ipzs.**

-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# React-native Keychain
-keep class com.facebook.crypto.** { *; }

# Hermes
-keep class com.facebook.hermes.unicode.** { *; }

# React Native Skia
-keep class com.shopify.reactnative.skia.** { *; }
`;
const ANDROID_ADAPTIVE_ICON_BACKGROUND = "#0B3EE3";
const DEFAULT_GOOGLE_SERVICES_FILE = "./google-services-dev.json";

const UNIVERSAL_LINK_HOSTS = {
  continua: ["continua.io.pagopa.it", "continua.ioapp.it"],
  send: ["cittadini.uat.notifichedigitali.it", "cittadini.notifichedigitali.it"]
} as const;
const SEND_UNIVERSAL_LINK_PATH_PREFIX = "/io";

const IOS_URL_SCHEMES = [
  "ioit",
  "iowalletcie",
  "iologincie",
  "openid-credential-offer",
  "haip-vci"
];
// iologincie is only registered on iOS
const ANDROID_URL_SCHEMES = [
  "ioit",
  "iowalletcie",
  "openid-credential-offer",
  "haip-vci",
  "iologin",
  "iossoapi",
  "iowallet"
];

const NFC_SELECT_IDENTIFIERS = [
  "A0000002471001",
  "A0000000308000000009816001",
  "A00000000039",
  "A0000002472001",
  "00000000000000"
];
const NFC_HCE_SELECT_IDENTIFIER_PREFIXES = ["A0000002480400", "D2760000850101"];

const commonIosEntitlements = {
  "aps-environment": "development",
  "com.apple.developer.nfc.readersession.formats": ["TAG"]
};

const variantSettings: Record<AppVariant, VariantSettings> = {
  [AppVariant.Production]: {
    iosBundleIdentifier: "it.pagopa.app.io",
    iosIcon: {
      light: "./app-config/icons/ios/icon-default.png",
      dark: "./app-config/icons/ios/icon-dark.png",
      tinted: "./app-config/icons/ios/icon-tinted.png"
    },
    iosEntitlements: {
      ...commonIosEntitlements,
      // NFC HCE (proximity presentation) is not provisioned for the Canary bundle
      "com.apple.developer.nfc.hce": true,
      "com.apple.developer.nfc.hce.iso7816.select-identifier-prefixes":
        NFC_HCE_SELECT_IDENTIFIER_PREFIXES
    },
    androidPackage: "it.pagopa.io.app",
    androidAppName: "IO",
    androidAdaptiveIcon: {
      foregroundImage: "./app-config/icons/android/adaptive-foreground.png",
      monochromeImage: "./app-config/icons/android/adaptive-foreground.png",
      backgroundColor: ANDROID_ADAPTIVE_ICON_BACKGROUND
    }
  },
  [AppVariant.Canary]: {
    iosBundleIdentifier: "it.pagopa.app.io.canary",
    iosIcon: "./app-config/icons/ios/icon-canary.png",
    iosEntitlements: commonIosEntitlements,
    androidPackage: "it.pagopa.io.app.canary",
    androidAppName: "IO Canary",
    androidAdaptiveIcon: {
      foregroundImage:
        "./app-config/icons/android/adaptive-foreground-canary.png",
      backgroundImage:
        "./app-config/icons/android/adaptive-background-canary.png"
    }
  }
};

const isAppVariant = (value: string): value is AppVariant =>
  Object.values<string>(AppVariant).includes(value);

const getAppVariant = (): AppVariant => {
  const variant = process.env.APP_VARIANT ?? AppVariant.Production;
  if (!isAppVariant(variant)) {
    throw new Error(
      `Unknown APP_VARIANT "${variant}", expected one of: ${Object.values(
        AppVariant
      ).join(", ")}`
    );
  }
  return variant;
};

/**
 * `name` also names the generated Xcode project, target and scheme, so it must
 * stay "IO" for every variant: only the Android launcher label changes.
 */
const withAndroidAppName: ConfigPlugin<string> = (config, appName) =>
  withStringsXml(config, stringsConfig => ({
    ...stringsConfig,
    modResults: AndroidConfig.Strings.setStringItem(
      [
        AndroidConfig.Resources.buildResourceItem({
          name: "app_name",
          value: appName,
          translatable: false
        })
      ],
      stringsConfig.modResults
    )
  }));

const browsableViewIntentFilter = (
  data: Array<Record<string, string>>,
  autoVerify = false
) => ({
  action: "VIEW",
  autoVerify,
  category: ["BROWSABLE", "DEFAULT"],
  data
});

enum Linked {
  No = 0,
  Yes = 1
}

enum Purpose {
  Analytics = "Analytics",
  AppFunctionality = "AppFunctionality",
  ProductPersonalization = "ProductPersonalization"
}

const collectedDataType = (
  type: string,
  linked: Linked,
  purposes: ReadonlyArray<Purpose>
) => ({
  NSPrivacyCollectedDataType: `NSPrivacyCollectedDataType${type}`,
  NSPrivacyCollectedDataTypeLinked: linked === Linked.Yes,
  NSPrivacyCollectedDataTypeTracking: false,
  NSPrivacyCollectedDataTypePurposes: purposes.map(
    purpose => `NSPrivacyCollectedDataTypePurpose${purpose}`
  )
});

const iosUsageDescriptions = enLocale.ios;
// The base Info.plist has always carried the Italian Bluetooth text
const bluetoothUsageDescription =
  "IO richiede l'accesso al Bluetooth per completare la verifica dei documenti";
const calendarUsageDescription =
  iosUsageDescriptions.NSCalendarsUsageDescription;
const placeholderUsageDescription = (key: string) =>
  `The app needs ${key} permission`;

export default ({ config }: ConfigContext): ExpoConfig => {
  const appVariant = getAppVariant();
  const settings = variantSettings[appVariant];

  const appConfig: ExpoConfig = {
    ...config,
    name: config.name ?? "IO",
    slug: "io-app",
    locales: {
      en: "./app-config/locales/en.json",
      it: "./app-config/locales/it.json",
      de: "./app-config/locales/de.json"
    },
    ios: {
      ...config.ios,
      bundleIdentifier: settings.iosBundleIdentifier,
      appleTeamId: APPLE_TEAM_ID,
      supportsTablet: false,
      userInterfaceStyle: "automatic",
      icon: settings.iosIcon,
      associatedDomains: [
        ...UNIVERSAL_LINK_HOSTS.continua,
        ...UNIVERSAL_LINK_HOSTS.send
      ].map(host => `applinks:${host}`),
      entitlements: settings.iosEntitlements,
      config: {
        usesNonExemptEncryption: false
      },
      infoPlist: {
        CFBundleDevelopmentRegion: "en",
        CFBundlePackageType: "APPL",
        RCTNewArchEnabled: true,
        CFBundleURLTypes: [
          {
            CFBundleTypeRole: "Editor",
            CFBundleURLName: "ioit",
            CFBundleURLSchemes: IOS_URL_SCHEMES
          }
        ],
        LSApplicationQueriesSchemes: ["http", "https", "CIEID"],
        UISupportedInterfaceOrientations: ["UIInterfaceOrientationPortrait"],
        UIRequiredDeviceCapabilities: ["arm64"],
        UIBackgroundModes: ["processing", "fetch", "remote-notification"],
        BGTaskSchedulerPermittedIdentifiers: [
          "com.expo.modules.backgroundtask.processing"
        ],
        UIStatusBarStyle: "UIStatusBarStyleLightContent",
        UIViewControllerBasedStatusBarAppearance: false,
        CADisableMinimumFrameDurationOnPhone: true,
        UIFileSharingEnabled: true,
        LSSupportsOpeningDocumentsInPlace: true,
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: false,
          NSAllowsLocalNetworking: true,
          NSExceptionDomains: {
            localhost: { NSExceptionAllowsInsecureHTTPLoads: true }
          }
        },
        "com.apple.developer.nfc.readersession.iso7816.select-identifiers":
          NFC_SELECT_IDENTIFIERS,
        NFCReaderUsageDescription: "NFC tag to read EIC cards",
        NSBluetoothAlwaysUsageDescription: bluetoothUsageDescription,
        NSBluetoothPeripheralUsageDescription: bluetoothUsageDescription,
        NSCameraUsageDescription: iosUsageDescriptions.NSCameraUsageDescription,
        NSCalendarsUsageDescription: calendarUsageDescription,
        NSCalendarsFullAccessUsageDescription: calendarUsageDescription,
        NSRemindersUsageDescription: calendarUsageDescription,
        NSRemindersFullAccessUsageDescription: calendarUsageDescription,
        NSContactsUsageDescription:
          iosUsageDescriptions.NSContactsUsageDescription,
        NSFaceIDUsageDescription: iosUsageDescriptions.NSFaceIDUsageDescription,
        NSMicrophoneUsageDescription:
          iosUsageDescriptions.NSMicrophoneUsageDescription,
        NSPhotoLibraryUsageDescription:
          iosUsageDescriptions.NSPhotoLibraryUsageDescription,
        NSPhotoLibraryAddUsageDescription:
          iosUsageDescriptions.NSPhotoLibraryAddUsageDescription,
        NSAppleMusicUsageDescription: placeholderUsageDescription(
          "NSAppleMusicUsageDescription"
        ),
        NSLocationUsageDescription: placeholderUsageDescription(
          "NSLocationUsageDescription"
        ),
        NSLocationAlwaysUsageDescription: placeholderUsageDescription(
          "NSLocationAlwaysUsageDescription"
        ),
        NSLocationWhenInUseUsageDescription: placeholderUsageDescription(
          "NSLocationWhenInUseUsageDescription"
        ),
        NSMotionUsageDescription: placeholderUsageDescription(
          "NSMotionUsageDescription"
        ),
        NSSpeechRecognitionUsageDescription: placeholderUsageDescription(
          "NSSpeechRecognitionUsageDescription"
        )
      },
      privacyManifests: {
        NSPrivacyTracking: false,
        NSPrivacyTrackingDomains: [],
        NSPrivacyAccessedAPITypes: [
          {
            NSPrivacyAccessedAPIType:
              "NSPrivacyAccessedAPICategorySystemBootTime",
            NSPrivacyAccessedAPITypeReasons: ["35F9.1"]
          },
          {
            NSPrivacyAccessedAPIType:
              "NSPrivacyAccessedAPICategoryFileTimestamp",
            NSPrivacyAccessedAPITypeReasons: ["C617.1", "0A2A.1", "3B52.1"]
          },
          {
            NSPrivacyAccessedAPIType:
              "NSPrivacyAccessedAPICategoryUserDefaults",
            NSPrivacyAccessedAPITypeReasons: ["CA92.1", "1C8F.1"]
          },
          {
            NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryDiskSpace",
            NSPrivacyAccessedAPITypeReasons: ["E174.1", "85F4.1", "7D9E.1"]
          }
        ],
        NSPrivacyCollectedDataTypes: [
          collectedDataType("OtherDataTypes", Linked.Yes, [
            Purpose.AppFunctionality,
            Purpose.ProductPersonalization,
            Purpose.Analytics
          ]),
          collectedDataType("CoarseLocation", Linked.Yes, [
            Purpose.AppFunctionality
          ]),
          collectedDataType("Name", Linked.Yes, [Purpose.AppFunctionality]),
          collectedDataType("EmailAddress", Linked.Yes, [
            Purpose.AppFunctionality
          ]),
          collectedDataType("Health", Linked.Yes, [Purpose.AppFunctionality]),
          collectedDataType("PaymentInfo", Linked.Yes, [
            Purpose.AppFunctionality
          ]),
          collectedDataType("CustomerSupport", Linked.Yes, [
            Purpose.AppFunctionality,
            Purpose.Analytics
          ]),
          collectedDataType("UserID", Linked.Yes, [
            Purpose.Analytics,
            Purpose.AppFunctionality,
            Purpose.ProductPersonalization
          ]),
          collectedDataType("DeviceID", Linked.No, [
            Purpose.AppFunctionality,
            Purpose.Analytics
          ]),
          collectedDataType("PurchaseHistory", Linked.Yes, [
            Purpose.AppFunctionality
          ]),
          collectedDataType("ProductInteraction", Linked.Yes, [
            Purpose.AppFunctionality,
            Purpose.Analytics
          ]),
          collectedDataType("OtherUsageData", Linked.No, [
            Purpose.AppFunctionality,
            Purpose.Analytics
          ]),
          collectedDataType("CrashData", Linked.No, [
            Purpose.AppFunctionality,
            Purpose.Analytics
          ]),
          collectedDataType("PerformanceData", Linked.Yes, [
            Purpose.AppFunctionality,
            Purpose.Analytics
          ]),
          collectedDataType("OtherDiagnosticData", Linked.Yes, [
            Purpose.AppFunctionality,
            Purpose.Analytics
          ])
        ]
      }
    },
    android: {
      ...config.android,
      package: settings.androidPackage,
      allowBackup: false,
      predictiveBackGestureEnabled: false,
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON ?? DEFAULT_GOOGLE_SERVICES_FILE,
      adaptiveIcon: settings.androidAdaptiveIcon,
      // Bluetooth permissions with flags or maxSdkVersion are declared by plugins/withAndroidAppCustomizations
      permissions: [
        "NFC",
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "VIBRATE",
        "RECEIVE_BOOT_COMPLETED",
        "POST_NOTIFICATIONS",
        "READ_CALENDAR",
        "WRITE_CALENDAR",
        "CAMERA",
        "USE_FINGERPRINT",
        "USE_BIOMETRIC",
        "SCHEDULE_EXACT_ALARM",
        "BLUETOOTH_CONNECT",
        "BLUETOOTH_ADVERTISE"
      ],
      blockedPermissions: [
        // See https://pagopa.atlassian.net/browse/IA-557
        "android.permission.ACCESS_WIFI_STATE",
        "android.permission.RECORD_AUDIO",
        // expo-screen-capture adds it for a screenshot callback the app does not use
        "android.permission.READ_MEDIA_IMAGES"
      ],
      intentFilters: [
        ...ANDROID_URL_SCHEMES.map(scheme =>
          browsableViewIntentFilter([{ scheme }])
        ),
        ...UNIVERSAL_LINK_HOSTS.continua.map(host =>
          browsableViewIntentFilter([{ scheme: "https" }, { host }], true)
        ),
        browsableViewIntentFilter(
          [
            { scheme: "https" },
            ...UNIVERSAL_LINK_HOSTS.send.map(host => ({ host })),
            { pathPrefix: SEND_UNIVERSAL_LINK_PATH_PREFIX }
          ],
          true
        )
      ]
    },
    plugins: [
      [
        "expo-build-properties",
        {
          android: {
            minSdkVersion: 26,
            usesCleartextTraffic: true,
            extraMavenRepos: ["https://zendesk.jfrog.io/zendesk/repo"],
            packagingOptions: {
              pickFirst: [
                "lib/x86/libc++_shared.so",
                "lib/x86_64/libjsc.so",
                "lib/arm64-v8a/libjsc.so",
                "lib/arm64-v8a/libc++_shared.so",
                "lib/x86_64/libc++_shared.so",
                "lib/armeabi-v7a/libc++_shared.so"
              ],
              exclude: ["lib/riscv64/**"]
            },
            extraProguardRules: ANDROID_EXTRA_PROGUARD_RULES
          },
          ios: {
            deploymentTarget: IOS_DEPLOYMENT_TARGET,
            buildReactNativeFromSource: true
          }
        }
      ],
      [
        "react-native-permissions",
        { iosPermissions: ["PhotoLibrary", "Bluetooth"] }
      ],
      ["react-native-vision-camera", { enableCodeScanner: true }],
      "expo-background-task",
      "expo-web-browser",
      [
        "expo-font",
        {
          fonts: [
            "./assets/fonts/TitilliumSansPro",
            "./assets/fonts/Titillio",
            "./assets/fonts/FiraCode"
          ]
        }
      ]
    ]
  };

  /**
   * Local plugins are applied here rather than listed in `plugins`, so their
   * mods run after the ones of Expo and of the libraries and get the final
   * say.
   */
  return withPlugins(appConfig, [
    [withAndroidAppName, settings.androidAppName],
    withCie,
    withReactNativeConfig,
    withSplashScreen,
    withIosAppDelegate,
    withIosPodfile,
    withAndroidGradle,
    withAndroidAppCustomizations
  ]);
};
