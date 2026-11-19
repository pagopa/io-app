import {
  type ConfigPlugin,
  withAppBuildGradle,
  withGradleProperties,
  withProjectBuildGradle
} from "expo/config-plugins";

import { insertOnce, replaceOnce } from "./utils";

const OKHTTP_VERSION = "4.9.2";
const BOUNCYCASTLE_TARGET = "org.bouncycastle:bcprov-jdk18on:1.77";

const RELEASE_SIGNING_CONFIG = `
        release {
            if (System.getenv('IO_APP_RELEASE_STORE_FILE')) {
                storeFile file(System.getenv('IO_APP_RELEASE_STORE_FILE'))
                storePassword System.getenv('IO_APP_RELEASE_STORE_PASSWORD')
                keyAlias System.getenv('IO_APP_RELEASE_KEY_ALIAS')
                keyPassword System.getenv('IO_APP_RELEASE_KEY_PASSWORD')
            }
        }`;

const BUNDLE_SPLITS = `    // The Android App Bundle reads this section to create different bundles
    bundle {
        language {
            enableSplit = false
        }
        density {
            enableSplit = false
        }
        abi {
            enableSplit = true
        }
    }
`;

const EXTRA_DEPENDENCIES = `    implementation("com.squareup.okhttp3:okhttp:\${rootProject.ext.okhttpVersion}")
    implementation("com.squareup.okhttp3:logging-interceptor:\${rootProject.ext.okhttpVersion}")
    implementation "org.jetbrains.kotlin:kotlin-reflect:1.3.41"
    // Required by the launch_screen layout of react-native-splash-screen
    implementation "androidx.constraintlayout:constraintlayout:2.1.4"
    // Specifing this avoid :app:checkDebugDuplicateClasses failure
    implementation "com.google.guava:guava:27.0.1-android"
    // Required by expo-image-picker because we target a minSdkVersion < 30. Can be removed when we target minSdkVersion >= 30.
    implementation("androidx.activity:activity:1.9.+")
`;

const BOUNCYCASTLE_RESOLUTION = `
// Fixes the bouncycastle clash caused by io-react-native-cbor and io-react-native-proximity
configurations.all {
    c -> c.resolutionStrategy.eachDependency {
        DependencyResolveDetails dependency ->
            if (dependency.requested.group == 'org.bouncycastle') {
                dependency.useTarget '${BOUNCYCASTLE_TARGET}'
            }
    }
}
`;

const GRADLE_PROPERTIES: Record<string, string> = {
  "org.gradle.jvmargs": "-Xmx4g -XX:MaxMetaspaceSize=512m",
  "android.enableJetifier": "true"
};

const withAppGradleCustomizations: ConfigPlugin = config =>
  withAppBuildGradle(config, gradleConfig => {
    const fileName = "app/build.gradle";
    const steps: ReadonlyArray<(contents: string) => string> = [
      contents =>
        insertOnce(contents, {
          anchor: /signingConfigs \{\n {8}debug \{[^}]*\}/,
          marker: "IO_APP_RELEASE_STORE_FILE",
          position: "after",
          snippet: RELEASE_SIGNING_CONFIG,
          fileName
        }),
      contents =>
        replaceOnce(
          contents,
          "see https://reactnative.dev/docs/signed-apk-android.\n            signingConfig signingConfigs.debug",
          "see https://reactnative.dev/docs/signed-apk-android.\n            signingConfig signingConfigs.release",
          fileName
        ),
      contents =>
        insertOnce(contents, {
          anchor: "    androidResources {\n",
          marker: "    bundle {\n",
          position: "before",
          snippet: BUNDLE_SPLITS,
          fileName
        }),
      contents =>
        insertOnce(contents, {
          anchor: 'implementation("com.facebook.react:react-android")\n',
          marker: "com.squareup.okhttp3:okhttp:",
          position: "after",
          snippet: EXTRA_DEPENDENCIES,
          fileName
        }),
      contents =>
        contents.includes(BOUNCYCASTLE_TARGET)
          ? contents
          : `${contents}${BOUNCYCASTLE_RESOLUTION}`
    ];
    return {
      ...gradleConfig,
      modResults: {
        ...gradleConfig.modResults,
        contents: steps.reduce(
          (contents, step) => step(contents),
          gradleConfig.modResults.contents
        )
      }
    };
  });

const withRootGradleCustomizations: ConfigPlugin = config =>
  withProjectBuildGradle(config, gradleConfig => ({
    ...gradleConfig,
    modResults: {
      ...gradleConfig.modResults,
      // Read by @pagopa/react-native-cie and by the app dependencies
      contents: insertOnce(gradleConfig.modResults.contents, {
        anchor: "buildscript {\n",
        marker: "okhttpVersion",
        position: "after",
        snippet: `  ext {\n    okhttpVersion = "${OKHTTP_VERSION}"\n  }\n`,
        fileName: "build.gradle"
      })
    }
  }));

const withCustomGradleProperties: ConfigPlugin = config =>
  withGradleProperties(config, propertiesConfig => {
    const updatedItems = propertiesConfig.modResults.map(item =>
      item.type === "property" && item.key in GRADLE_PROPERTIES
        ? { ...item, value: GRADLE_PROPERTIES[item.key] }
        : item
    );
    const missingItems = Object.entries(GRADLE_PROPERTIES)
      .filter(
        ([key]) =>
          !updatedItems.some(
            item => item.type === "property" && item.key === key
          )
      )
      .map(([key, value]) => ({ type: "property" as const, key, value }));
    return {
      ...propertiesConfig,
      modResults: [...updatedItems, ...missingItems]
    };
  });

/**
 * Restores the Gradle customizations of the former committed android project:
 * release signing from the IO_APP_RELEASE_* env, App Bundle splits, extra
 * dependencies, bouncycastle resolution and Gradle JVM settings.
 */
const withAndroidGradle: ConfigPlugin = config =>
  withCustomGradleProperties(
    withRootGradleCustomizations(withAppGradleCustomizations(config))
  );

export default withAndroidGradle;
