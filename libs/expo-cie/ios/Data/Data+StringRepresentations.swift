//
//  Data+StringRepresentations.swift
//  Pods
//
//  Created by Fabio Bombardi on 02/10/25.
//

import Foundation

extension Data {
  
  /// Converts the data to an uppercase hexadecimal string.
  func toHexString() -> String {
    return self.map { String(format: "%02X", $0) }.joined()
  }
  
  /// Converts the data to a base64url encoded string (RFC 7515), without padding.
  /// - Replaces + with -, / with _, and removes trailing =
  func base64UrlEncodedString() -> String {
    return self.base64EncodedString()
      .replacingOccurrences(of: "+", with: "-")
      .replacingOccurrences(of: "/", with: "_")
      .replacingOccurrences(of: "=", with: "")
  }
}

// Convenience extension for an array of bytes ([UInt8]).
extension Array where Element == UInt8 {
  
  /// Converts the byte array to a lowercase hexadecimal string.
  func toHexString() -> String {
    return Data(self).toHexString()
  }
  
  /// Converts the byte array to a base64 encoded string.
  func base64EncodedString() -> String {
    return Data(self).base64EncodedString()
  }
  
  /// Converts the byte array to a base64url encoded string.
  func base64UrlEncodedString() -> String {
    return Data(self).base64UrlEncodedString()
  }
  
  func encodedDataString(encoding: DataEncoding) -> String {
    switch encoding {
    case .HEX:
      return Data(self).toHexString()
    case .BASE64:
      return Data(self).base64EncodedString()
    case .BASE64URL:
      return Data(self).base64UrlEncodedString()
    }
  }
}
