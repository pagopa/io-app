import Foundation
import Security

@objc public class X509RevocationChecker: NSObject {

  /// Checks whether a certificate has been revoked, using the CRLs it publishes.
  ///
  /// Each URL is tried in order until one yields a usable CRL. A CRL is usable only when it
  /// parses, is issued by the certificate's own issuer, carries a valid signature from that
  /// issuer, and is current. The first usable CRL decides the outcome; if none is usable the
  /// revocation status is undetermined.
  ///
  /// - Parameters:
  ///   - certDER: The DER-encoded certificate to check for revocation.
  ///   - issuerDER: The DER-encoded issuer certificate, used to verify the CRL's signature.
  ///   - crlURLs: The CRL Distribution Point URLs published by the certificate.
  ///   - readTimeout: Timeout in milliseconds applied to each CRL download.
  ///   - completion: A callback that returns:
  ///     - `true` if the certificate is revoked,
  ///     - `false` if it is not revoked,
  ///     - or `nil` with an error code if the status could not be determined.
  public static func isCertRevokedByCRL(
    certDER: Data,
    issuerDER: Data,
    crlURLs: [URL],
    readTimeout: Int,
    completion: @escaping (Bool?, Int32?) -> Void
  ) {
    guard !certDER.isEmpty, !issuerDER.isEmpty else {
      completion(nil, -5)
      return
    }
    guard !crlURLs.isEmpty else {
      completion(nil, -6)
      return
    }

    // Walks the distribution points sequentially, remembering why the previous ones failed.
    func attempt(_ index: Int, lastError: Int32) {
      guard index < crlURLs.count else {
        completion(nil, lastError)
        return
      }

      fetchCRL(
        from: crlURLs[index], timeout: TimeInterval(readTimeout) / 1000.0
      ) { crlData, fetchError in
        guard let crlData = crlData, !crlData.isEmpty else {
          attempt(index + 1, lastError: fetchError ?? -6)
          return
        }

        let result = checkRevocation(
          certDER: certDER, issuerDER: issuerDER, crlData: crlData)
        switch result {
        case 1:
          completion(true, nil)
        case 0:
          completion(false, nil)
        default:
          attempt(index + 1, lastError: normalizeErrorCode(result))
        }
      }
    }

    attempt(0, lastError: -6)
  }

  /// Bridges a single CRL check down to the OpenSSL-backed native implementation.
  private static func checkRevocation(
    certDER: Data, issuerDER: Data, crlData: Data
  ) -> Int32 {
    return certDER.withUnsafeBytes { certBytes in
      crlData.withUnsafeBytes { crlBytes in
        issuerDER.withUnsafeBytes { issuerBytes in
          guard let certPtr = certBytes.baseAddress,
            let crlPtr = crlBytes.baseAddress,
            let issuerPtr = issuerBytes.baseAddress
          else {
            return Int32(-1)
          }

          return check_cert_revocation_with_crl(
            certPtr.assumingMemoryBound(to: UInt8.self),
            Int32(certDER.count),
            crlPtr.assumingMemoryBound(to: UInt8.self),
            Int32(crlData.count),
            issuerPtr.assumingMemoryBound(to: UInt8.self),
            Int32(issuerDER.count)
          )
        }
      }
    }
  }

  /// Folds the native status codes onto the set the validation layer knows how to map.
  private static func normalizeErrorCode(_ code: Int32) -> Int32 {
    switch code {
    case -2, -3, -4, -5, -6:
      return code
    default:
      // -1, -7 and any unexpected value are reported as a generic validation error.
      return -1
    }
  }

  /// Extracts the CRL Distribution Point URIs from a DER-encoded certificate.
  /// Uses OpenSSL to parse the certificate, and keeps only HTTP and HTTPS URIs.
  ///
  /// - Parameter certDER: The DER-encoded certificate from which to extract the CRL URIs.
  /// - Returns: The distribution point URLs, empty if the certificate publishes none.
  public static func extractCRLDistributionPoints(from certDER: Data) -> [URL] {
    guard !certDER.isEmpty else { return [] }

    let joined: String? = certDER.withUnsafeBytes { ptr in
      guard let base = ptr.baseAddress?.assumingMemoryBound(to: UInt8.self)
      else { return nil }
      guard
        let cString = extractCRLDistributionPointsFromCert(
          base, Int32(certDER.count))
      else {
        return nil
      }
      defer {
        free(UnsafeMutableRawPointer(mutating: cString))
      }
      return String(cString: cString)
    }

    guard let joined = joined else { return [] }

    return joined.split(separator: "\n").compactMap { line in
      let uri = String(line)
      guard uri.lowercased().hasPrefix("http://")
        || uri.lowercased().hasPrefix("https://")
      else {
        return nil
      }
      return URL(string: uri)
    }
  }

  /// Downloads the CRL from the given URL, ignoring any locally cached copy.
  ///
  /// - Parameters:
  ///   - url: The full URL of the CRL.
  ///   - timeout: Request timeout in seconds.
  ///   - completion: Callback returning the raw CRL data, or an error code on failure.
  private static func fetchCRL(
    from url: URL, timeout: TimeInterval,
    completion: @escaping (Data?, Int32?) -> Void
  ) {
    let request = URLRequest(
      url: url, cachePolicy: .reloadIgnoringLocalCacheData,
      timeoutInterval: timeout)
    let task = URLSession.shared.dataTask(with: request) {
      data, response, error in
      if error != nil {
        completion(nil, -6)
        return
      }
      if let http = response as? HTTPURLResponse, http.statusCode != 200 {
        completion(nil, -6)
        return
      }
      guard let data = data, !data.isEmpty else {
        completion(nil, -6)
        return
      }
      completion(data, nil)
    }
    task.resume()
  }
}
