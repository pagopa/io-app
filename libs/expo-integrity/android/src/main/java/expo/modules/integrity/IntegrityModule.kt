package expo.modules.integrity

import android.content.pm.PackageManager
import android.os.Build
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyInfo
import android.security.keystore.KeyProperties
import android.util.Base64
import android.util.Log
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.common.GoogleApiAvailability
import com.google.android.play.core.integrity.IntegrityManagerFactory
import com.google.android.play.core.integrity.StandardIntegrityManager
import com.google.android.play.core.integrity.StandardIntegrityManager.StandardIntegrityTokenProvider
import com.google.android.play.core.integrity.StandardIntegrityManager.StandardIntegrityTokenRequest
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.security.KeyFactory
import java.security.KeyPair
import java.security.KeyPairGenerator
import java.security.KeyStore
import java.security.PrivateKey
import java.security.spec.ECGenParameterSpec

class IntegrityModule : Module() {
  private var integrityTokenProvider: StandardIntegrityTokenProvider? = null
  private val context
    get() = requireNotNull(appContext.reactContext) { "React context is unavailable" }

  private val keyStore: KeyStore? by lazy {
    try {
      KeyStore.getInstance(KEYSTORE_PROVIDER).also { it.load(null) }
    } catch (_: Exception) {
      null
    }
  }

  override fun definition() = ModuleDefinition {
    Name("ExpoIntegrity")

    AsyncFunction("isPlayServicesAvailable") {
      GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(context) in listOf(
        ConnectionResult.SUCCESS,
        ConnectionResult.SERVICE_UPDATING,
        ConnectionResult.SERVICE_VERSION_UPDATE_REQUIRED
      )
    }

    AsyncFunction("prepareIntegrityToken") { cloudProjectNumber: String, promise: Promise ->
      prepareIntegrityToken(cloudProjectNumber, promise)
    }

    AsyncFunction("requestIntegrityToken") { requestHash: String?, promise: Promise ->
      requestIntegrityToken(requestHash, promise)
    }

    AsyncFunction("getAttestation") { challenge: String, keyAlias: String, promise: Promise ->
      getAttestation(challenge, keyAlias, promise)
    }
  }

  private fun prepareIntegrityToken(cloudProjectNumber: String, promise: Promise) {
    try {
      val projectNumber = cloudProjectNumber.toLong()
      IntegrityManagerFactory.createStandard(context).prepareIntegrityToken(
        StandardIntegrityManager.PrepareIntegrityTokenRequest.builder()
          .setCloudProjectNumber(projectNumber).build()
      ).addOnSuccessListener { provider ->
        integrityTokenProvider = provider
        promise.resolve()
      }.addOnFailureListener { error ->
        Failure.PREPARE_FAILED.reject(promise, error)
      }
    } catch (_: NumberFormatException) {
      Failure.WRONG_GOOGLE_CLOUD_PROJECT_NUMBER_FORMAT.reject(promise)
    } catch (error: Exception) {
      Failure.PREPARE_FAILED.reject(promise, error)
    }
  }

  private fun requestIntegrityToken(requestHash: String?, promise: Promise) {
    try {
      val provider = integrityTokenProvider
      if (provider == null) {
        Failure.PREPARE_NOT_CALLED.reject(promise)
        return
      }
      provider.request(
        StandardIntegrityTokenRequest.builder().setRequestHash(requestHash).build()
      ).addOnSuccessListener { response ->
        promise.resolve(response.token())
      }.addOnFailureListener { error ->
        Failure.REQUEST_TOKEN_FAILED.reject(promise, error)
      }
    } catch (error: Exception) {
      Failure.REQUEST_TOKEN_FAILED.reject(promise, error)
    }
  }

  private fun isKeyHardwareBacked(key: PrivateKey): Boolean = try {
    val factory = KeyFactory.getInstance(key.algorithm, KEYSTORE_PROVIDER)
    val keyInfo = factory.getKeySpec(key, KeyInfo::class.java)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      keyInfo.securityLevel in listOf(
        KeyProperties.SECURITY_LEVEL_TRUSTED_ENVIRONMENT,
        KeyProperties.SECURITY_LEVEL_STRONGBOX,
        KeyProperties.SECURITY_LEVEL_UNKNOWN_SECURE
      )
    } else {
      @Suppress("DEPRECATION")
      keyInfo.isInsideSecureHardware
    }
  } catch (_: Exception) {
    false
  }

  private fun generateAttestationKeyWithFallback(keyAlias: String, challenge: ByteArray): KeyPair {
    val hasStrongBox = Build.VERSION.SDK_INT >= Build.VERSION_CODES.P &&
      context.packageManager.hasSystemFeature(PackageManager.FEATURE_STRONGBOX_KEYSTORE)
    return try {
      generateAttestationKey(keyAlias, challenge, hasStrongBox)
    } catch (error: Exception) {
      if (!hasStrongBox) {
        throw Exception("KeyPair Failed Without Fallback", error)
      }
      Log.w("ExpoIntegrity", "StrongBox Key Generation Failed, retrying with TEE")
      generateAttestationKey(keyAlias, challenge, false)
    }
  }

  private fun generateAttestationKey(
    keyAlias: String,
    challenge: ByteArray,
    hasStrongBox: Boolean
  ): KeyPair {
    val builder = KeyGenParameterSpec.Builder(keyAlias, KeyProperties.PURPOSE_SIGN)
      .setAlgorithmParameterSpec(ECGenParameterSpec(EC_CURVE))
      .setDigests(KeyProperties.DIGEST_SHA256)
      .setKeySize(EC_KEY_SIZE)
      .setAttestationChallenge(challenge)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P && hasStrongBox) {
      builder.setIsStrongBoxBacked(true)
    }
    val generator = KeyPairGenerator.getInstance(KeyProperties.KEY_ALGORITHM_EC, KEYSTORE_PROVIDER)
    generator.initialize(builder.build())
    return generator.generateKeyPair()
  }

  private fun keyExists(keyAlias: String): Boolean = try {
    keyStore?.getKey(keyAlias, null) is PrivateKey
  } catch (_: Exception) {
    false
  }

  private fun getAttestation(challenge: String, keyAlias: String, promise: Promise) {
    try {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) {
        Failure.UNSUPPORTED_DEVICE.reject(promise)
        return
      }
      if (keyExists(keyAlias)) {
        Failure.KEY_ALREADY_EXISTS.reject(promise)
        return
      }
      val keyPair = generateAttestationKeyWithFallback(keyAlias, challenge.toByteArray())
      if (!isKeyHardwareBacked(keyPair.private)) {
        Failure.KEY_IS_NOT_HARDWARE_BACKED.reject(promise)
        return
      }
      val store = keyStore
      if (store == null) {
        Failure.KEYSTORE_NOT_INITIALIZED.reject(promise)
        return
      }
      val certificates = store.getCertificateChain(keyAlias).joinToString(",") { certificate ->
        Base64.encodeToString(certificate.encoded, Base64.DEFAULT)
      }
      promise.resolve(Base64.encodeToString(certificates.toByteArray(), Base64.DEFAULT))
    } catch (error: Exception) {
      Failure.REQUEST_ATTESTATION_FAILED.reject(promise, error)
    }
  }

  private enum class Failure(val code: String) {
    WRONG_GOOGLE_CLOUD_PROJECT_NUMBER_FORMAT("WRONG_GOOGLE_CLOUD_PROJECT_NUMBER_FORMAT"),
    PREPARE_FAILED("PREPARE_TOKEN_EXCEPTION"),
    PREPARE_NOT_CALLED("PREPARE_NOT_CALLED"),
    REQUEST_TOKEN_FAILED("REQUEST_TOKEN_FAILED"),
    REQUEST_ATTESTATION_FAILED("REQUEST_ATTESTATION_FAILED"),
    KEY_IS_NOT_HARDWARE_BACKED("KEY_IS_NOT_HARDWARE_BACKED"),
    UNSUPPORTED_DEVICE("UNSUPPORTED_DEVICE"),
    KEY_ALREADY_EXISTS("KEY_ALREADY_EXISTS"),
    KEYSTORE_NOT_INITIALIZED("KEYSTORE_NOT_INITIALIZED");

    fun reject(promise: Promise, error: Exception? = null) {
      promise.reject(code, error?.message ?: code, error)
    }
  }

  companion object {
    private const val KEYSTORE_PROVIDER = "AndroidKeyStore"
    private const val EC_CURVE = "secp256r1"
    private const val EC_KEY_SIZE = 256
  }
}