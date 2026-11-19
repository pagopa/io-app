import { type ConfigPlugin, withAppBuildGradle } from "expo/config-plugins";

import { insertOnce } from "./utils";

/**
 * Exposes the .env values to Android through react-native-config, reading
 * `.env` for debug and `.env.production` for release builds. iOS needs no
 * change: the pod generates the values at build time.
 */
const withReactNativeConfig: ConfigPlugin = config =>
  withAppBuildGradle(config, gradleConfig => {
    const withEnvFiles = insertOnce(gradleConfig.modResults.contents, {
      anchor: /^/,
      marker: "project.ext.envConfigFiles",
      position: "before",
      snippet: [
        "project.ext.envConfigFiles = [",
        '  debug: ".env",',
        '  release: ".env.production"',
        "]",
        "",
        ""
      ].join("\n"),
      fileName: "app/build.gradle"
    });
    return {
      ...gradleConfig,
      modResults: {
        ...gradleConfig.modResults,
        contents: insertOnce(withEnvFiles, {
          anchor: 'apply plugin: "com.facebook.react"\n',
          marker: "react-native-config').projectDir",
          position: "after",
          snippet:
            "\napply from: project(':react-native-config').projectDir.getPath() + \"/dotenv.gradle\"\n",
          fileName: "app/build.gradle"
        })
      }
    };
  });

export default withReactNativeConfig;
