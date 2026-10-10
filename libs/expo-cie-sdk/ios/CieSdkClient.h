#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface CieSdkClient : NSObject
@property (nonatomic, readonly) NSInteger attemptsLeft;
- (BOOL)hasNFCFeature;
- (void)setCustomIdpUrl:(nullable NSString *)url;
- (void)enableLog:(BOOL)enabled;
- (void)setAlertMessage:(NSString *)key value:(NSString *)value;
- (void)authenticate:(NSString *)url pin:(NSString *)pin completed:(void (^)(NSString * _Nullable error, NSString * _Nullable response))completed;
@end

NS_ASSUME_NONNULL_END