#import <Foundation/Foundation.h>
#import "ItaliaApp-Bridging-Header.h"
#import <React/RCTUtils.h>
#import <React/RCTLog.h>
#import <AuthenticationServices/ASWebAuthenticationSession.h>
#import <AuthenticationServices/AuthenticationServices.h>


@interface secureLogin() <ASWebAuthenticationPresentationContextProviding>

@property (nonatomic,strong) ASWebAuthenticationSession *authSession;
@end

@implementation secureLogin
RCT_EXPORT_MODULE()

- (ASPresentationAnchor)presentationAnchorForWebAuthenticationSession:(ASWebAuthenticationSession *)session API_AVAILABLE(ios(13.0)){
  return UIApplication.sharedApplication.keyWindow;
}

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

RCT_EXPORT_METHOD(signIn:(NSURL *)url urlScheme:(NSString *)urlScheme callback:(RCTResponseSenderBlock)callback)
{
  if (!url || !urlScheme) {
    RCTLogError(@"Missing params");
    return;
  }
  if(@available(iOS 13.0, *)){
   
    self.authSession =
    [[ASWebAuthenticationSession alloc] initWithURL:url
                                  callbackURLScheme: urlScheme
                                  completionHandler:^(NSURL * _Nullable callbackUrl,
                                                      NSError * _Nullable error) {
      self.authSession = nil;
      if (callbackUrl) {
        NSString *callbackUrlString = callbackUrl.absoluteString;
        callback(@[callbackUrlString]);
      }
      else {
        NSString *errorString = error.domain;
        callback(@[errorString]);
      }
    }];
    
   
    self.authSession.prefersEphemeralWebBrowserSession = true;
    self.authSession.presentationContextProvider = self;
    [self.authSession start];
    
  }else{
    RCTLogError(@"This iOS version is not supported");
    return;
  }
  
}

@end
