package expo.modules.crypto

import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class CryptoModule : Module() {
  private val engine = CryptoEngine()

  override fun definition() = ModuleDefinition {
    Name("IOCrypto")

    AsyncFunction("generate") { keyTag: String, promise: Promise ->
      engine.generate(keyTag, promise)
    }
    AsyncFunction("getPublicKey") { keyTag: String, promise: Promise ->
      engine.getPublicKey(keyTag, promise)
    }
    AsyncFunction("getPublicKeyFixed") { keyTag: String, promise: Promise ->
      engine.getPublicKeyFixed(keyTag, promise)
    }
    AsyncFunction("deletePublicKey") { keyTag: String, promise: Promise ->
      engine.deletePublicKey(keyTag, promise)
    }
    AsyncFunction("signUTF8Text") { message: String, keyTag: String, promise: Promise ->
      engine.signUTF8Text(message, keyTag, promise)
    }
    AsyncFunction("isKeyStrongboxBacked") { keyTag: String, promise: Promise ->
      engine.isKeyStrongboxBacked(keyTag, promise)
    }
    AsyncFunction("verifyCertificateChain") {
      chain: List<String>, anchor: String, options: Map<String, Any?>, promise: Promise ->
      engine.verifyCertificateChain(chain, anchor, options, promise)
    }

    OnDestroy {
      engine.invalidate()
    }
  }
}