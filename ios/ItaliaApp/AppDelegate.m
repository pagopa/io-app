/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <React/RCTPushNotificationManager.h>
#import <React/RCTLinkingManager.h>

#import "RNSplashScreen.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication annotation:(id)annotation
{
  return [RCTLinkingManager application:application openURL:url
                      sourceApplication:sourceApplication annotation:annotation];
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    if ([self isDeviceJailBroken]) {
      self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
      UIViewController *rootViewController = [UIViewController new];
      rootViewController.view.backgroundColor = UIColor.whiteColor;
      self.window.rootViewController = rootViewController;
      [self.window makeKeyAndVisible];
      //show popup
      UIAlertController * alert=   [UIAlertController
                                    alertControllerWithTitle:@"Device rooted"
                                    message:@"This device is rooted, you can't use this app"
                                    preferredStyle:UIAlertControllerStyleAlert];
      
      UIViewController *vc = [[[[UIApplication sharedApplication] delegate] window] rootViewController];
      [vc presentViewController:alert animated:YES completion:nil];
    } else {
      //continue
      RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
      RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                       moduleName:@"ItaliaApp"
                                                initialProperties:nil];
      
      rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];
      
      self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
      UIViewController *rootViewController = [UIViewController new];
      rootViewController.view = rootView;
      self.window.rootViewController = rootViewController;
      [self.window makeKeyAndVisible];
      
      // see https://github.com/crazycodeboy/react-native-splash-screen#third-stepplugin-configuration
      [RNSplashScreen show];
    }
  
  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}


// Required to register for notifications
- (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings
{
  [RCTPushNotificationManager didRegisterUserNotificationSettings:notificationSettings];
}
// Required for the register event.
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  [RCTPushNotificationManager didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}
// Required for the notification event. You must call the completion handler after handling the remote notification.
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  [RCTPushNotificationManager didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}
// Required for the registrationError event.
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
  [RCTPushNotificationManager didFailToRegisterForRemoteNotificationsWithError:error];
}
// Required for the localNotification event.
- (void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification
{
  [RCTPushNotificationManager didReceiveLocalNotification:notification];
}

// Check if the device is jailbroken
-(BOOL)isDeviceJailBroken
{
  #if !(TARGET_IPHONE_SIMULATOR)
    // Check 1 : existence of files that are common for jailbroken devices
    if ([[NSFileManager defaultManager] fileExistsAtPath:@"/Applications/Cydia.app"] ||
        [[NSFileManager defaultManager] fileExistsAtPath:@"/Library/MobileSubstrate/MobileSubstrate.dylib"] ||
        [[NSFileManager defaultManager] fileExistsAtPath:@"/bin/bash"] ||
        [[NSFileManager defaultManager] fileExistsAtPath:@"/usr/sbin/sshd"] ||
        [[NSFileManager defaultManager] fileExistsAtPath:@"/etc/apt"] ||
        [[NSFileManager defaultManager] fileExistsAtPath:@"/private/var/lib/apt/"] ||
        [[UIApplication sharedApplication] canOpenURL:[NSURL URLWithString:@"cydia://package/com.example.package"]]) {
          return YES;
    }
    FILE *f = NULL ;
    if ((f = fopen("/bin/bash", "r")) ||
        (f = fopen("/Applications/Cydia.app", "r")) ||
        (f = fopen("/Library/MobileSubstrate/MobileSubstrate.dylib", "r")) ||
        (f = fopen("/usr/sbin/sshd", "r")) ||
        (f = fopen("/usr/bin/ssh", "r")) ||
        (f = fopen("/etc/apt", "r"))) {
          fclose(f);
          return YES;
    }
    fclose(f);
    // Check 2 : Reading and writing in system directories (sandbox violation)
    NSError *error;
    NSString *stringToBeWritten = @"Jailbreak Test.";
    [stringToBeWritten writeToFile:@"/private/jailbreak.txt" atomically:YES
                          encoding:NSUTF8StringEncoding error:&error];
    if(error==nil){
      //Device is jailbroken
      return YES;
    } else {
      [[NSFileManager defaultManager] removeItemAtPath:@"/private/jailbreak.txt" error:nil];
    }
  #endif
  return NO;
  
}


// Code used to replace the main view with a blank one when application is in background.
// Taken from @https://pinkstone.co.uk/how-to-control-the-preview-screenshot-in-the-ios-multitasking-switcher/
- (void)applicationWillResignActive:(UIApplication *)application {

     // Fill screen with our own colour
    UIView *colourView = [[UIView alloc]initWithFrame:self.window.frame];
    colourView.backgroundColor = [UIColor whiteColor];
    colourView.tag = 1234;
    colourView.alpha = 0;
    [self.window addSubview:colourView];
    [self.window bringSubviewToFront:colourView];

     // Fade in the view
    [UIView animateWithDuration:0.5 animations:^{
        colourView.alpha = 1;
    }];
}

- (void)applicationDidBecomeActive:(UIApplication *)application {

     // Grab a reference to our coloured view
    UIView *colourView = [self.window viewWithTag:1234];

     // Fade away colour view from main view
    [UIView animateWithDuration:0.5 animations:^{
        colourView.alpha = 0;
    } completion:^(BOOL finished) {
        // Remove when finished fading
        [colourView removeFromSuperview];
    }];
}

@end
