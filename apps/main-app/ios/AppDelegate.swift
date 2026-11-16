
import UIKit
internal import Expo
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
 
@main
class AppDelegate: ExpoAppDelegate {
  var window: UIWindow?
 
  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?
  private(set) var launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  private(set) var hasStartedReactNative = false
  
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = ExpoReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    self.reactNativeDelegate = delegate
    self.reactNativeFactory = factory
    self.launchOptions = launchOptions

    self.window = UIWindow(frame: UIScreen.main.bounds)

    // Background launches may never connect a scene.
    if application.applicationState == .background {
      startReactNative(launchOptions: launchOptions)
    }

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
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
      withModuleName: "IO",
      in: window,
      launchOptions: launchOptions
    )
    self.launchOptions = nil
  }

  // Deep linking
  override func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
    return RCTLinkingManager.application(app, open: url, options: options)
  }
  
  override func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
    return RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
  }
}

class ReactNativeDelegate: ExpoReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    // needed to return the correct URL for expo-dev-client.
    bridge.bundleURL ?? bundleURL()
  }
 
  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}

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
