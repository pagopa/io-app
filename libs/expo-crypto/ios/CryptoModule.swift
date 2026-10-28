import ExpoModulesCore

public final class CryptoModule: Module {
  private let engine = CryptoEngine()

  public func definition() -> ModuleDefinition {
    Name("IOCrypto")

    AsyncFunction("generate") { (keyTag: String, promise: Promise) in
      self.engine.generate(keyTag: keyTag, resolve: promise.resolver, reject: self.rejecter(promise))
    }
    AsyncFunction("getPublicKey") { (keyTag: String, promise: Promise) in
      self.engine.getPublicKey(keyTag: keyTag, resolve: promise.resolver, reject: self.rejecter(promise))
    }
    AsyncFunction("getPublicKeyFixed") { (keyTag: String, promise: Promise) in
      self.engine.getPublicKeyFixed(keyTag: keyTag, resolve: promise.resolver, reject: self.rejecter(promise))
    }
    AsyncFunction("deletePublicKey") { (keyTag: String, promise: Promise) in
      self.engine.deletePublicKey(keyTag: keyTag, resolve: promise.resolver, reject: self.rejecter(promise))
    }
    AsyncFunction("signUTF8Text") { (message: String, keyTag: String, promise: Promise) in
      self.engine.signUTF8Text(message: message, keyTag: keyTag, resolve: promise.resolver, reject: self.rejecter(promise))
    }
    AsyncFunction("isKeyStrongboxBacked") { (keyTag: String, promise: Promise) in
      self.engine.isKeyStrongboxBacked(keyTag: keyTag, resolve: promise.resolver, reject: self.rejecter(promise))
    }
    AsyncFunction("verifyCertificateChain") {
      (chain: [String], anchor: String, options: [String: Any], promise: Promise) in
      self.engine.verifyCertificateChain(
        certChainBase64: chain as NSArray,
        trustAnchorBase64: anchor,
        options: options as NSDictionary,
        resolve: promise.resolver,
        reject: self.rejecter(promise)
      )
    }
  }

  private func rejecter(_ promise: Promise) -> CryptoReject {
    return { code, message, error in
      promise.resolve([
        "cryptoError": [
          "code": code,
          "message": message,
          "userInfo": error?.userInfo ?? [:]
        ]
      ])
    }
  }
}