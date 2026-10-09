import CieSDK
import ExpoModulesCore
import Foundation

public class CieModule: Module {
  private let cieSdk = CieDigitalId()

  public func definition() -> ModuleDefinition {
    Name("ExpoCie")
    Events(
      "onEvent",
      "onError",
      "onAttributesSuccess",
      "onInternalAuthenticationSuccess",
      "onMRTDWithPaceSuccess",
      "onInternalAuthAndMRTDWithPaceSuccess",
      "onSuccess",
      "onCertificateSuccess"
    )

    Function("hasNfcFeature") { true }
    Function("isNfcEnabled") { CieDigitalId.isNFCEnabled() }
    Function("isCieAuthenticationSupported") { CieDigitalId.isNFCEnabled() }
    Function("openNfcSettings") { false }

    Function("setAlertMessage") { (key: String, value: String) in
      self.cieSdk.setAlertMessage(key: key, value: value)
    }
    Function("setCurrentAlertMessage") { (value: String) in
      self.cieSdk.alertMessage = value
    }
    Function("setCustomIdpUrl") { (url: String) in
      self.cieSdk.idpUrl = url
    }

    AsyncFunction("startInternalAuthentication") { (challenge: String, encodingString: String, _: Int) async throws in
      do {
        let response = try await self.cieSdk.performInternalAuthentication(
          challenge: Array(challenge.utf8), self.handleReadEvent
        )
        let encoding = DataEncoding.from(string: encodingString)
        self.sendEvent("onInternalAuthenticationSuccess", [
          "nis": response.nis.encodedDataString(encoding: encoding),
          "publicKey": response.publicKey.encodedDataString(encoding: encoding),
          "sod": response.sod.encodedDataString(encoding: encoding),
          "signedChallenge": response.signedChallenge.encodedDataString(encoding: encoding)
        ])
      } catch let error as NfcDigitalIdError {
        self.handleReadError(error)
      }
    }

    AsyncFunction("startMRTDReading") { (can: String, encodingString: String, _: Int) async throws in
      do {
        let response = try await self.cieSdk.performMtrd(can: can, self.handleReadEvent)
        let encoding = DataEncoding.from(string: encodingString)
        self.sendEvent("onMRTDWithPaceSuccess", [
          "dg1": response.dg1.encodedDataString(encoding: encoding),
          "dg11": response.dg11.encodedDataString(encoding: encoding),
          "sod": response.sod.encodedDataString(encoding: encoding)
        ])
      } catch let error as NfcDigitalIdError {
        self.handleReadError(error)
      }
    }

    AsyncFunction("startInternalAuthAndMRTDReading") { (can: String, challenge: String, encodingString: String, _: Int) async throws in
      do {
        let (mrtd, internalAuth) = try await self.cieSdk.performMRTDAndInternalAuthentication(
          challenge: Array(challenge.utf8), can: can, self.handleReadEvent
        )
        let encoding = DataEncoding.from(string: encodingString)
        self.sendEvent("onInternalAuthAndMRTDWithPaceSuccess", [
          "nis_data": [
            "nis": internalAuth.nis.encodedDataString(encoding: encoding),
            "publicKey": internalAuth.publicKey.encodedDataString(encoding: encoding),
            "sod": internalAuth.sod.encodedDataString(encoding: encoding),
            "signedChallenge": internalAuth.signedChallenge.encodedDataString(encoding: encoding)
          ],
          "mrtd_data": [
            "dg1": mrtd.dg1.encodedDataString(encoding: encoding),
            "dg11": mrtd.dg11.encodedDataString(encoding: encoding),
            "sod": mrtd.sod.encodedDataString(encoding: encoding)
          ]
        ])
      } catch let error as NfcDigitalIdError {
        self.handleReadError(error)
      }
    }

    AsyncFunction("startReadingAttributes") { (_: Int) async throws in
      do {
        let atr = try await self.cieSdk.performReadAtr(self.handleReadEvent)
        self.sendEvent("onAttributesSuccess", [
          "type": CIEType.fromATR(atr).rawValue,
          "atr": Data(atr).base64EncodedString()
        ])
      } catch let error as NfcDigitalIdError {
        self.handleReadError(error)
      }
    }

    AsyncFunction("startReading") { (pin: String, authUrl: String, _: Int) async throws in
      guard pin.count == 8, pin.allSatisfy(\.isNumber) else {
        throw nativeError("PIN_REGEX_NOT_VALID", "Pin must be exactly 8 digits")
      }
      guard let url = URL(string: authUrl) else {
        throw nativeError("INVALID_AUTH_URL", "Auth URL is invalid")
      }
      do {
        let result = try await self.cieSdk.performAuthentication(
          forUrl: url.absoluteString, withPin: pin, self.handleReadEvent
        )
        self.sendEvent("onSuccess", ["url": result])
      } catch let error as NfcDigitalIdError {
        self.handleReadError(error)
      }
    }

    AsyncFunction("startReadingCertificate") { (pin: String, _: Int) async throws in
      guard pin.count == 8, pin.allSatisfy(\.isNumber) else {
        throw nativeError("PIN_REGEX_NOT_VALID", "Pin must be exactly 8 digits")
      }
      do {
        let data = try await self.cieSdk.performCertificate(withPin: pin, self.handleReadEvent)
        var payload: [String: String] = [:]
        if let value = data.name { payload["name"] = value }
        if let value = data.surname { payload["surname"] = value }
        if let value = data.docSerialNumber { payload["docSerialNumber"] = value }
        if let value = data.fiscalCode { payload["fiscalCode"] = value }
        self.sendEvent("onCertificateSuccess", payload)
      } catch let error as NfcDigitalIdError {
        self.handleReadError(error)
      }
    }

    Function("setLogMode") { (mode: String) in
      let logMode = CieDigitalId.LogMode(rawValue: mode) ?? .disabled
      self.cieSdk.setLogMode(logMode)
    }
    AsyncFunction("getLogsFilePath") { () throws -> String in
      guard let path = CieDigitalId.retriveLastLogFilePath() else {
        throw nativeError("UNEXPECTED_ERROR", "Failed to retrieve last log file path")
      }
      return path
    }
    AsyncFunction("getLogs") { () throws -> String in
      guard let logs = CieDigitalId.retriveLastLogFile() else {
        throw nativeError("UNEXPECTED_ERROR", "Failed to retrieve last log")
      }
      return logs
    }
    AsyncFunction("stopReading") { () in }
  }

  private func handleReadEvent(event: CieSDK.CieDigitalIdEvent, progress: Float) {
    sendEvent("onEvent", ["name": "\(event)", "progress": progress])
  }

  private func handleReadError(_ error: NfcDigitalIdError) {
    var name = "GENERIC_ERROR"
    var payload: [String: Any] = [:]
    switch error {
    case .invalidTag:
      name = "NOT_A_CIE"
    case .nfcError(let nfcError):
      switch nfcError.code {
      case .readerTransceiveErrorTagConnectionLost, .readerTransceiveErrorTagResponseError:
        name = "TAG_LOST"
      case .readerSessionInvalidationErrorUserCanceled:
        name = "CANCELLED_BY_USER"
      default:
        break
      }
    case .errorBuildingApdu, .responseError:
      name = "APDU_ERROR"
    case .wrongPin(let attemptsLeft):
      name = "WRONG_PIN"
      payload["attemptsLeft"] = attemptsLeft
    case .wrongCan:
      name = "WRONG_CAN"
    case .cardBlocked:
      name = "CARD_BLOCKED"
    case .sslError:
      name = "CERTIFICATE_EXPIRED"
    default:
      break
    }
    payload["name"] = name
    payload["message"] = error.description
    sendEvent("onError", payload)
  }
}

private func nativeError(_ code: String, _ message: String) -> NSError {
  NSError(domain: code, code: 1, userInfo: [NSLocalizedDescriptionKey: message])
}