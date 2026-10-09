import ExpoModulesCore

public class ExpoCieSdkModule: Module {
  private let client = CieSdkClient()
  private var pin = ""
  private var authenticationUrl = ""

  public func definition() -> ModuleDefinition {
    Name("ExpoCieSdk")
    Events("onEvent", "onSuccess", "onError")

    AsyncFunction("setPin") { (pin: String) in
      self.pin = pin
    }
    Function("setAuthenticationUrl") { (url: String) in
      self.authenticationUrl = url
    }
    Function("setCustomIdpUrl") { (url: String?) in
      self.client.setCustomIdpUrl(url)
    }
    Function("enableLog") { (enabled: Bool) in
      self.client.enableLog(enabled)
    }
    Function("setAlertMessage") { (key: String, value: String) in
      self.client.setAlertMessage(key, value: value)
    }
    AsyncFunction("start") {
      guard self.client.hasNFCFeature() else {
        throw CieSdkUnavailableException()
      }
      self.client.authenticate(self.authenticationUrl, pin: self.pin) { [weak self] error, response in
        guard let self else { return }
        if let error {
          self.sendEvent("onEvent", ["event": error, "attemptsLeft": self.client.attemptsLeft])
        } else if let response {
          self.sendEvent("onSuccess", ["event": response, "attemptsLeft": self.client.attemptsLeft])
        }
      }
    }
    AsyncFunction("hasNFCFeature") { self.client.hasNFCFeature() }
    AsyncFunction("hasApiLevelSupport") { self.client.hasNFCFeature() }
    AsyncFunction("isNFCEnabled") { self.client.hasNFCFeature() }
    AsyncFunction("startListeningNFC") {
      guard self.client.hasNFCFeature() else {
        throw CieSdkUnavailableException()
      }
    }
    AsyncFunction("stopListeningNFC") {}
    AsyncFunction("openNFCSettings") { throw CieSdkUnavailableException() }
    AsyncFunction("launchCieID") { throw CieSdkUnavailableException() }
  }
}

private class CieSdkUnavailableException: Exception {
  override var reason: String { "CIE SDK operation is not available on this device" }
}