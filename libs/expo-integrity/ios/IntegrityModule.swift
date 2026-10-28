import CryptoKit
import DeviceCheck
import ExpoModulesCore
import SwiftCBOR

public final class IntegrityModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoIntegrity")

    AsyncFunction("isAttestationServiceAvailable") { (promise: Promise) in
      guard DCAppAttestService.shared.isSupported else {
        Failure.unsupportedService.reject(promise)
        return
      }
      promise.resolve(true)
    }

    AsyncFunction("generateHardwareKey") { (promise: Promise) in
      guard DCAppAttestService.shared.isSupported else {
        Failure.unsupportedService.reject(promise)
        return
      }
      DCAppAttestService.shared.generateKey { key, error in
        if let error {
          Failure.generationKeyFailed.reject(promise, error)
        } else {
          promise.resolve(key)
        }
      }
    }

    AsyncFunction("getAttestation") { (challenge: String, hardwareKeyTag: String, promise: Promise) in
      guard DCAppAttestService.shared.isSupported else {
        Failure.unsupportedService.reject(promise)
        return
      }
      guard let data = challenge.data(using: .utf8) else {
        Failure.challengeError.reject(promise)
        return
      }
      let hash = Data(SHA256.hash(data: data))
      DCAppAttestService.shared.attestKey(hardwareKeyTag, clientDataHash: hash) { attestation, error in
        if let error {
          Failure.attestationError.reject(promise, error)
        } else {
          promise.resolve(attestation?.base64EncodedString())
        }
      }
    }

    AsyncFunction("generateHardwareSignatureWithAssertion") { (clientData: String, hardwareKeyTag: String, promise: Promise) in
      guard DCAppAttestService.shared.isSupported else {
        Failure.unsupportedService.reject(promise)
        return
      }
      guard let data = clientData.data(using: .utf8) else {
        Failure.clientDataEncodingError.reject(promise)
        return
      }
      let hash = Data(SHA256.hash(data: data))
      DCAppAttestService.shared.generateAssertion(hardwareKeyTag, clientDataHash: hash) { assertion, error in
        if let error {
          Failure.generationAssertionFailed.reject(promise, error)
        } else {
          promise.resolve(assertion?.base64EncodedString())
        }
      }
    }

    AsyncFunction("decodeAssertion") { (assertion: String, promise: Promise) in
      do {
        guard let data = Data(base64Encoded: assertion) else {
          throw AssertionDecodingError.invalidFormat("Expected base64 encoded string")
        }
        guard case let .map(map) = try CBOR.decode([UInt8](data)) else {
          throw AssertionDecodingError.invalidFormat("Expected CBOR map")
        }
        guard case let .byteString(signature)? = map["signature"],
              case let .byteString(authenticatorData)? = map["authenticatorData"] else {
          throw AssertionDecodingError.invalidFormat("Expected signature and authenticatorData in the CBOR map")
        }
        promise.resolve([
          "signature": Data(signature).base64EncodedString(),
          "authenticatorData": Data(authenticatorData).base64EncodedString()
        ])
      } catch {
        Failure.decodingAssertionFailed.reject(promise, error)
      }
    }
  }

  private enum AssertionDecodingError: Error {
    case invalidFormat(String)
  }

  private enum Failure: String {
    case generationKeyFailed = "GENERATION_KEY_FAILED"
    case unsupportedService = "UNSUPPORTED_SERVICE"
    case attestationError = "ATTESTATION_ERROR"
    case challengeError = "CHALLANGE_ERROR"
    case clientDataEncodingError = "CLIENT_DATA_ENCODING_ERROR"
    case generationAssertionFailed = "GENERATION_ASSERTION_FAILED"
    case decodingAssertionFailed = "DECODING_ASSERTION_FAILED"

    func reject(_ promise: Promise, _ error: Error? = nil) {
      promise.reject(rawValue, error?.localizedDescription ?? rawValue)
    }
  }
}