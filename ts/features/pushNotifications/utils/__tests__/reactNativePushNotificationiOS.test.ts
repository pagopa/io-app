import * as fs from "fs";

describe("React Native Push Notifications iOS library integration", () => {
  it("AppDelegate.h integrates react-native-push-notification-ios library", () => {
    const hAppDelegateFilePath = "./ios/ItaliaApp/AppDelegate.h";

    // eslint-disable-next-line functional/no-let
    let fileExists = false;
    expect(
      () => (fileExists = fs.existsSync(hAppDelegateFilePath))
    ).not.toThrow();
    expect(fileExists).toBe(true);

    // eslint-disable-next-line functional/no-let
    let fileContentBuffer: Buffer | null = null;
    expect(
      () => (fileContentBuffer = fs.readFileSync(hAppDelegateFilePath))
    ).not.toThrow();
    expect(fileContentBuffer).not.toBeNull();

    const fileContent = fileContentBuffer!.toString();
    expect(fileContent).toContain(
      "#import <UserNotifications/UNUserNotificationCenter.h>"
    );
    expect(fileContent).toContain("UNUserNotificationCenterDelegate");
  });

  it("AppDelegate.mm integrates react-native-push-notification-ios library", () => {
    const mmAppDelegateFilePath = "./ios/ItaliaApp/AppDelegate.mm";

    // eslint-disable-next-line functional/no-let
    let fileExists = false;
    expect(
      () => (fileExists = fs.existsSync(mmAppDelegateFilePath))
    ).not.toThrow();
    expect(fileExists).toBe(true);

    // eslint-disable-next-line functional/no-let
    let fileContentBuffer: Buffer | null = null;
    expect(
      () => (fileContentBuffer = fs.readFileSync(mmAppDelegateFilePath))
    ).not.toThrow();
    expect(fileContentBuffer).not.toBeNull();

    const fileContent = fileContentBuffer!.toString();
    expect(fileContent).toContain(
      "#import <UserNotifications/UserNotifications.h>"
    );
    expect(fileContent).toContain("#import <RNCPushNotificationIOS.h>");
    expect(fileContent).toContain(
      "[RNCPushNotificationIOS didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];"
    );
    expect(fileContent).toContain(
      "[RNCPushNotificationIOS didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];"
    );
    expect(fileContent).toContain(
      "[RNCPushNotificationIOS didFailToRegisterForRemoteNotificationsWithError:error];"
    );
    expect(fileContent).toContain(
      "[RNCPushNotificationIOS didReceiveNotificationResponse:response];"
    );
    expect(fileContent).toContain(
      "UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];"
    );
    expect(fileContent).toContain("center.delegate = self;");
    expect(fileContent).toContain(
      "completionHandler(UNNotificationPresentationOptionSound | UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionBadge);"
    );
  });
});
