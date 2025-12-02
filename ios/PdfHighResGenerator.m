//
//  PdfHighResGenerator.m
//  IO
//
//  Created by Emanuele Dall'Ara on 28/11/25.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(PdfHighResGenerator, NSObject)

RCT_EXTERN_METHOD(generate:(NSString *)filePath
                  scale:(double)scale
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
