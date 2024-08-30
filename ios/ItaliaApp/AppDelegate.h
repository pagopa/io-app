#import <RCTAppDelegate.h>
#import <UIKit/UIKit.h>
#import <UserNotifications/UNUserNotificationCenter.h> // react-native-push-notification-ios

@interface AppDelegate : RCTAppDelegate <UNUserNotificationCenterDelegate> // UNUserNotificationCenterDelegate react-native-push-notification-ios

@end
