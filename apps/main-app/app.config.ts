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

import withAndroidAppCustomizations from "./plugins/withAndroidAppCustomizations";
import withAndroidGradle from "./plugins/withAndroidGradle";
import withCie from "./plugins/withCie";
import withIosAppDelegate from "./plugins/withIosAppDelegate";
import withIosPodfile from "./plugins/withIosPodfile";
import withReactNativeConfig from "./plugins/withReactNativeConfig";
import withSplashScreen from "./plugins/withSplashScreen";

/**
 * Static settings live in app.json: this file only adds what depends on the app
 * variant or on the environment, and applies the local plugins.
 */

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

const DEFAULT_GOOGLE_SERVICES_FILE = "./google-services-dev.json";

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
      "com.apple.developer.nfc.hce.iso7816.select-identifier-prefixes": [
        "A0000002480400",
        "D2760000850101"
      ]
    },
    androidPackage: "it.pagopa.io.app",
    androidAppName: "IO",
    androidAdaptiveIcon: {
      foregroundImage: "./app-config/icons/android/adaptive-foreground.png",
      monochromeImage: "./app-config/icons/android/adaptive-foreground.png",
      backgroundColor: "#0B3EE3"
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

export default ({ config }: ConfigContext): ExpoConfig => {
  const settings = variantSettings[getAppVariant()];

  const appConfig: ExpoConfig = {
    ...config,
    name: config.name ?? "IO",
    slug: config.slug ?? "io-app",
    ios: {
      ...config.ios,
      bundleIdentifier: settings.iosBundleIdentifier,
      icon: settings.iosIcon,
      entitlements: settings.iosEntitlements
    },
    android: {
      ...config.android,
      package: settings.androidPackage,
      adaptiveIcon: settings.androidAdaptiveIcon,
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON ?? DEFAULT_GOOGLE_SERVICES_FILE
    }
  };

  /**
   * Local plugins are applied here rather than listed in app.json `plugins`, so
   * their mods run after the ones of Expo and of the libraries and get the
   * final say.
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
