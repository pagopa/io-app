/* eslint-disable functional/immutable-data -- config plugins edit the parsed native files in place */
import {
  AndroidConfig,
  type ConfigPlugin,
  IOSConfig,
  withAndroidStyles,
  withDangerousMod,
  withInfoPlist,
  withMainActivity,
  withXcodeProject
} from "expo/config-plugins";
import path from "path";

import {
  copyDirectory,
  insertOnce,
  NATIVE_SOURCES_DIR,
  replaceOnce
} from "./utils";

const IOS_STORYBOARD = "LaunchScreen.storyboard";

const ANDROID_SPLASH_THEME = {
  name: "SplashScreenTheme",
  parent: "SplashScreen_SplashTheme"
};
const ANDROID_SPLASH_THEME_ITEMS: Record<string, string> = {
  "android:statusBarColor": "@color/ic_launcher_background",
  "android:navigationBarColor": "@color/ic_launcher_background",
  "android:windowLightStatusBar": "false",
  "android:windowIsTranslucent": "false",
  "android:textColor": "#FFFFFF",
  "android:windowOptOutEdgeToEdgeEnforcement": "true"
};

/**
 * Wires react-native-splash-screen, which the app hides from JS. The launch
 * screen layouts and images are kept in app-config/native and copied into the
 * generated projects.
 */
const withAndroidSplashScreen: ConfigPlugin = config => {
  const withResources = withDangerousMod(config, [
    "android",
    dangerousConfig => {
      copyDirectory(
        path.join(
          dangerousConfig.modRequest.projectRoot,
          NATIVE_SOURCES_DIR,
          "android",
          "res"
        ),
        path.join(
          dangerousConfig.modRequest.platformProjectRoot,
          "app",
          "src",
          "main",
          "res"
        )
      );
      return dangerousConfig;
    }
  ]);

  const withTheme = withAndroidStyles(withResources, stylesConfig => {
    stylesConfig.modResults = Object.entries(ANDROID_SPLASH_THEME_ITEMS).reduce(
      (xml, [name, value]) =>
        AndroidConfig.Styles.assignStylesValue(xml, {
          add: true,
          parent: ANDROID_SPLASH_THEME,
          name,
          value
        }),
      stylesConfig.modResults
    );
    return stylesConfig;
  });

  return withMainActivity(withTheme, activityConfig => {
    const fileName = "MainActivity.kt";
    const withImports = insertOnce(activityConfig.modResults.contents, {
      anchor: /^import com\.facebook\.react\.ReactActivity\n/m,
      marker: "import org.devio.rn.splashscreen.SplashScreen",
      position: "before",
      snippet: [
        "import androidx.core.view.WindowCompat",
        "import org.devio.rn.splashscreen.SplashScreen",
        ""
      ].join("\n"),
      fileName
    });
    activityConfig.modResults.contents = replaceOnce(
      withImports,
      [
        "// Set the theme to AppTheme BEFORE onCreate to support",
        "    // coloring the background, status bar, and navigation bar.",
        "    // This is required for expo-splash-screen.",
        "    setTheme(R.style.AppTheme);"
      ].join("\n"),
      [
        "// Enable edge to edge support",
        "    WindowCompat.setDecorFitsSystemWindows(window, false)",
        "    SplashScreen.show(this, R.style.SplashScreenTheme)"
      ].join("\n"),
      fileName
    );
    return activityConfig;
  });
};

const withIosSplashScreen: ConfigPlugin = config => {
  const withFiles = withDangerousMod(config, [
    "ios",
    dangerousConfig => {
      const { projectName, projectRoot, platformProjectRoot } =
        dangerousConfig.modRequest;
      if (!projectName) {
        throw new Error("[io-app config plugin] Missing iOS project name");
      }
      const source = path.join(projectRoot, NATIVE_SOURCES_DIR, "ios");
      copyDirectory(source, path.join(platformProjectRoot, projectName));
      return dangerousConfig;
    }
  ]);

  const withStoryboard = withXcodeProject(withFiles, xcodeConfig => {
    const projectName = xcodeConfig.modRequest.projectName;
    if (!projectName) {
      throw new Error("[io-app config plugin] Missing iOS project name");
    }
    const filepath = path.join(projectName, IOS_STORYBOARD);
    if (!xcodeConfig.modResults.hasFile(filepath)) {
      xcodeConfig.modResults = IOSConfig.XcodeUtils.addResourceFileToGroup({
        filepath,
        groupName: projectName,
        project: xcodeConfig.modResults,
        isBuildFile: true
      });
      // The xcode library does not know the storyboard file type
      const fileReference = xcodeConfig.modResults.hasFile(filepath) as Record<
        string,
        unknown
      >;
      Object.assign(fileReference, {
        fileEncoding: 4,
        lastKnownFileType: "file.storyboard",
        name: IOS_STORYBOARD,
        path: filepath
      });
      delete fileReference.explicitFileType;
      delete fileReference.includeInIndex;
    }
    return xcodeConfig;
  });

  return withInfoPlist(withStoryboard, plistConfig => {
    plistConfig.modResults.UILaunchStoryboardName =
      path.parse(IOS_STORYBOARD).name;
    return plistConfig;
  });
};

const withSplashScreen: ConfigPlugin = config =>
  withIosSplashScreen(withAndroidSplashScreen(config));

export default withSplashScreen;
