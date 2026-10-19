#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

typedef void (^ZendeskCompletionBlock)(void);
typedef void (^ZendeskNumberCompletionBlock)(NSNumber * _Nullable result, NSError * _Nullable error);

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
- (void)openTicket:(ZendeskCompletionBlock)onClose;
- (void)showTickets:(ZendeskCompletionBlock)onClose;
- (void)hasOpenedTickets:(ZendeskNumberCompletionBlock)completion;
- (void)getTotalNewResponses:(ZendeskNumberCompletionBlock)completion;
- (void)setNotificationToken:(NSData *)deviceToken;
- (void)setUserIdentity:(NSDictionary *)user;
@end
