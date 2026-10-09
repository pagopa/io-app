#import "CieSdkClient.h"
#import <TargetConditionals.h>

#if CIE_SDK_ENABLED && !TARGET_OS_SIMULATOR
#import <iociesdkios/iociesdkios.h>

@interface CieSdkClient ()
@property (nonatomic, strong) CIEIDSdk *sdk;
@end
#endif

@implementation CieSdkClient

- (instancetype)init {
  self = [super init];
#if CIE_SDK_ENABLED && !TARGET_OS_SIMULATOR
  if (self) {
    _sdk = [[CIEIDSdk alloc] init];
  }
#endif
  return self;
}

- (NSInteger)attemptsLeft {
#if CIE_SDK_ENABLED && !TARGET_OS_SIMULATOR
  return self.sdk.attemptsLeft;
#else
  return 0;
#endif
}

- (BOOL)hasNFCFeature {
#if CIE_SDK_ENABLED && !TARGET_OS_SIMULATOR
  return [self.sdk hasNFCFeature];
#else
  return NO;
#endif
}

- (void)setCustomIdpUrl:(nullable NSString *)url {
#if CIE_SDK_ENABLED && !TARGET_OS_SIMULATOR
  [self.sdk setCustomIdpUrlWithUrl:url];
#endif
}

- (void)enableLog:(BOOL)enabled {
#if CIE_SDK_ENABLED && !TARGET_OS_SIMULATOR
  [self.sdk enableLogWithIsEnabled:enabled];
#endif
}

- (void)setAlertMessage:(NSString *)key value:(NSString *)value {
#if CIE_SDK_ENABLED && !TARGET_OS_SIMULATOR
  [self.sdk setAlertMessageWithKey:key value:value];
#endif
}

- (void)authenticate:(NSString *)url pin:(NSString *)pin completed:(void (^)(NSString * _Nullable, NSString * _Nullable))completed {
#if CIE_SDK_ENABLED && !TARGET_OS_SIMULATOR
  dispatch_async(dispatch_get_global_queue(QOS_CLASS_DEFAULT, 0), ^{
    [self.sdk postWithUrl:url pin:pin completed:completed];
  });
#else
  completed(@"CIE SDK is not available on this device", nil);
#endif
}

@end