/* eslint-disable functional/immutable-data -- config plugins edit the parsed native files in place */
import {
  AndroidConfig,
  type ConfigPlugin,
  withAndroidColors,
  withAndroidManifest,
  withAndroidStyles,
  withMainActivity,
  withStringsXml
} from "expo/config-plugins";

import { replaceOnce } from "./utils";

type ManifestActivity = AndroidConfig.Manifest.ManifestActivity;
type ManifestService = NonNullable<
  AndroidConfig.Manifest.ManifestApplication["service"]
>[number];
// The typings miss some attributes and children used below
type PermissionAttributes = AndroidConfig.Manifest.ManifestUsesPermission["$"] &
  Record<string, string>;

const MAIN_COMPONENT_NAME = "IO";

const MIXPANEL_META_DATA: Record<string, string> = {
  "com.mixpanel.android.MPConfig.UseIpAddressForGeolocation": "false",
  // Disable A/B testing, see https://pagopa.atlassian.net/browse/IA-42
  "com.mixpanel.android.MPConfig.DisableGestureBindingUI": "true",
  "com.mixpanel.android.MPConfig.DisableEmulatorBindingUI": "true"
};

const ZENDESK_ACTIVITIES = [
  "zendesk.support.guide.HelpCenterActivity",
  "zendesk.support.guide.ViewArticleActivity",
  "zendesk.support.request.RequestActivity",
  "zendesk.support.requestlist.RequestListActivity",
  "zendesk.messaging.MessagingActivity"
];

/**
 * BLE permissions with flags or SDK limits. They are declared here instead of
 * through the react-native-ble-plx plugin, which would also add location
 * permissions for every SDK version.
 */
const BLE_PERMISSIONS: ReadonlyArray<PermissionAttributes> = [
  {
    "android:name": "android.permission.BLUETOOTH_SCAN",
    "android:usesPermissionFlags": "neverForLocation"
  },
  {
    "android:name": "android.permission.BLUETOOTH",
    "android:maxSdkVersion": "30"
  },
  {
    "android:name": "android.permission.BLUETOOTH_ADMIN",
    "android:maxSdkVersion": "30"
  }
];
const BLE_LOCATION_PERMISSION: PermissionAttributes = {
  "android:name": "android.permission.ACCESS_FINE_LOCATION",
  "android:maxSdkVersion": "30"
};

/**
 * Declared at app level by the Expo template or by library plugins, but not by
 * the former app manifest: library manifests still contribute their own.
 */
const UNDECLARED_PERMISSIONS = [
  "android.permission.READ_EXTERNAL_STORAGE",
  "android.permission.WRITE_EXTERNAL_STORAGE",
  "android.permission.SYSTEM_ALERT_WINDOW",
  "android.permission.WRITE_SETTINGS"
];

const COLORS: Record<string, string> = {
  primary: "#0073E6",
  white: "#FFFFFF",
  ic_launcher_background: "#0B3EE3"
};

/** English base strings, the Italian ones come from app-config/locales */
const STRINGS: ReadonlyArray<{
  name: string;
  translatable?: boolean;
  value: string;
}> = [
  { name: "splash_io_name", value: "the app of public services" },
  { name: "notification_channel_name", value: "Messages" },
  {
    name: "notification_channel_description",
    value: "Receive notification for new messages"
  },
  { name: "alert_device_rooted_title", value: "Device rooted" },
  {
    name: "alert_device_rooted_desc",
    // Expo escapes the apostrophe when writing strings.xml
    value: "This device is rooted, you can't use this app for security reasons"
  },
  { name: "dialog_attention", value: "Attention" },
  {
    name: "tablet_not_supported",
    value: "Tablet devices are not currently supported"
  },
  {
    name: "default_notification_channel_id",
    value: "io_default_notification_channel",
    translatable: false
  }
];

const hasName = (name: string) => (item: { $: { "android:name": string } }) =>
  item.$["android:name"] === name;

const withManifestCustomizations: ConfigPlugin = config =>
  withAndroidManifest(config, manifestConfig => {
    const manifest = manifestConfig.modResults.manifest;

    manifest.$["android:installLocation"] = "auto";

    // Allows Linking.canOpenURL on any http(s) url
    const queries = (manifest.queries ??= [{}]);
    const intents = (queries[0].intent ??= []);
    ["http", "https"].forEach(scheme => {
      const alreadyDeclared = intents.some(
        intent =>
          intent.data?.some(
            data =>
              data.$["android:scheme"] === scheme &&
              data.$["android:host"] === "*"
          ) ?? false
      );
      if (!alreadyDeclared) {
        intents.push({
          action: [{ $: { "android:name": "android.intent.action.VIEW" } }],
          data: [{ $: { "android:scheme": scheme, "android:host": "*" } }]
        });
      }
    });

    const manifestWithExtras = manifest as Record<string, unknown> &
      typeof manifest;
    manifestWithExtras["supports-screens"] = [
      {
        $: {
          "android:smallScreens": "true",
          "android:normalScreens": "true",
          "android:largeScreens": "true",
          "android:xlargeScreens": "false"
        }
      }
    ];

    manifest["uses-permission"] = (manifest["uses-permission"] ?? []).filter(
      permission =>
        !UNDECLARED_PERMISSIONS.includes(permission.$["android:name"])
    );
    const permissions = manifest["uses-permission"];
    BLE_PERMISSIONS.forEach(attributes => {
      const index = permissions.findIndex(hasName(attributes["android:name"]));
      if (index >= 0) {
        permissions[index] = { $: attributes };
      } else {
        permissions.push({ $: attributes });
      }
    });
    const sdk23Permissions = (manifest["uses-permission-sdk-23"] ??= []);
    if (
      !sdk23Permissions.some(
        p => p.$["android:name"] === BLE_LOCATION_PERMISSION["android:name"]
      )
    ) {
      sdk23Permissions.push({ $: BLE_LOCATION_PERMISSION });
    }

    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(
      manifestConfig.modResults
    );
    Object.assign(application.$, {
      "android:requestLegacyExternalStorage": "true",
      "android:largeHeap": "true"
    });

    Object.entries(MIXPANEL_META_DATA).forEach(([name, value]) =>
      AndroidConfig.Manifest.addMetaDataItemToMainApplication(
        application,
        name,
        value
      )
    );

    const activities = (application.activity ??= []);
    ZENDESK_ACTIVITIES.filter(name => !activities.some(hasName(name))).forEach(
      name =>
        activities.push({
          $: {
            "android:name": name,
            "android:theme": "@style/ZendeskTheme"
          } as ManifestActivity["$"]
        })
    );

    const mainActivity = AndroidConfig.Manifest.getMainActivityOrThrow(
      manifestConfig.modResults
    );
    mainActivity.$["android:launchMode"] = "singleTop";
    mainActivity.$["android:label"] = "@string/app_name";
    // The splash is shown by react-native-splash-screen, see withSplashScreen
    delete mainActivity.$["android:theme"];

    // Lets Google Play services install the backported photo picker used by
    // expo-image-picker on Android < 30
    const services = (application.service ??= []);
    const photoPickerService =
      "com.google.android.gms.metadata.ModuleDependencies";
    if (!services.some(hasName(photoPickerService))) {
      services.push({
        $: {
          "android:name": photoPickerService,
          "android:enabled": "false",
          "android:exported": "false",
          "tools:ignore": "MissingClass"
        } as ManifestService["$"],
        "intent-filter": [
          {
            action: [
              {
                $: {
                  "android:name":
                    "com.google.android.gms.metadata.MODULE_DEPENDENCIES"
                }
              }
            ]
          }
        ],
        "meta-data": [
          {
            $: {
              "android:name": "photopicker_activity:0:required",
              "android:value": ""
            }
          }
        ]
      } as ManifestService);
    }

    return manifestConfig;
  });

const withResourcesCustomizations: ConfigPlugin = config => {
  const withColors = withAndroidColors(config, colorsConfig => {
    colorsConfig.modResults = Object.entries(COLORS).reduce(
      (xml, [name, value]) =>
        AndroidConfig.Colors.assignColorValue(xml, { name, value }),
      colorsConfig.modResults
    );
    return colorsConfig;
  });

  const withStyles = withAndroidStyles(withColors, stylesConfig => {
    const appTheme = {
      name: "AppTheme",
      parent: "Theme.AppCompat.DayNight.NoActionBar"
    };
    const zendeskTheme = {
      name: "ZendeskTheme",
      parent: "Theme.MaterialComponents.Light"
    };
    const items: ReadonlyArray<{
      add?: boolean;
      name: string;
      parent: { name: string; parent: string };
      value: string;
    }> = [
      // Set by Expo defaults, the former theme relied on the platform values
      { parent: appTheme, name: "colorPrimary", value: "", add: false },
      {
        parent: appTheme,
        name: "android:statusBarColor",
        value: "",
        add: false
      },
      { parent: appTheme, name: "android:windowIsTranslucent", value: "true" },
      { parent: appTheme, name: "android:forceDarkAllowed", value: "false" },
      {
        parent: appTheme,
        name: "android:navigationBarColor",
        value: "@android:color/transparent"
      },
      ...["colorPrimary", "colorPrimaryDark", "colorAccent"].map(name => ({
        parent: zendeskTheme,
        name,
        value: "@color/primary"
      }))
    ];
    stylesConfig.modResults = items.reduce(
      (xml, item) =>
        AndroidConfig.Styles.assignStylesValue(xml, { add: true, ...item }),
      stylesConfig.modResults
    );
    return stylesConfig;
  });

  return withStringsXml(withStyles, stringsConfig => {
    stringsConfig.modResults = AndroidConfig.Strings.setStringItem(
      STRINGS.map(({ name, value, translatable }) =>
        AndroidConfig.Resources.buildResourceItem({ name, value, translatable })
      ),
      stringsConfig.modResults
    );
    return stringsConfig;
  });
};

const withMainComponentName: ConfigPlugin = config =>
  withMainActivity(config, activityConfig => {
    activityConfig.modResults.contents = replaceOnce(
      activityConfig.modResults.contents,
      'getMainComponentName(): String = "main"',
      `getMainComponentName(): String = "${MAIN_COMPONENT_NAME}"`,
      "MainActivity.kt"
    );
    return activityConfig;
  });

/**
 * Restores the Android app customizations that were hand-written in the former
 * committed project: manifest entries, themes, colors, strings and the JS
 * component name.
 */
const withAndroidAppCustomizations: ConfigPlugin = config =>
  withMainComponentName(
    withResourcesCustomizations(withManifestCustomizations(config))
  );

export default withAndroidAppCustomizations;
