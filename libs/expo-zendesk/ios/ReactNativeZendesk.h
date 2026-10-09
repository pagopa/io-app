#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <React/RCTBridgeModule.h>

@interface ReactNativeZendesk : NSObject
- (void)initialize:(NSDictionary *)options;
- (void)initChat:(NSString *)key;
- (void)setPrimaryColor:(NSString *)color;
- (void)showHelpCenter:(NSDictionary *)options;
- (void)addTicketCustomField:(NSString *)key withValue:(NSString *)value;
- (void)appendLog:(NSString *)log;
- (void)addTicketTag:(NSString *)tag;
- (void)resetCustomFields;
- (void)resetTags;
- (void)resetLog;
- (void)dismiss;
- (void)openTicket:(RCTResponseSenderBlock)onClose;
- (void)showTickets:(RCTResponseSenderBlock)onClose;
- (void)hasOpenedTickets:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject;
- (void)getTotalNewResponses:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject;
- (void)setNotificationToken:(NSData *)deviceToken;
- (void)setUserIdentity:(NSDictionary *)user;
@end
