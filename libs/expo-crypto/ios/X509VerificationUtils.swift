import Foundation
import Security

enum ValidationStatus: String, CaseIterable {
  case valid = "VALID"
  case invalidChainPath = "INVALID_CHAIN_PATH"  // Basic chain path validation failed (e.g., signature, structure)
  case invalidTrustAnchor = "INVALID_TRUST_ANCHOR"  // Provided trust anchor is invalid or does not match the chain
  case certificateExpired = "CERTIFICATE_EXPIRED"  // Certificate in the chain has expired
  case certificateNotYetValid = "CERTIFICATE_NOT_YET_VALID"  // Certificate is not yet valid
  case certificateRevoked = "CERTIFICATE_REVOKED"  // Certificate explicitly marked as revoked in CRL
  case crlFetchFailed = "CRL_FETCH_FAILED"  // Failed to download/access/validate a CRL (when CDPs were present)
  case crlParseFailed = "CRL_PARSE_FAILED"  // Failed to parse CRL content
  case crlExpired = "CRL_EXPIRED"  // CRL used is expired
  case crlSignatureInvalid = "CRL_SIGNATURE_INVALID"  // Signature on CRL is invalid
  case crlRequiredButMissingCDP = "CRL_REQUIRED_BUT_MISSING_CDP"  // CRLs required but no CDP present
  case validationError = "VALIDATION_ERROR"  // General/unexpected error during validation
}

struct ValidationResult {
  let isValid: Bool
  let status: ValidationStatus
  let errorMessage: String?
  let failingCertificateInfo: [String: String]?

  // Helper to convert to a Dictionary suitable for React Native
  func toDictionary() -> [String: Any] {
    var dict: [String: Any] = [
      "isValid": isValid,
      "status": status.rawValue,
      "errorMessage": errorMessage ?? "",
    ]
    if let certInfo = failingCertificateInfo {
      var infoWithContext = certInfo
      if infoWithContext["context"] == nil && infoWithContext["index"] == nil {
        infoWithContext["context"] =
          "Leaf certificate info provided (actual failure point may differ)"
      } else if let index = infoWithContext["index"] {
        infoWithContext["context"] =
          "Certificate at index \(index) in provided chain"
      }
      dict["failingCertificate"] = infoWithContext
    }
    return dict
  }
}

/// Configuration options for X.509 certificate validation.
struct X509VerificationOptions {
  /// Connection timeout in milliseconds (currently unused in iOS implementation).
  /// Included for API parity or future use if lower-level networking is adopted.
  let connectTimeout: Int

  /// Read timeout in milliseconds. This is used to limit the duration of CRL fetch requests.
  let readTimeout: Int

  /// If `true`, CRL (Certificate Revocation List) checks are enforced.
  /// Validation will fail if CRL cannot be fetched or parsed.
  let requireCrl: Bool
}

class X509VerificationUtils {

  static let shared = X509VerificationUtils()
  private init() {}  // Singleton pattern

  /// Verifies an X.509 certificate chain against a provided trust anchor and validation options.
  ///
  /// This function performs the following steps:
  /// 1. Decodes the base64-encoded certificate chain and trust anchor.
  /// 2. Builds the effective chain, up to and including the certificate that connects to the trust anchor.
  /// 3. Validates that the chain connects to the trust anchor at all.
  /// 4. Constructs and evaluates a `SecTrust` object using the specified anchor and policies.
  /// 5. Applies the per-certificate CRL (Certificate Revocation List) policy to the chain.
  ///
  /// The chain passed in should include the leaf and any intermediate certificates,
  /// **excluding** the trust anchor (which is provided separately).
  ///
  /// The result is returned asynchronously via the `completion` handler with a detailed `ValidationResult`.
  ///
  /// - Parameters:
  ///   - certChainBase64: An array of base64-encoded DER certificates (leaf first, excluding the trust anchor).
  ///   - trustAnchorCertBase64: A base64-encoded DER certificate representing the trust anchor (typically a self-signed root).
  ///   - options: A `X509VerificationOptions` object indicating validation behavior (e.g., CRL enforcement, timeouts).
  ///   - completion: A closure that receives the validation result.
  func verifyCertificateChain(
    certChainBase64: [String],
    trustAnchorCertBase64: String,
    options: X509VerificationOptions,
    completion: @escaping (ValidationResult) -> Void
  ) {

    // --- 1. Decode Certificates and Trust Anchor ---
    var decodedChainObjectsFromInput: [SecCertificate] = []
    let trustAnchorSecCert: SecCertificate

    guard
      let taData = Data(
        base64Encoded: trustAnchorCertBase64, options: .ignoreUnknownCharacters)
    else {
      let errorMsg = "Failed Data(base64Encoded:) for trust anchor."
      completion(
        ValidationResult(
          isValid: false, status: .invalidTrustAnchor, errorMessage: errorMsg,
          failingCertificateInfo: nil))
      return
    }
    guard let taCert = SecCertificateCreateWithData(nil, taData as CFData)
    else {
      let errorMsg =
        "Failed SecCertificateCreateWithData for trust anchor. Decoded data might not be valid DER."
      completion(
        ValidationResult(
          isValid: false, status: .invalidTrustAnchor, errorMessage: errorMsg,
          failingCertificateInfo: nil))
      return
    }
    trustAnchorSecCert = taCert

    for (index, certBase64) in certChainBase64.enumerated() {
      guard
        let certData = Data(
          base64Encoded: certBase64, options: .ignoreUnknownCharacters)
      else {
        let errorMsg =
          "Failed Data(base64Encoded:) for certificate at input index \(index)."
        completion(
          ValidationResult(
            isValid: false, status: .invalidChainPath, errorMessage: errorMsg,
            failingCertificateInfo: ["input_index": String(index)]))
        return
      }
      guard
        let certificate = SecCertificateCreateWithData(nil, certData as CFData)
      else {
        let errorMsg =
          "Failed SecCertificateCreateWithData for certificate at input index \(index). Decoded data might not be valid DER."
        completion(
          ValidationResult(
            isValid: false, status: .invalidChainPath, errorMessage: errorMsg,
            failingCertificateInfo: ["input_index": String(index)]))
        return
      }
      decodedChainObjectsFromInput.append(certificate)
    }

    if decodedChainObjectsFromInput.isEmpty {
      let errorMsg =
        certChainBase64.isEmpty
        ? "Certificate chain is empty."
        : "Certificate chain object array is empty after decoding loop, although input was not empty."
      completion(
        ValidationResult(
          isValid: false, status: .invalidChainPath, errorMessage: errorMsg,
          failingCertificateInfo: nil))
      return
    }

    // --- 1.5 Pre-check for Connection to the Trust Anchor ---
    // The effective chain runs up to and including the first certificate that either is the
    // trust anchor or is issued by it. Certificates beyond that point are extraneous and are
    // dropped rather than rejected, matching the Android implementation.
    let trustAnchorDER = SecCertificateCopyData(trustAnchorSecCert) as Data
    var effectiveChainForSecTrust: [SecCertificate] = []
    var foundConnectionToAnchor = false

    // We need the trust anchor's subject name to check if other certs are issued by it.
    guard
      let anchorSubjectName = SecCertificateCopyNormalizedSubjectSequence(
        trustAnchorSecCert)
    else {
      let errorMsg =
        "Could not get subject name for trust anchor for chain connection check."
      completion(
        ValidationResult(
          isValid: false, status: .invalidTrustAnchor, errorMessage: errorMsg,
          failingCertificateInfo: getCertificateInfo(trustAnchorSecCert)))
      return
    }

    for currentCertInInputChain in decodedChainObjectsFromInput {
      effectiveChainForSecTrust.append(currentCertInInputChain)

      // The certificate either is the trust anchor itself, or is issued by it.
      let currentCertDER =
        SecCertificateCopyData(currentCertInInputChain) as Data
      if currentCertDER == trustAnchorDER {
        foundConnectionToAnchor = true
      } else if let currentCertIssuerName =
        SecCertificateCopyNormalizedIssuerSequence(currentCertInInputChain),
        currentCertIssuerName == anchorSubjectName
      {
        foundConnectionToAnchor = true
      }

      if foundConnectionToAnchor {
        break
      }
    }

    // After the loop, if no connection was found, it's an error.
    if !foundConnectionToAnchor {
      let errorMsg =
        "Provided certificate chain does not connect to the trust anchor (neither issued by it nor is the anchor itself found appropriately)."

      let contextCert = decodedChainObjectsFromInput.last ?? trustAnchorSecCert
      completion(
        ValidationResult(
          isValid: false, status: .invalidTrustAnchor, errorMessage: errorMsg,
          failingCertificateInfo: getCertificateInfo(contextCert)))
      return
    }

    // --- 2. Perform Trust Evaluation ---
    evaluateTrust(
      certificateChain: effectiveChainForSecTrust,
      trustAnchor: trustAnchorSecCert, options: options
    ) { result in
      completion(result)
    }
  }

  // --- Trust Evaluation Helper ---
  private func evaluateTrust(
    certificateChain: [SecCertificate],
    trustAnchor: SecCertificate,
    options: X509VerificationOptions,
    completion: @escaping (ValidationResult) -> Void
  ) {
    var optionalTrust: SecTrust?

    // --- Basic Policy Only ---
    let basicX509Policy = SecPolicyCreateBasicX509()
    let currentPolicies: [SecPolicy] = [basicX509Policy]

    // --- Create SecTrust ---
    let createStatus = SecTrustCreateWithCertificates(
      certificateChain as CFArray, currentPolicies as CFArray, &optionalTrust)
    guard createStatus == errSecSuccess, let trust = optionalTrust else {
      let msg = "Failed to create SecTrust. Status: \(createStatus)"
      let info = certificateChain.first.map { getCertificateInfo($0) }
      completion(
        ValidationResult(
          isValid: false, status: .validationError, errorMessage: msg,
          failingCertificateInfo: info))
      return
    }

    // --- Configure Anchors ---
    let anchors = [trustAnchor] as CFArray
    guard SecTrustSetAnchorCertificates(trust, anchors) == errSecSuccess,
      SecTrustSetAnchorCertificatesOnly(trust, true) == errSecSuccess
    else {
      let msg = "Failed to set custom trust anchor"
      let info = getCertificateInfo(trustAnchor)
      completion(
        ValidationResult(
          isValid: false, status: .invalidTrustAnchor, errorMessage: msg,
          failingCertificateInfo: info))
      return
    }

    // --- Evaluate Trust ---
    SecTrustEvaluateAsyncWithError(
      trust, DispatchQueue.global(qos: .userInitiated)
    ) { evaluatedTrust, success, error in
      var result: ValidationResult

      if success {
        var trustResultType: SecTrustResultType = .invalid
        SecTrustGetTrustResult(evaluatedTrust, &trustResultType)
        if trustResultType == .proceed || trustResultType == .unspecified {
          result = ValidationResult(
            isValid: true, status: .valid, errorMessage: nil,
            failingCertificateInfo: nil)
        } else {
          result = self.mapErrorToValidationResult(
            trust: evaluatedTrust, resultType: trustResultType, error: error)
        }
      } else {
        var trustResultType: SecTrustResultType = .fatalTrustFailure
        SecTrustGetTrustResult(evaluatedTrust, &trustResultType)
        result = self.mapErrorToValidationResult(
          trust: evaluatedTrust, resultType: trustResultType, error: error)
      }

      // --- Manual CRL Check ---
      // Revocation is checked whenever the chain is otherwise trusted, so that a revoked
      // certificate is caught even when CRLs are not mandatory. A chain that already failed
      // path validation is reported as-is, without spending network requests on it.
      if result.isValid {
        self.evaluateCRLRevocationStatus(
          certificateChain: certificateChain, trustAnchor: trustAnchor,
          options: options, fallbackResult: result, completion: completion)
      } else {
        DispatchQueue.main.async {
          completion(result)
        }
      }
    }
  }

  // --- Error Mapping Helper ---
  private func mapErrorToValidationResult(
    trust: SecTrust, resultType: SecTrustResultType, error: Error?
  ) -> ValidationResult {
    var finalStatus: ValidationStatus = .invalidChainPath  // Start with a generic failure
    var finalMessage: String = "Certificate chain validation failed."
    var contextCertInfo: [String: String]? = nil

    // --- Get Leaf Certificate Info for Context ---
    var evaluatedChain: [SecCertificate]? = nil
    if #available(iOS 15.0, macOS 12.0, tvOS 15.0, watchOS 8.0, *) {
      if let chain = SecTrustCopyCertificateChain(trust) {
        evaluatedChain = chain as? [SecCertificate]
      }
    } else {
      let certificateCount = SecTrustGetCertificateCount(trust)
      if certificateCount > 0 {
        var chainTemp: [SecCertificate] = []
        for i in 0..<certificateCount {
          if let cert = SecTrustGetCertificateAtIndex(trust, i) {
            chainTemp.append(cert)
          }
        }
        if !chainTemp.isEmpty { evaluatedChain = chainTemp }
      }
    }
    if let chain = evaluatedChain, let leafCert = chain.first {
      contextCertInfo = getCertificateInfo(leafCert)
    }
    // --- End Leaf Certificate Info ---

    // --- Determine Status based on Error Code first ---
    if let nsError = error as NSError? {
      finalMessage = nsError.localizedDescription
      if nsError.domain == NSOSStatusErrorDomain {
        switch nsError.code {
        case Int(errSecCertificateExpired):
          finalStatus = .certificateExpired
        case Int(errSecNotTrusted), Int(errSecTrustSettingDeny):
          finalStatus = .invalidTrustAnchor
        case Int(errSecItemNotFound):
          finalStatus = .invalidChainPath
        case Int(errSecCertificateRevoked):
          finalStatus = .certificateRevoked
          finalMessage =
            "Revocation check failed: \(nsError.localizedDescription)"
        default:
          finalStatus = .invalidChainPath
        }
      } else {
        if finalStatus == .invalidChainPath { finalStatus = .validationError }
        finalMessage += " (Domain: \(nsError.domain), Code: \(nsError.code))"
      }
    } else {
      finalMessage =
        "Trust evaluation failed with result type \(resultType) but no specific error provided."
      switch resultType {
      case .proceed, .unspecified:
        finalStatus = .validationError
        finalMessage =
          "Inconsistent state: No error object, but mapping function called with result type \(resultType)."
      case .deny, .fatalTrustFailure:
        finalStatus = .invalidChainPath
        finalMessage =
          "Trust evaluation denied or fatal error. Result type: \(resultType)."
      case .recoverableTrustFailure:
        // Revocation is never evaluated here: the policy is a basic X.509 one, and CRLs are
        // checked separately. So this is always a path problem.
        finalStatus = .invalidChainPath
        finalMessage = "Recoverable trust failure (result: \(resultType))." 
      default:
        finalStatus = .invalidChainPath
        finalMessage = "Unknown trust result type without error: \(resultType)."
      }
    }
    return ValidationResult(
      isValid: false, status: finalStatus, errorMessage: finalMessage,
      failingCertificateInfo: contextCertInfo)
  }

  // Helper to extract basic info from a certificate
  private func getCertificateInfo(_ certificate: SecCertificate) -> [String:
    String]
  {
    var info: [String: String] = [:]
    info["subjectSummary"] =
      SecCertificateCopySubjectSummary(certificate) as String? ?? "Unknown"
    return info
  }

  /// Maps an `Int32` CRL validation error code (from the native C/OpenSSL layer)
  /// to a corresponding `ValidationStatus` enum case.
  ///
  /// This enables strong typing and centralized handling of known CRL errors
  /// (e.g., parse failure, signature invalidity, expiration, etc.) during
  /// manual revocation checks.
  ///
  /// - Parameter code: The error code returned by the native revocation function.
  /// - Returns: A `ValidationStatus` matching the error context, or `.validationError` as fallback.
  private func mapCRLErrorCodeToStatus(_ code: Int32) -> ValidationStatus {
    switch code {
    case -1: return .validationError
    case -2: return .crlParseFailed
    case -3: return .crlSignatureInvalid
    case -4: return .crlExpired
    case -5: return .validationError
    case -6: return .crlFetchFailed
    default: return .validationError
    }
  }

  /// Applies the per-certificate revocation policy to the chain.
  ///
  /// A certificate is checked only when it publishes at least one CRL Distribution Point.
  /// A certificate without a CDP is not checkable and is not a failure, since no CRL covering
  /// it can exist.
  ///
  /// A certificate proven to be revoked always fails validation. A certificate whose revocation
  /// status cannot be determined fails only when `requireCrl` is set. When no certificate in the
  /// chain publishes a CDP at all, `requireCrl` yields `.crlRequiredButMissingCDP`.
  ///
  /// - Parameters:
  ///   - certificateChain: The chain that was validated, leaf first, excluding the trust anchor.
  ///   - trustAnchor: The trust anchor, used as the issuer of the last certificate in the chain.
  ///   - options: The validation options in force.
  ///   - fallbackResult: The successful trust result, returned when the policy is satisfied.
  ///   - completion: Completion handler receiving the final `ValidationResult`.
  private func evaluateCRLRevocationStatus(
    certificateChain: [SecCertificate],
    trustAnchor: SecCertificate,
    options: X509VerificationOptions,
    fallbackResult: ValidationResult,
    completion: @escaping (ValidationResult) -> Void
  ) {
    var anyCdpFound = false

    func finish(_ result: ValidationResult) {
      DispatchQueue.main.async {
        completion(result)
      }
    }

    // Walks the chain sequentially, since every CRL fetch is asynchronous.
    func processCertificate(at index: Int) {
      guard index < certificateChain.count else {
        if !anyCdpFound && options.requireCrl {
          finish(
            ValidationResult(
              isValid: false,
              status: .crlRequiredButMissingCDP,
              errorMessage:
                "CRL check is mandatory, but no CRL Distribution Point was found in the certificate chain.",
              failingCertificateInfo: certificateChain.first.map {
                self.getCertificateInfo($0)
              }
            ))
        } else {
          finish(fallbackResult)
        }
        return
      }

      let cert = certificateChain[index]
      let certDER = SecCertificateCopyData(cert) as Data
      let crlURLs = X509RevocationChecker.extractCRLDistributionPoints(
        from: certDER)

      guard !crlURLs.isEmpty else {
        // Not checkable: no CRL can cover this certificate.
        processCertificate(at: index + 1)
        return
      }
      anyCdpFound = true

      // The issuer is the next certificate in the chain, or the trust anchor for the last one.
      let issuer =
        index + 1 < certificateChain.count
        ? certificateChain[index + 1] : trustAnchor
      let issuerDER = SecCertificateCopyData(issuer) as Data

      X509RevocationChecker.isCertRevokedByCRL(
        certDER: certDER, issuerDER: issuerDER, crlURLs: crlURLs,
        readTimeout: options.readTimeout
      ) { isRevoked, errorCode in
        guard let isRevoked = isRevoked else {
          // Revocation status undetermined: fatal only when CRLs are mandatory.
          if options.requireCrl {
            finish(
              ValidationResult(
                isValid: false,
                status: self.mapCRLErrorCodeToStatus(errorCode ?? -999),
                errorMessage:
                  "Mandatory CRL check failed (status code: \(errorCode ?? -999))",
                failingCertificateInfo: self.getCertificateInfo(cert)
              ))
          } else {
            processCertificate(at: index + 1)
          }
          return
        }

        if isRevoked {
          finish(
            ValidationResult(
              isValid: false,
              status: .certificateRevoked,
              errorMessage: "Certificate is revoked according to its CRL.",
              failingCertificateInfo: self.getCertificateInfo(cert)
            ))
        } else {
          processCertificate(at: index + 1)
        }
      }
    }

    processCertificate(at: 0)
  }
}
