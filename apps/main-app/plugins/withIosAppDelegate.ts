/* eslint-disable functional/immutable-data -- config plugins edit the parsed native files in place */
import {
  type ConfigPlugin,
  withAppDelegate,
  withInfoPlist
} from "expo/config-plugins";

import { replaceOnce } from "./utils";

const MAIN_COMPONENT_NAME = "IO";

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
}
`;

/**
 * Registers the "IO" JS component and adopts the UIScene life cycle with a
 * single scene that reuses the AppDelegate window.
 */
const withIosAppDelegate: ConfigPlugin = config => {
  const withDelegate = withAppDelegate(config, delegateConfig => {
    if (delegateConfig.modResults.language !== "swift") {
      throw new Error("[io-app config plugin] Expected a Swift AppDelegate");
    }
    const fileName = "AppDelegate.swift";
    const withModuleName = replaceOnce(
      delegateConfig.modResults.contents,
      'withModuleName: "main"',
      `withModuleName: "${MAIN_COMPONENT_NAME}"`,
      fileName
    );
    delegateConfig.modResults.contents = withModuleName.includes(
      "class SceneDelegate"
    )
      ? withModuleName
      : `${withModuleName}${SCENE_DELEGATE}`;
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
