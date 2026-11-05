package expo.modules.crypto

import android.os.Build
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyInfo
import android.security.keystore.KeyProperties.*
import android.util.Base64
import androidx.annotation.RequiresApi
import expo.modules.kotlin.Promise
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import java.security.*
import java.security.interfaces.ECPublicKey
import java.security.interfaces.RSAPublicKey
import java.security.spec.AlgorithmParameterSpec
import java.security.spec.ECGenParameterSpec
import java.security.spec.RSAKeyGenParameterSpec
import org.bouncycastle.util.BigIntegers

internal class CryptoEngine {

  // Create a CoroutineScope tied to the IO dispatcher for background work.
  // Use SupervisorJob so if one job fails, it doesn't cancel the whole scope.
  // IMPORTANT: Cancel this scope when the module is destroyed to avoid leaks.
  private val moduleScope = CoroutineScope(Dispatchers.IO + SupervisorJob())

  var threadHandle: Thread? = null

  private val keyStore: KeyStore? by lazy {
    try {
      KeyStore.getInstance(KEYSTORE_PROVIDER).also {
        it.load(null)
      }
    } catch (e: Exception) {
      null
    }
  }

  fun generate(
    keyTag: String,
    promise: Promise
  ) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      // Start the local reference: a previous worker may clear threadHandle in its finally.
      val worker = Thread {
        generate(KeyConfig.EC_P_256, true, keyTag, promise)
        return@Thread
      }
      threadHandle = worker
      worker.start()
    } else {
      ModuleException.API_LEVEL_NOT_SUPPORTED.reject(promise)
    }
  }

  @RequiresApi(Build.VERSION_CODES.M)
  private fun generate(
    keyConfig: KeyConfig,
    strongBox: Boolean,
    keyTag: String,
    promise: Promise
  ) {
    // https://reactnative.dev/docs/native-modules-android#threading
    //
    // To date, on Android, all native module async methods execute on one thread.
    // Native modules should not have any assumptions about what thread
    // they are being called on, as the current assignment is subject to change
    // in the future.
    // If a blocking call is required, the heavy work
    // should be dispatched to an internally managed worker thread,
    // and any callbacks distributed from there.
    try {
      // https://developer.android.com/reference/java/security/KeyPairGenerator#generateKeyPair()
      // KeyPairGenerator.generateKeyPair will generate a new key pair every time it is called
      if (keyExists(keyTag)) {
        ModuleException.KEY_ALREADY_EXISTS.reject(
          promise, Pair("keyTag", keyTag)
        )
        return
      }
      val keySpecGenerator = KeyGenParameterSpec.Builder(
        keyTag, PURPOSE_SIGN
      ).apply {
        keyConfig.algorithmParam?.let {
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            setIsStrongBoxBacked(strongBox)
          }
          if (keyConfig == KeyConfig.EC_P_256) {
            setAlgorithmParameterSpec(ECGenParameterSpec(it))
          } else {
            setAlgorithmParameterSpec(
              RSAKeyGenParameterSpec(
                // RSA key size must be >= 512 and <= 8192
                it.toInt(),
                RSAKeyGenParameterSpec.F4 // 65537
              )
            )
          }
        }
        setDigests(
          DIGEST_SHA256,
        )
        if (keyConfig == KeyConfig.RSA) {
          // or SIGNATURE_PADDING_RSA_PKCS1
          // https://crypto.stackexchange.com/questions/48407/should-i-be-using-pkcs1-v1-5-or-pss-for-rsa-signatures
          setSignaturePaddings(SIGNATURE_PADDING_RSA_PSS)
        }
      }
      val keySpec: AlgorithmParameterSpec = keySpecGenerator.build()
      val keyPairGenerator = KeyPairGenerator.getInstance(
        keyConfig.algorithm,
        KEYSTORE_PROVIDER
      ).also { it.initialize(keySpec) }
      val keyPair = keyPairGenerator.generateKeyPair()
      ensureKeyHardwareBacked(keyTag)
      val publicKey = keyPair.public
      publicKeyToJwk(publicKey)?.let {
        promise.resolve(it)
        return
      }
      ModuleException.WRONG_KEY_CONFIGURATION.reject(promise)
      return
    } catch (e: Exception) {
      deleteKey(keyTag)
      val strongBoxApiAvailable = (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P)
      if (keyConfig == KeyConfig.EC_P_256 && strongBox) {
        generate(keyConfig, false, keyTag, promise)
        return
      }
      if (keyConfig == KeyConfig.EC_P_256) {
        generate(KeyConfig.RSA, strongBoxApiAvailable, keyTag, promise)
        return
      }
      if (keyConfig == KeyConfig.RSA && strongBox) {
        generate(KeyConfig.RSA, false, keyTag, promise)
        return
      }
      var me: ModuleException = ModuleException.UNKNOWN_EXCEPTION
      when (e) {
        is NoSuchAlgorithmException -> {
          me = ModuleException.WRONG_KEY_CONFIGURATION
        }
        is InvalidAlgorithmParameterException -> {
          me = ModuleException.WRONG_KEY_CONFIGURATION
        }
        is NoSuchProviderException -> {
          me = ModuleException.UNSUPPORTED_DEVICE
        }
      }

      me.reject(
        promise,
        Pair(ERROR_USER_INFO_KEY, e.message ?: "")
      )
      return
    } finally {
      threadHandle = null
    }
  }

  @RequiresApi(Build.VERSION_CODES.M)
  private fun keyExists(keyTag: String) = getKeyPair(keyTag) != null

  /**
   * Return a JWK representation of the PublicKey as for this RFC:
   * https://www.rfc-editor.org/rfc/rfc7517
   *
   * For the EC key encoded X.509 Format we have:
   *
   * https://www.openssl.org/docs/man1.1.1/man1/openssl-asn1parse.html
   * openssl asn1parse -in ec-pk.pem
   * 0:d=0  hl=2 l=  89 cons: SEQUENCE
   * 2:d=1  hl=2 l=  19 cons: SEQUENCE
   * 4:d=2  hl=2 l=   7 prim: OBJECT            :id-ecPublicKey
   * 13:d=2  hl=2 l=   8 prim: OBJECT            :prime256v1
   * 23:d=1  hl=2 l=  66 prim: BIT STRING
   *
   * https://www.rfc-editor.org/rfc/rfc3279#section-2.3.5 (identifiers)
   * https://www.rfc-editor.org/rfc/rfc5480#section-2
   *
   * In the X.509 certificate, the subjectPublicKeyInfo field has the
   * SubjectPublicKeyInfo type, which has the following ASN.1 syntax:
   *
   * SubjectPublicKeyInfo  ::=  SEQUENCE  {
   *  algorithm         AlgorithmIdentifier,
   *  subjectPublicKey  BIT STRING
   * }
   *
   * The fields in SubjectPublicKeyInfo have the following meanings:
   *
   * - algorithm: is the algorithm identifier and parameters for the ECC public key.
   * - subjectPublicKey: is the ECC public key.
   *
   * From https://www.rfc-editor.org/rfc/rfc5480#section-2.2
   *
   * The subjectPublicKey from SubjectPublicKeyInfo is the ECC public key.
   * ECC public keys have the following syntax:
   *
   * ECPoint ::= OCTET STRING
   *
   * For JWK see:
   *  - https://www.iana.org/assignments/jose/jose.xhtml#web-key-parameters
   *  - https://www.iana.org/assignments/jose/jose.xhtml#web-signature-encryption-algorithms
   */
  @RequiresApi(Build.VERSION_CODES.M)
  private fun publicKeyToJwk(key: PublicKey): Map<String, String?>? {
    val nativeMap = mutableMapOf<String, String?>()

    if (key is ECPublicKey) {
      // https://developer.android.com/reference/java/security/interfaces/ECPublicKey
      // https://www.rfc-editor.org/rfc/rfc6025.html#section-2.1.2
      // The subjectPublicKey of an EC key is an ECPoint that is `w` field of the `ECPublicKey`
      val ecKey = key.w

      // https://www.rfc-editor.org/rfc/rfc7517#section-3
      nativeMap.put(JwkFields.KTY.key, KeyConfig.EC_P_256.jwkKty)
      nativeMap.put(JwkFields.CRV.key, KeyConfig.EC_P_256.jwkCrv)
      nativeMap.put(
        JwkFields.X.key, ecKey.affineX.toByteArray().base64NoWrap()
      )
      nativeMap.put(
        JwkFields.Y.key, ecKey.affineY.toByteArray().base64NoWrap()
      )
      return nativeMap
    } else if (key is RSAPublicKey) {
      // https://developer.android.com/reference/java/security/interfaces/RSAPublicKey
      // https://www.rfc-editor.org/rfc/rfc7517#appendix-A.1
      nativeMap.put(JwkFields.KTY.key, KeyConfig.RSA.jwkKty)
      nativeMap.put(JwkFields.ALG.key, KeyConfig.RSA.jwkAlg)
      nativeMap.put(
        JwkFields.N.key, key.modulus.toByteArray().base64NoWrap()
      )
      nativeMap.put(
        JwkFields.E.key, key.publicExponent.toByteArray().base64NoWrap()
      )
      return nativeMap
    }
    return null
  }

  @RequiresApi(Build.VERSION_CODES.M)
  @Throws(KeyNotHardwareBacked::class)
  private fun ensureKeyHardwareBacked(keyTag: String) {
    try {
      getKeyPair(keyTag)?.private?.let {
        if (isKeyHardwareBacked(it)) {
          return
        }
      }
    } catch (e: Exception) {
      throw KeyNotHardwareBacked(e.message)
    }
    throw KeyNotHardwareBacked("")
  }

  @RequiresApi(Build.VERSION_CODES.M)
  private fun isKeyHardwareBacked(key: PrivateKey): Boolean {
    try {
      val factory = KeyFactory.getInstance(
        key.algorithm, KEYSTORE_PROVIDER
      )
      val keyInfo = factory.getKeySpec(key, KeyInfo::class.java)
      return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        // https://developer.android.com/reference/android/security/keystore/KeyProperties
        keyInfo.securityLevel == SECURITY_LEVEL_TRUSTED_ENVIRONMENT
          || keyInfo.securityLevel == SECURITY_LEVEL_STRONGBOX
          || keyInfo.securityLevel == SECURITY_LEVEL_UNKNOWN_SECURE
      } else {
        @Suppress("DEPRECATION") return keyInfo.isInsideSecureHardware
      }
    } catch (e: Exception) {
      return false
    }
  }

  fun deletePublicKey(keyTag: String, promise: Promise) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      deleteKey(keyTag, promise)
    } else {
      ModuleException.API_LEVEL_NOT_SUPPORTED.reject(promise)
    }
  }

  @RequiresApi(Build.VERSION_CODES.M)
  private fun deleteKey(keyTag: String, promise: Promise? = null): Boolean {
    getKeyPair(keyTag)?.let {
      try {
        if (keyStore != null) {
          keyStore!!.deleteEntry(keyTag)
        } else {
          promise?.let {
            ModuleException.KEYSTORE_LOAD_FAILED.reject(it)
          }
        }
      } catch (e: Exception) {
        var me = ModuleException.UNKNOWN_EXCEPTION
        when (e) {
          is KeyStoreException -> {
            me = ModuleException.PUBLIC_KEY_DELETION_ERROR
          }
        }
        promise?.let {
          me.reject(
            it, Pair(e.javaClass.name, e.message ?: "")
          )
        }
        return false
      }
    }
    promise?.resolve(true)
    return true
  }

  /**
   * Returns the public key in JWK format.
   * Legacy method:
   * - Encodes parameters (x, y, n, e) using standard Base64 (not URL-safe)
   * - May include padding (`=`) and a leading zero byte if present
   * For a strict JWK-compliant representation, use `getPublicKeyFixed` instead.
   */
  fun getPublicKey(keyTag: String, promise: Promise) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      getKeyPair(keyTag)?.let {
        return promise.resolve(publicKeyToJwk(it.public))
      }
      return ModuleException.PUBLIC_KEY_NOT_FOUND.reject(
        promise, Pair("keyTag", keyTag)
      )
    } else {
      return ModuleException.API_LEVEL_NOT_SUPPORTED.reject(promise)
    }
  }

  /**
   * Returns the public key in strict JWK-compliant format.
   * - Encodes using Base64URL (RFC 7515): no padding, URL-safe alphabet
   * - Removes leading zero byte added by BigInteger.toByteArray()
   * Supports both EC (P-256) and RSA (RS256) keys.
   */
  fun getPublicKeyFixed(keyTag: String, promise: Promise) {
    getKeyPair(keyTag)?.let {
      try {
        val key = it.public
        val nativeMap = mutableMapOf<String, String?>()

        when (key) {
          is ECPublicKey -> {
            val ecKey = key.w
            val x = BigIntegers.asUnsignedByteArray(32, ecKey.affineX).toBase64Url()
            val y = BigIntegers.asUnsignedByteArray(32, ecKey.affineY).toBase64Url()

            nativeMap.put("kty", "EC")
            nativeMap.put("crv", "P-256")
            nativeMap.put("x", x)
            nativeMap.put("y", y)
          }

          is RSAPublicKey -> {
            val n = BigIntegers.asUnsignedByteArray(key.modulus).toBase64Url()
            val e = BigIntegers.asUnsignedByteArray(key.publicExponent).toBase64Url()

            nativeMap.put("kty", "RSA")
            nativeMap.put("alg", "RS256")
            nativeMap.put("n", n)
            nativeMap.put("e", e)
          }

          else -> {
            ModuleException.WRONG_KEY_CONFIGURATION.reject(promise)
            return
          }
        }

        promise.resolve(nativeMap)
      } catch (e: Exception) {
        ModuleException.UNKNOWN_EXCEPTION.reject(promise)
      }
      return
    }

    ModuleException.PUBLIC_KEY_NOT_FOUND.reject(promise, Pair("keyTag", keyTag))
  }

  fun isKeyStrongboxBacked(keyTag: String, promise: Promise) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      getKeyPair(keyTag)?.let {
        val privateKey = it.private
        val factory = KeyFactory.getInstance(
          privateKey.algorithm, KEYSTORE_PROVIDER
        )
        val keyInfo = factory.getKeySpec(privateKey, KeyInfo::class.java)
        val result = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
          keyInfo.securityLevel == SECURITY_LEVEL_STRONGBOX
        } else {
          false
        }
        return promise.resolve(result)
      }
      return ModuleException.PUBLIC_KEY_NOT_FOUND.reject(
        promise, Pair("keyTag", keyTag)
      )
    } else {
      return ModuleException.API_LEVEL_NOT_SUPPORTED.reject(promise)
    }
  }

  @RequiresApi(Build.VERSION_CODES.M)
  @Throws(NoSuchAlgorithmException::class)
  private fun getSignAlgorithm(privateKey: PrivateKey): String {
    // Hardware Backed private keys are only reference to the key store actual key.
    // They don't expose `<EC/RSA>PrivateKey` interface and are only `<EC/RSA>Key`s.
    // Type check `key is <EC/RSA>PrivateKey` does not work, hence the algorithm check below.
    return when (privateKey.algorithm) {
      KEY_ALGORITHM_EC -> {
        KeyConfig.EC_P_256.signature
      }
      KEY_ALGORITHM_RSA -> {
        KeyConfig.RSA.signature
      }
      else -> {
        throw NoSuchAlgorithmException()
      }
    }
  }

  fun signUTF8Text(message: String, keyTag: String, promise: Promise) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      // Start the local reference: a previous worker may clear threadHandle in its finally.
      val worker = Thread {
        try {
          getKeyPair(keyTag)?.private?.let {
            // Unlike iOS this always returns a byte array.
            val messageDataBytes = message.toByteArray(charset = Charsets.UTF_8)
            val signAlgorithm = getSignAlgorithm(it)
            val signature = signData(
              messageDataBytes, it, signAlgorithm
            )
            // `encodeToString` uses "US-ASCII" under the hood
            // which is equivalent to UTF-8 for the first 256 bytes.
            // Base64 does not generate bytes outside this range.
            val signatureBase64 = Base64.encodeToString(signature, Base64.NO_WRAP)
            promise.resolve(signatureBase64)
            return@Thread
          }
          ModuleException.PUBLIC_KEY_NOT_FOUND.reject(promise)
          return@Thread
        } catch (e: Exception) {
          var me = ModuleException.UNKNOWN_EXCEPTION
          when (e) {
            is NoSuchAlgorithmException -> {
              me = ModuleException.INVALID_SIGN_ALGORITHM
            }
            is InvalidKeyException -> {
              me = ModuleException.WRONG_KEY_CONFIGURATION
            }
            is SignatureException -> {
              me = ModuleException.UNABLE_TO_SIGN
            }
          }
          me.reject(
            promise,
            Pair(ERROR_USER_INFO_KEY, e.message ?: "")
          )
          return@Thread
        } catch (e: AssertionError) {
          ModuleException.INVALID_UTF8_ENCODING.reject(
            promise,
            Pair(ERROR_USER_INFO_KEY, e.message ?: "")
          )
          return@Thread
        } finally {
          threadHandle = null
        }
      }
      threadHandle = worker
      worker.start()
    } else {
      ModuleException.API_LEVEL_NOT_SUPPORTED.reject(promise)
    }
  }

  @RequiresApi(Build.VERSION_CODES.M)
  @Throws(
    NoSuchAlgorithmException::class,
    SignatureException::class,
    InvalidKeyException::class
  )
  private fun signData(
    message: ByteArray, privateKey: PrivateKey, signAlgorithm: String
  ): ByteArray {
    val signatureEngine = Signature.getInstance(signAlgorithm)
    signatureEngine.initSign(privateKey)
    signatureEngine.update(message)
    return signatureEngine.sign()
  }

  @RequiresApi(Build.VERSION_CODES.M)
  private fun getKeyPair(keyTag: String): KeyPair? {
    try {
      keyStore?.let {
        val privateKey = it.getKey(keyTag, null) as? PrivateKey
        privateKey?.also { _ ->
          return if (isKeyHardwareBacked(privateKey)) {
            val publicKey = it.getCertificate(keyTag).publicKey
            KeyPair(publicKey, privateKey)
          } else {
            null
          }
        }
      }
      return null
    } catch (_: Exception) {
      return null
    }
  }

  fun verifyCertificateChain(
    certChainBase64: List<String>,
    trustAnchorBase64: String,
    options: Map<String, Any?>,
    promise: Promise
  ) {
    moduleScope.launch { // Launch in module's coroutine scope
      try {
        if (certChainBase64.isEmpty()) {
          throw IllegalArgumentException("Certificate chain array is empty.")
        }

        // 2. Parse options with defaults
        // Use default values from X509VerificationOptions if keys are missing
        // Parse options with defaults
        val defaultOptions = X509VerificationOptions() // Get defaults from the data class

        val connectTimeout = (options["connectTimeout"] as? Number)?.toInt()
          ?: defaultOptions.connectTimeout
        val readTimeout = (options["readTimeout"] as? Number)?.toInt()
          ?: defaultOptions.readTimeout
        val requireCrl = options["requireCrl"] as? Boolean
          ?: defaultOptions.requireCrl

        val verificationOptions = X509VerificationOptions(
          connectTimeout = connectTimeout,
          readTimeout = readTimeout,
          requireCrl = requireCrl
        )

        // 3. Call the utility function
        val result: X509VerificationUtils.ValidationResult = X509VerificationUtils.verifyCertificateChain(
          certChainBase64 = certChainBase64,
          trustAnchorCertBase64 = trustAnchorBase64,
          options = verificationOptions
        )

        // 4. Prepare the result map for React Native
        val resultMap = mutableMapOf<String, Any?>().apply {
          put("isValid", result.isValid)
          put("status", result.status.name)
          put("errorMessage", result.errorMessage ?: "")

          result.failingCertificate?.let { cert ->
            try {
              val failingCertMap = mutableMapOf<String, String>().apply {
                put("subjectDN", cert.subjectX500Principal?.name ?: "Unknown")
                put("issuerDN", cert.issuerX500Principal?.name ?: "Unknown")
                put("serialNumber", cert.serialNumber?.toString() ?: "Unknown")
                put("notBefore", cert.notBefore?.toString() ?: "Unknown")
                put("notAfter", cert.notAfter?.toString() ?: "Unknown")
              }
              put("failingCertificate", failingCertMap)
            } catch (certEx: Exception) {
              put("failingCertificateError", "Could not retrieve details: ${certEx.message}")
            }
          }
        }

        // 5. Resolve the promise
        promise.resolve(resultMap)

      } catch (e: IllegalArgumentException) {
        // Catch errors from parsing inputs (ReadableArray, ReadableMap)
        ModuleException.CERTIFICATE_CHAIN_VALIDATION_ERROR.reject(
          promise,
          Pair(ERROR_USER_INFO_KEY, "Invalid input arguments: ${e.message}")
        )
      }
      catch (e: Exception) {
        // Catch any other unexpected exception during the bridge call or validation setup
        ModuleException.CERTIFICATE_CHAIN_VALIDATION_ERROR.reject(
          promise,
          Pair(ERROR_USER_INFO_KEY, e.message ?: "Unknown error during certificate validation bridge call")
        )
      }
    }
  }

  // Cleaning up the coroutine scope when the module is destroyed
  fun invalidate() {
    moduleScope.cancel() // Cancel all coroutines launched within this scope
    threadHandle?.interrupt()
    threadHandle = null
  }


  companion object {
    const val KEYSTORE_PROVIDER = "AndroidKeyStore"
    const val ERROR_USER_INFO_KEY = "error"

    @RequiresApi(Build.VERSION_CODES.M)
    private enum class KeyConfig(
      val algorithm: String,
      val algorithmParam: String?,
      val signature: String,
      val jwkKty: String,
      val jwkCrv: String?,
      val jwkAlg: String?
    ) {
      EC_P_256(
        jwkKty = "EC",
        jwkCrv = "P-256",
        jwkAlg = null,
        algorithm = KEY_ALGORITHM_EC,
        algorithmParam = "secp256r1",
        signature = "SHA256withECDSA",
      ),
      RSA(
        jwkKty = "RSA",
        jwkAlg = "RS256",
        jwkCrv = null,
        algorithm = KEY_ALGORITHM_RSA,
        algorithmParam = "2048",
        // https://www.rfc-editor.org/rfc/rfc3447
        signature = "SHA256withRSA/PSS",
      )
    }

    private enum class JwkFields(val key: String) {
      KTY("kty"),
      CRV("crv"),
      ALG("alg"),
      X("x"),
      Y("y"),
      N("n"),
      E("e")
    }

    private enum class ModuleException(
      val ex: Exception
    ) {
      KEY_ALREADY_EXISTS(Exception("KEY_ALREADY_EXISTS")),
      UNSUPPORTED_DEVICE(Exception("UNSUPPORTED_DEVICE")),
      WRONG_KEY_CONFIGURATION(Exception("WRONG_KEY_CONFIGURATION")),
      PUBLIC_KEY_NOT_FOUND(Exception("PUBLIC_KEY_NOT_FOUND")),
      PUBLIC_KEY_DELETION_ERROR(Exception("PUBLIC_KEY_DELETION_ERROR")),
      API_LEVEL_NOT_SUPPORTED(Exception("API_LEVEL_NOT_SUPPORTED")),
      KEYSTORE_LOAD_FAILED(Exception("KEYSTORE_LOAD_FAILED")),
      UNABLE_TO_SIGN(Exception("UNABLE_TO_SIGN")),
      INVALID_UTF8_ENCODING(Exception("INVALID_UTF8_ENCODING")),
      INVALID_SIGN_ALGORITHM(Exception("INVALID_SIGN_ALGORITHM")),
      CERTIFICATE_CHAIN_VALIDATION_ERROR(Exception("CERTIFICATE_CHAIN_VALIDATION_ERROR")),
      UNKNOWN_EXCEPTION(Exception("UNKNOWN_EXCEPTION"));

      fun reject(
        promise: Promise, vararg args: Pair<String, String>
      ) {
        promise.resolve(mapOf(
          "cryptoError" to mapOf(
            "code" to (ex.message ?: "UNKNOWN"),
            "message" to ex.message,
            "userInfo" to args.toMap()
          )
        ))
      }
    }
  }
}

/**
 * Encodes the byte array into a Base64 string without line wrapping.
 * Uses standard Base64 (not URL-safe).
 */
fun ByteArray.base64NoWrap(): String {
  return Base64.encodeToString(this, Base64.NO_WRAP)
}

/**
 * Encodes the byte array into a Base64 URL-safe string without padding or line wrapping.
 * Suitable for use in JWTs, JWKs, and other URL-safe contexts.
 */
fun ByteArray.toBase64Url(): String {
  return Base64.encodeToString(this, Base64.URL_SAFE or Base64.NO_PADDING or Base64.NO_WRAP)
}


class KeyNotHardwareBacked(message: String?) : Exception(message)
