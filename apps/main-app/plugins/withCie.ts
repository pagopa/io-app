import {
  type ConfigPlugin,
  withAppBuildGradle,
  withMainApplication,
  withSettingsGradle
} from "expo/config-plugins";

import { insertOnce } from "./utils";

/**
 * Links @pagopa/react-native-cie on Android by hand: its autolinking is
 * disabled in react-native.config.js because the package must be registered as
 * an explicit Gradle project. iOS is handled by scripts/configure-cie-ios.sh.
 */
const withCie: ConfigPlugin = config => {
  const withSettings = withSettingsGradle(config, settingsConfig => ({
    ...settingsConfig,
    modResults: {
      ...settingsConfig.modResults,
      contents: insertOnce(settingsConfig.modResults.contents, {
        anchor: "include ':app'\n",
        marker: "include ':react-native-cie'",
        position: "after",
        snippet: [
          "include ':react-native-cie'",
          "project(':react-native-cie').projectDir = new File(rootProject.projectDir, '../../../node_modules/@pagopa/react-native-cie/android')",
          ""
        ].join("\n"),
        fileName: "settings.gradle"
      })
    }
  }));

  const withDependency = withAppBuildGradle(withSettings, gradleConfig => ({
    ...gradleConfig,
    modResults: {
      ...gradleConfig.modResults,
      contents: insertOnce(gradleConfig.modResults.contents, {
        anchor: 'implementation("com.facebook.react:react-android")\n',
        marker: "implementation project(':react-native-cie')",
        position: "after",
        snippet: "    implementation project(':react-native-cie')\n",
        fileName: "app/build.gradle"
      })
    }
  }));

  return withMainApplication(withDependency, mainApplicationConfig => {
    const withImport = insertOnce(mainApplicationConfig.modResults.contents, {
      anchor: /^import com\.facebook\.react\.PackageList\n/m,
      marker: "import it.ipzs.cieidsdk.native_bridge.CiePackage",
      position: "before",
      snippet: "import it.ipzs.cieidsdk.native_bridge.CiePackage\n",
      fileName: "MainApplication.kt"
    });
    return {
      ...mainApplicationConfig,
      modResults: {
        ...mainApplicationConfig.modResults,
        contents: insertOnce(withImport, {
          anchor: /PackageList\(this\)\.packages\.apply \{\n/,
          marker: "add(CiePackage())",
          position: "after",
          snippet: "          add(CiePackage())\n",
          fileName: "MainApplication.kt"
        })
      }
    };
  });
};

export default withCie;
