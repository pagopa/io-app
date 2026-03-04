//
//  QRCodeGenerator.m
//  IO
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(QRCodeGenerator, NSObject)

RCT_EXTERN_METHOD(generate:(NSString *)data
                  size:(double)size
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
