import * as fs from "fs";

describe("React Native Push Notifications iOS library integration", () => {
  it("ItaliaApp-Bridgeing-Header.h integrates react-native-push-notification-ios library", () => {
    const hAppBridgeingHeader = "./ios/ItaliaApp/ItaliaApp-Bridgeing-Header.h";

    // eslint-disable-next-line functional/no-let
    let fileExists = false;
    expect(
      () => (fileExists = fs.existsSync(hAppBridgeingHeader))
    ).not.toThrow();
    expect(fileExists).toBe(true);

    // eslint-disable-next-line functional/no-let
    let fileContentBuffer: Buffer | null = null;
    expect(
      () => (fileContentBuffer = fs.readFileSync(hAppBridgeingHeader))
    ).not.toThrow();
    expect(fileContentBuffer).not.toBeNull();

    const fileContent = fileContentBuffer!.toString();
    expect(fileContent).toContain("#import RNCPushNotificationIOS");
  });

  it("AppDelegate.swift integrates react-native-push-notification-ios library", () => {
    const swiftAppDelegateFilePath = "./ios/ItaliaApp/AppDelegate.swift";

    // eslint-disable-next-line functional/no-let
    let fileExists = false;
    expect(
      () => (fileExists = fs.existsSync(swiftAppDelegateFilePath))
    ).not.toThrow();
    expect(fileExists).toBe(true);

    // eslint-disable-next-line functional/no-let
    let fileContentBuffer: Buffer | null = null;
    expect(
      () => (fileContentBuffer = fs.readFileSync(swiftAppDelegateFilePath))
    ).not.toThrow();
    expect(fileContentBuffer).not.toBeNull();

    const fileContent = fileContentBuffer!.toString();
    expect(fileContent).toContain("import UserNotifications");
    expect(fileContent).toContain(
      "RNCPushNotificationIOS.didRegisterForRemoteNotifications(withDeviceToken: deviceToken)"
    );
    expect(fileContent).toContain(
      "RNCPushNotificationIOS.didReceiveRemoteNotification(userInfo, fetchCompletionHandler: completionHandler)"
    );
    expect(fileContent).toContain(
      "RNCPushNotificationIOS.didFailToRegisterForRemoteNotificationsWithError(error)"
    );
    expect(fileContent).toContain(
      "completionHandler([.sound, .alert, .badge])"
    );
  });
});
