/* eslint-disable functional/immutable-data -- config plugins edit the parsed native files in place */
import {
  type ConfigPlugin,
  withAppDelegate,
  withInfoPlist
} from "expo/config-plugins";

import { insertOnce, replaceOnce } from "./utils";

const FILE_NAME = "AppDelegate.swift";
const MAIN_COMPONENT_NAME = "IO";

const LAUNCH_STATE = `
  private(set) var launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  private(set) var hasStartedReactNative = false
`;

// Expo starts React Native right away: it is deferred until a scene connects
// or iOS delivers background work (see SceneDelegate and startReactNative).
const EXPO_START_REACT_NATIVE = `#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif
`;

const DEFERRED_START_REACT_NATIVE = `    self.launchOptions = launchOptions
    window = UIWindow(frame: UIScreen.main.bounds)
`;

const BACKGROUND_START = `  // With scenes, .background during didFinishLaunching does not identify a background launch.
  // Start without a scene only when iOS actually delivers background work.
  public override func application(
    _ application: UIApplication,
    didReceiveRemoteNotification userInfo: [AnyHashable: Any],
    fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
  ) {
    startReactNative(launchOptions: launchOptions)
    super.application(application, didReceiveRemoteNotification: userInfo, fetchCompletionHandler: completionHandler)
  }

  public override func application(
    _ application: UIApplication,
    performFetchWithCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
  ) {
    startReactNative(launchOptions: launchOptions)
    super.application(application, performFetchWithCompletionHandler: completionHandler)
  }

  public override func application(
    _ application: UIApplication,
    handleEventsForBackgroundURLSession identifier: String,
    completionHandler: @escaping () -> Void
  ) {
    startReactNative(launchOptions: launchOptions)
    super.application(application, handleEventsForBackgroundURLSession: identifier, completionHandler: completionHandler)
  }

  func startReactNative(launchOptions: [UIApplication.LaunchOptionsKey: Any]?) {
    guard !hasStartedReactNative else {
      return
    }
    guard let factory = reactNativeFactory else {
      preconditionFailure("React Native factory must be configured before starting")
    }

    hasStartedReactNative = true
    factory.startReactNative(
      withModuleName: "${MAIN_COMPONENT_NAME}",
      in: window,
      launchOptions: launchOptions
    )
    self.launchOptions = nil
  }

`;

const EXPO_OPEN_URL =
  "return super.application(app, open: url, options: options) || RCTLinkingManager.application(app, open: url, options: options)";
const OPEN_URL =
  "return RCTLinkingManager.application(app, open: url, options: options)";

const EXPO_CONTINUE_USER_ACTIVITY = `    let result = RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
    return super.application(application, continue: userActivity, restorationHandler: restorationHandler) || result
`;
const CONTINUE_USER_ACTIVITY = `    return RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
`;

const SCENE_DELEGATE = `
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene,
          let appDelegate = UIApplication.shared.delegate as? AppDelegate else {
      return
    }

    appDelegate.window?.windowScene = windowScene
    window = appDelegate.window

    if appDelegate.hasStartedReactNative {
      connectionOptions.userActivities.forEach(forwardUniversalLink)
      self.scene(scene, openURLContexts: connectionOptions.urlContexts)
    } else {
      // Initial links must reach getInitialURL(), not an event before JS subscribes.
      var launchOptions = appDelegate.launchOptions ?? [:]
      let initialURL = connectionOptions.urlContexts.first?.url
        ?? connectionOptions.userActivities.first(where: {
          $0.activityType == NSUserActivityTypeBrowsingWeb && $0.webpageURL != nil
        })?.webpageURL
      if let initialURL {
        launchOptions[.url] = initialURL
      }
      appDelegate.startReactNative(launchOptions: launchOptions)
    }
  }

  func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    forwardUniversalLink(userActivity)
  }

  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    guard let urlContext = URLContexts.first else {
      return
    }

    _ = (UIApplication.shared.delegate as? AppDelegate)?.application(
      UIApplication.shared,
      open: urlContext.url,
      options: [:]
    )
  }

  private func forwardUniversalLink(_ userActivity: NSUserActivity) {
    guard
      userActivity.activityType == NSUserActivityTypeBrowsingWeb,
      let appDelegate = UIApplication.shared.delegate as? AppDelegate
    else {
      return
    }

    _ = appDelegate.application(
      UIApplication.shared,
      continue: userActivity,
      restorationHandler: { _ in }
    )
  }
}
`;

const editAppDelegate = (contents: string): string => {
  const steps: ReadonlyArray<(source: string) => string> = [
    source =>
      insertOnce(source, {
        anchor: "  var reactNativeFactory: RCTReactNativeFactory?\n",
        fileName: FILE_NAME,
        marker: "hasStartedReactNative = false",
        position: "after",
        snippet: LAUNCH_STATE
      }),
    source =>
      replaceOnce(
        source,
        EXPO_START_REACT_NATIVE,
        DEFERRED_START_REACT_NATIVE,
        FILE_NAME
      ),
    source =>
      insertOnce(source, {
        anchor: "  // Linking API\n",
        fileName: FILE_NAME,
        marker: "func startReactNative(",
        position: "before",
        snippet: BACKGROUND_START
      }),
    source => replaceOnce(source, EXPO_OPEN_URL, OPEN_URL, FILE_NAME),
    source =>
      replaceOnce(
        source,
        EXPO_CONTINUE_USER_ACTIVITY,
        CONTINUE_USER_ACTIVITY,
        FILE_NAME
      ),
    source =>
      source.includes("class SceneDelegate")
        ? source
        : `${source}${SCENE_DELEGATE}`
  ];
  return steps.reduce((source, step) => step(source), contents);
};

/**
 * Registers the "IO" JS component, defers the React Native start until a scene
 * connects (forwarding the launch link to getInitialURL) or background work
 * arrives, and adopts the UIScene life cycle with a single scene that reuses
 * the AppDelegate window.
 */
const withIosAppDelegate: ConfigPlugin = config => {
  const withDelegate = withAppDelegate(config, delegateConfig => {
    if (delegateConfig.modResults.language !== "swift") {
      throw new Error("[io-app config plugin] Expected a Swift AppDelegate");
    }
    delegateConfig.modResults.contents = editAppDelegate(
      delegateConfig.modResults.contents
    );
    return delegateConfig;
  });

  return withInfoPlist(withDelegate, plistConfig => {
    plistConfig.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: "Default Configuration",
            UISceneDelegateClassName: "$(PRODUCT_MODULE_NAME).SceneDelegate"
          }
        ]
      }
    };
    return plistConfig;
  });
};

export default withIosAppDelegate;
