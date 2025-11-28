//
//  AppReviewModule.m
//  IO
//
//  Created by Cristiano Tofani on 19/03/25.
//

#import <Foundation/Foundation.h>

#import "React/RCTBridgeModule.h"


@interface RCT_EXTERN_MODULE(AppReviewModule, NSObject)

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

RCT_EXTERN_METHOD(requestReview)

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}


@end
