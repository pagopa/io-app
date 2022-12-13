#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>
#import <UserNotifications/UNUserNotificationCenter.h> // react-native-push-notification-ios

@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate, UNUserNotificationCenterDelegate> // UNUserNotificationCenterDelegate react-native-push-notification-ios

@property (nonatomic, strong) UIWindow *window;

@end
