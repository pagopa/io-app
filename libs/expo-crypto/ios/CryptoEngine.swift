import Foundation
import Security

typealias CryptoResolve = (Any?) -> Void
typealias CryptoReject = (String, String, NSError?) -> Void

final class CryptoEngine {
  private typealias ME = ModuleException
  private let keyConfig: KeyConfig = .ec

  func verifyCertificateChain(
    certChainBase64: NSArray,
    trustAnchorBase64: String,
    options: NSDictionary,
    resolve: @escaping CryptoResolve,
    reject: @escaping CryptoReject
  ) {
    DispatchQueue.global(qos: .userInitiated).async {
      guard let certChain = certChainBase64 as? [String] else {
        DispatchQueue.main.async {
          let errorInfo = ["message": "Invalid certificate chain format passed from React Native."]
          reject("E_INVALID_ARGS", "Invalid certificate chain format", NSError(domain: "X509VerificationUtils", code: 1001, userInfo: errorInfo))
        }
        return
      }

      guard !certChain.isEmpty else {
        DispatchQueue.main.async {
          let errorInfo = ["message": "Certificate chain array is empty."]
          reject("E_INVALID_ARGS", "Certificate chain array is empty", NSError(domain: "X509VerificationUtils", code: 1001, userInfo: errorInfo))
        }
        return
      }

      let connectTimeoutOpt = options["connectTimeout"] as? Int ?? 15000
      let readTimeoutOpt = options["readTimeout"] as? Int ?? 15000
      let requireCrlOpt = options["requireCrl"] as? Bool ?? false

      let verificationOptions = X509VerificationOptions(
        connectTimeout: connectTimeoutOpt,
        readTimeout: readTimeoutOpt,
        requireCrl: requireCrlOpt
      )

      X509VerificationUtils.shared.verifyCertificateChain(
        certChainBase64: certChain,
        trustAnchorCertBase64: trustAnchorBase64,
        options: verificationOptions
      ) { validationResult in
        let resultDict = validationResult.toDictionary()
        DispatchQueue.main.async {
          resolve(resultDict)
        }
      }
    }
  }

  func generate(
    keyTag: String,
    resolve:@escaping CryptoResolve,
    reject:@escaping CryptoReject
  ) -> Void {
    // https://reactnative.dev/docs/native-modules-ios#threading
    //
    // If only one of your methods is long-running
    // (or needs to be run on a different queue than the others for some reason),
    // you can use dispatch_async inside the method to perform that particular
    // method's code on another queue, without affecting the others:
    DispatchQueue.global().async { [weak self] in
      guard let self = self else {
        ME.threadingError.reject(reject: reject)
        return
      }
      var privateKey: SecKey?
      var status: OSStatus
      (privateKey, status) = self.keyExists(keyTag: keyTag)
      guard status == errSecItemNotFound else {
        ME.keyAlreadyExists.reject(reject: reject)
        return
      }

      do {
        privateKey = try self.generatePrivateKey(keyTag: keyTag)
      } catch {
        ME.wrongKeyConfiguration.reject(reject: reject)
        return
      }

      guard let privateKey = privateKey,
            let publicKey = SecKeyCopyPublicKey(privateKey) else {
        ME.publicKeyNotFound.reject(reject: reject)
        return
      }

      if let jwk = self.jwkRepresentation(publicKey) {
        // You can invoke callback from any thread/queue
        resolve(jwk)
        return
      }

      ME.wrongKeyConfiguration.reject(reject: reject)
    }
  }

  func deletePublicKey(
    keyTag:String,
    resolve:CryptoResolve,
    reject:CryptoReject
  ) {
    let status = SecItemDelete(privateKeyKeychainQuery(keyTag: keyTag) as CFDictionary)
    if status != errSecSuccess && status != errSecItemNotFound {
      ME.publicKeyDeletionError.reject(reject: reject, ("status", status))
      return
    }
    resolve(true)
    return
  }

  /// Returns the public key in **legacy** JWK format.
  /// - Encodes EC/RSA parameters (`x`, `y`, `n`, `e`) using **standard Base64**:
  ///   includes `+`, `/`, and padding `=`.
  /// - May contain a leading `0x00` byte in coordinates/modulus if added by
  ///   `BigInteger` two’s-complement serialization.
  /// - Kept for backward-compatibility.
  ///   For a strict RFC 7515–compliant representation, use
  ///   `getPublicKeyFixed`.
  func getPublicKey(
    keyTag:String,
    resolve:CryptoResolve,
    reject:CryptoReject
  ) {
    var privateKey: SecKey?
    var status: OSStatus

    (privateKey, status) = keyExists(keyTag: keyTag)
    guard status == errSecSuccess else {
      ME.publicKeyNotFound.reject(reject: reject)
      return
    }

    guard let privateKey = privateKey,
          let publicKey = SecKeyCopyPublicKey(privateKey) else {
      ME.publicKeyNotFound.reject(reject: reject)
      return
    }

    let jwk = jwkRepresentation(publicKey)
    resolve(jwk)
  }

  /// Returns the public key in **strict** JWK-compliant format.
  /// - Encodes EC (P-256) coordinates and RSA parameters using **Base64URL**
  ///   (RFC 7515): URL-safe alphabet, **no padding `=`**, no newlines.
  /// - Removes the leading `0x00` byte that `BigInteger.toByteArray()` may add.
  /// - Keeps legacy getPublicKey separate for backward compatibility
  func getPublicKeyFixed(
    keyTag:String,
    resolve:CryptoResolve,
    reject:CryptoReject
  ) {
    let (privateKey, status) = keyExists(keyTag: keyTag)
    guard status == errSecSuccess else {
      ModuleException.publicKeyNotFound.reject(reject: reject)
      return
    }

    guard let privateKey = privateKey,
          let publicKey = SecKeyCopyPublicKey(privateKey) else {
      ModuleException.publicKeyNotFound.reject(reject: reject)
      return
    }

    let jwk = jwkRepresentationFixed(publicKey)
    resolve(jwk)
  }

  /// Always rejects the promise with UNSUPPORTED_DEVICE error as this method is Android only. It's still implemented to keep the same error structure.
  func isKeyStrongboxBacked(
    keyTag:String,
    resolve:CryptoResolve,
    reject:CryptoReject
  ) {
    ME.unsupportedDevice.reject(reject: reject)
  }

  private func generatePrivateKey(keyTag: String) throws -> SecKey? {
    var error: Unmanaged<CFError>?

    // Key ACL
    guard let access = SecAccessControlCreateWithFlags(
      kCFAllocatorDefault,
      kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
      .privateKeyUsage, // signing and verification
      &error
    ) else {
      throw error!.takeRetainedValue() as Error
    }

    // Key Attributes
    let attributes: NSMutableDictionary = [
      kSecAttrKeyType: keyConfig.keyType(),
      kSecAttrKeySizeInBits: keyConfig.keySizeInBits(),
      kSecPrivateKeyAttrs: [
        kSecAttrIsPermanent: true,
        kSecAttrApplicationTag: keyTag.data(using: .utf8)!,
        kSecAttrAccessControl: access
      ]
    ]

    if keyConfig == .ec {
      attributes[kSecAttrTokenID] = kSecAttrTokenIDSecureEnclave
    }

    guard let key = SecKeyCreateRandomKey(attributes, &error) else {
      throw error!.takeRetainedValue() as Error
    }
    return key
  }

  /// For an elliptic curve public key, the format follows the ANSI X9.63 standard using a byte string of 04 || X || Y
  /// https://developer.apple.com/documentation/security/1643698-seckeycopyexternalrepresentation
  private func jwkRepresentation(_ publicKey: SecKey) -> [String:String]? {
    if let publicKeyExtneralRepresentation
        = SecKeyCopyExternalRepresentation(publicKey, nil) as? Data {
      var publicKeyBytes: [UInt8] = []
      publicKeyBytes = Array(publicKeyExtneralRepresentation)

      // Sanity checks
      // 04 || X || Y -> "04" = 1, X = 32, Y = 32 -> 1+32+32 = 65
      guard publicKeyBytes.count == 65 else {
        return nil
      }

      let xOctets = publicKeyBytes[1...32]
      let yOctets = publicKeyBytes[33...64]
      let y = String(decoding: Data(yOctets).base64EncodedData(), as: UTF8.self)
      let x = String(decoding: Data(xOctets).base64EncodedData(), as: UTF8.self)
      // https://www.rfc-editor.org/rfc/rfc7517
      // https://www.rfc-editor.org/rfc/rfc7518.html#page-6
      let jwk: [String:String]  = [
        "kty":"EC",
        "crv":"P-256",
        "x":"\(x)",
        "y":"\(y)"
      ]
      return jwk
    }
    return [:]
  }

  /// Converts an EC public key into a JWK-compliant dictionary with Base64URL-encoded x and y
  /// - Uses ANSI X9.63 format: 04 || X || Y
  /// - Strips the leading byte 0x04 and encodes remaining 32-byte x and y using base64url
  private func jwkRepresentationFixed(_ publicKey: SecKey) -> [String:String]? {
    guard let publicKeyData = SecKeyCopyExternalRepresentation(publicKey, nil) as? Data else {
      return nil
    }
    guard publicKeyData.count == 65, publicKeyData.first == 0x04 else {
      return nil
    }

    let x = publicKeyData.subdata(in: 1..<33).base64UrlEncodedString()
    let y = publicKeyData.subdata(in: 33..<65).base64UrlEncodedString()

    return [
      "kty": "EC",
      "crv": "P-256",
      "x": x,
      "y": y
    ]
  }

  func signUTF8Text(
    message: String,
    keyTag: String,
    resolve:@escaping CryptoResolve,
    reject:@escaping CryptoReject
  ) {
    DispatchQueue.global().async { [weak self] in
      guard let self = self else {
        ME.threadingError.reject(reject: reject)
        return
      }
      guard let messageData = message.data(using: .utf8) else {
        ME.invalidUTF8Encoding.reject(reject: reject)
        return
      }
      let key: SecKey?
      let status: OSStatus
      (key, status) = self.keyExists(keyTag: keyTag)
      guard let key = key, status == errSecSuccess else {
        ME.publicKeyNotFound.reject(reject: reject)
        return
      }
      let signature: Data?
      let error: Error?
      (signature, error) = self.signData(
        messageData, key,
        self.keyConfig.keySignAlgorithm()
      )
      guard let signature = signature, error == nil else {
        ME.unableToSign.reject(
          reject: reject,
          ("error", error?.localizedDescription ?? "")
        )
        return
      }
      resolve(
        String(
          decoding: Data(signature).base64EncodedData(),
          as: UTF8.self
        )
      )
    }
  }

  private func signData(
    _ message: Data,
    _ privateKey: SecKey,
    _ signAlgorithm: SecKeyAlgorithm
  ) -> (Data?, Error?) {
    var error: Unmanaged<CFError>?
    guard let signature = SecKeyCreateSignature(
      privateKey,
      signAlgorithm,
      message as CFData,
      &error
    ) as Data? else {
      return (nil, error!.takeRetainedValue() as Error)
    }
    return (signature, nil)
  }

  // https://developer.apple.com/documentation/security/certificate_key_and_trust_services/keys/storing_keys_in_the_keychain
  private func keyExists(keyTag: String) -> (key: SecKey?, status: OSStatus) {
    let getQuery = privateKeyKeychainQuery(keyTag: keyTag)
    var item: CFTypeRef?
    let status = SecItemCopyMatching(getQuery as CFDictionary, &item)
    return (status == errSecSuccess ? (item as! SecKey) : nil, status)
  }

  private func privateKeyKeychainQuery(
    keyTag: String
  ) -> [String : Any] {
    return [
      kSecClass as String: kSecClassKey,
      kSecAttrApplicationTag as String: keyTag,
      kSecAttrKeyType as String: keyConfig.keyType(),
      kSecReturnRef as String: true
    ]
  }

  /// On iOS we support only EC but we put all EC config in an enum
  /// to support future different key types.
  private enum KeyConfig: Int, CaseIterable {
    case ec

    func keyType() -> CFString {
      switch self {
      case .ec:
        return kSecAttrKeyTypeECSECPrimeRandom
      }
    }

    func keySizeInBits() -> Int {
      switch self {
      case .ec:
        return 256
      }
    }

    func keySignAlgorithm() -> SecKeyAlgorithm {
      switch self {
      case .ec:
        return .ecdsaSignatureMessageX962SHA256
      }
    }
  }

  private enum ModuleException: String, CaseIterable {
    case keyAlreadyExists = "KEY_ALREADY_EXISTS"
    case unsupportedDevice = "UNSUPPORTED_DEVICE"
    case wrongKeyConfiguration = "WRONG_KEY_CONFIGURATION"
    case publicKeyNotFound = "PUBLIC_KEY_NOT_FOUND"
    case publicKeyDeletionError = "PUBLIC_KEY_DELETION_ERROR"
    case keychainLoadFailed = "KEYCHAIN_LOAD_FAILED"
    case invalidUTF8Encoding = "INVALID_UTF8_ENCODING"
    case unableToSign = "UNABLE_TO_SIGN"
    case threadingError = "THREADING_ERROR"
    case certificatesValidationError = "CERTIFICATE_CHAIN_VALIDATION_ERROR"

    func error(userInfo: [String : Any]? = nil) -> NSError {
      switch self {
      case .keyAlreadyExists:
        return NSError(domain: self.rawValue, code: -1, userInfo: userInfo)
      case .unsupportedDevice:
        return NSError(domain: self.rawValue, code: -1, userInfo: userInfo)
      case .wrongKeyConfiguration:
        return NSError(domain: self.rawValue, code: -1, userInfo: userInfo)
      case .publicKeyNotFound:
        return NSError(domain: self.rawValue, code: -1, userInfo: userInfo)
      case .publicKeyDeletionError:
        return NSError(domain: self.rawValue, code: -1, userInfo: userInfo)
      case .keychainLoadFailed:
        return NSError(domain: self.rawValue, code: -1, userInfo: userInfo)
      case .invalidUTF8Encoding:
        return NSError(domain: self.rawValue, code: -1, userInfo: userInfo)
      case .unableToSign:
        return NSError(domain: self.rawValue, code: -1, userInfo: userInfo)
      case .threadingError:
        return NSError(domain: self.rawValue, code: -1, userInfo: userInfo)
      case .certificatesValidationError:
        return NSError(domain: self.rawValue, code: -1, userInfo: userInfo)
      }
    }

    func reject(reject: CryptoReject, _ moreUserInfo: (String, Any)...) {
      var userInfo = [String : Any]()
      moreUserInfo.forEach { userInfo[$0.0] = $0.1 }
      let error = error(userInfo: userInfo)
      reject("\(error.code)", error.domain, error)
    }
  }
}

extension Data {
  /// Converts the data to a base64url string (RFC 7515), without padding
  /// - Replaces + with -, / with _, and removes trailing =
  func base64UrlEncodedString() -> String {
    return self.base64EncodedString()
      .replacingOccurrences(of: "+", with: "-")
      .replacingOccurrences(of: "/", with: "_")
      .replacingOccurrences(of: "=", with: "")
  }
}

