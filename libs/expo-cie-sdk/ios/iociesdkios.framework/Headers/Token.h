//
//  Token.h
//  e-id
//
//  Created by ugo chirico on 22/12/2019.
//  Copyright © 2019 Francesco Tufano. All rights reserved.
//

#import <Foundation/Foundation.h>


NS_ASSUME_NONNULL_BEGIN

@interface CIEToken : NSObject


- (CIEToken*) initWithNFCToken: (NSObject*) token;

- (UInt16) authenticate;
- (UInt16) verifyPIN: (NSString*) pin;
- (UInt16) certificate: (NSMutableData*) certificate;
- (UInt16) post: (NSString*) url pin: (NSString*) pin certificate: (NSData*) certificate data: ( NSString* _Nullable ) data response: (NSMutableData*) response;

- (NSData*) transmit: (NSData*) apdu;


@end

NS_ASSUME_NONNULL_END
