package expo.modules.cie

import android.app.Activity
import android.util.Base64
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import it.pagopa.io.app.cie.CieLogger
import it.pagopa.io.app.cie.CieSDK
import it.pagopa.io.app.cie.IntAuthMRTDResponse
import it.pagopa.io.app.cie.NisAndPaceCallback
import it.pagopa.io.app.cie.cie.CertificateData
import it.pagopa.io.app.cie.cie.CieAtrCallback
import it.pagopa.io.app.cie.cie.CieCertificateDataCallback
import it.pagopa.io.app.cie.cie.NfcError
import it.pagopa.io.app.cie.cie.NfcEvent
import it.pagopa.io.app.cie.network.NetworkCallback
import it.pagopa.io.app.cie.network.NetworkError
import it.pagopa.io.app.cie.nfc.NfcEvents
import it.pagopa.io.app.cie.nis.InternalAuthenticationResponse
import it.pagopa.io.app.cie.nis.NisCallback
import it.pagopa.io.app.cie.pace.MRTDResponse
import it.pagopa.io.app.cie.pace.PaceCallback
import it.pagopa.io.app.cie.toHex
import java.lang.ref.WeakReference
import java.net.URL

class CieModule : Module() {
  private var cieSdkInstance: CieSDK? = null
  private var sdkActivityRef: WeakReference<Activity>? = null
  private var customIdpUrl: String? = null

  init {
    CieLogger.enabled = BuildConfig.DEBUG
  }

  private val cieSdk: CieSDK
    get() {
      val currentActivity = appContext.currentActivity
        ?: throw CodedException("Cannot initialize the CIE SDK without an activity")
      if (cieSdkInstance == null || sdkActivityRef?.get() != currentActivity) {
        val sdk = CieSDK.withContext(currentActivity)
        customIdpUrl?.let(sdk::withCustomIdpUrl)
        cieSdkInstance = sdk
        sdkActivityRef = WeakReference(currentActivity)
      }
      return cieSdkInstance!!
    }

  override fun definition() = ModuleDefinition {
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

    AsyncFunction("hasNfcFeature") { cieSdk.hasNfcFeature() }
    AsyncFunction("isNfcEnabled") { cieSdk.isNfcAvailable() }
    AsyncFunction("isCieAuthenticationSupported") { cieSdk.isCieAuthenticationSupported() }
    AsyncFunction("openNfcSettings") {
      cieSdk.openNfcSettings()
      true
    }
    Function("setAlertMessage") { _: String, _: String -> }
    Function("setCurrentAlertMessage") { _: String -> }
    Function("setCustomIdpUrl") { url: String ->
      customIdpUrl = url
      cieSdk.withCustomIdpUrl(url)
    }

    AsyncFunction("startInternalAuthentication") { challenge: String, resultEncoding: String, timeout: Int ->
      val encoding = ResultEncoding.fromString(resultEncoding)
      cieSdk.startReadingNis(challenge, timeout, true, nfcEvents { event ->
        event.numeratorForNis.toDouble() / NfcEvent.totalNisOfNumeratorEvent
      }, object : NisCallback {
        override fun onSuccess(response: InternalAuthenticationResponse) {
          sendEvent("onInternalAuthenticationSuccess", mapOf(
            "nis" to encoding.encode(response.nis),
            "publicKey" to encoding.encode(response.kpubIntServ),
            "sod" to encoding.encode(response.sod),
            "signedChallenge" to encoding.encode(response.challengeSigned)
          ))
        }

        override fun onError(error: NfcError) = emitError(error)
      })
    }

    AsyncFunction("startMRTDReading") { can: String, resultEncoding: String, timeout: Int ->
      val encoding = ResultEncoding.fromString(resultEncoding)
      cieSdk.startDoPace(can, timeout, true, nfcEvents { event ->
        event.numeratorForPace.toDouble() / NfcEvent.totalPaceOfNumeratorEvent
      }, object : PaceCallback {
        override fun onSuccess(response: MRTDResponse) {
          sendEvent("onMRTDWithPaceSuccess", mapOf(
            "dg1" to encoding.encode(response.dg1),
            "dg11" to encoding.encode(response.dg11),
            "sod" to encoding.encode(response.sod)
          ))
        }

        override fun onError(error: NfcError) = emitError(error)
      })
    }

    AsyncFunction("startInternalAuthAndMRTDReading") { can: String, challenge: String, resultEncoding: String, timeout: Int ->
      val encoding = ResultEncoding.fromString(resultEncoding)
      cieSdk.startNisAndPace(challenge, can, timeout, true, nfcEvents { event ->
        event.numeratorForNisAndPace.toDouble() / NfcEvent.totalNisAndPaceOfNumeratorEvent
      }, object : NisAndPaceCallback {
        override fun onSuccess(response: IntAuthMRTDResponse) {
          sendEvent("onInternalAuthAndMRTDWithPaceSuccess", mapOf(
            "nis_data" to mapOf(
              "nis" to encoding.encode(response.internalAuthentication.nis),
              "publicKey" to encoding.encode(response.internalAuthentication.kpubIntServ),
              "sod" to encoding.encode(response.internalAuthentication.sod),
              "signedChallenge" to encoding.encode(response.internalAuthentication.challengeSigned)
            ),
            "mrtd_data" to mapOf(
              "dg1" to encoding.encode(response.mrtd.dg1),
              "dg11" to encoding.encode(response.mrtd.dg11),
              "sod" to encoding.encode(response.mrtd.sod)
            )
          ))
        }

        override fun onError(error: NfcError) = emitError(error)
      })
    }

    AsyncFunction("startReadingAttributes") { timeout: Int ->
      cieSdk.startReadingCieAtr(timeout, true, nfcEvents { event ->
        event.numeratorForKindOf.toDouble() / NfcEvent.totalKindOfNumeratorEvent
      }, object : CieAtrCallback {
        override fun onSuccess(atr: ByteArray) {
          sendEvent("onAttributesSuccess", mapOf(
            "base64" to Base64.encodeToString(atr, Base64.DEFAULT),
            "type" to Atr(atr).getCieType().name
          ))
        }

        override fun onError(error: NfcError) = emitError(error)
      })
    }

    AsyncFunction("startReading") { pin: String, authenticationUrl: String, timeout: Int ->
      cieSdk.setPin(pin)
      cieSdk.withUrl(URL(authenticationUrl).toString())
      cieSdk.startReading(timeout, true, nfcEvents { event ->
        event.numerator.toDouble() / NfcEvent.totalNumeratorEvent
      }, object : NetworkCallback {
        override fun onSuccess(url: String) {
          sendEvent("onSuccess", mapOf("url" to url))
        }

        override fun onError(error: NetworkError) = emitNetworkError(error)
      })
    }

    AsyncFunction("startReadingCertificate") { pin: String, timeout: Int ->
      cieSdk.setPin(pin)
      cieSdk.startReadingCertificate(timeout, true, nfcEvents { event ->
        event.numerator.toDouble() / NfcEvent.totalNumeratorEvent
      }, object : CieCertificateDataCallback {
        override fun onSuccess(data: CertificateData) {
          sendEvent("onCertificateSuccess", mapOf(
            "name" to data.name,
            "surname" to data.surname,
            "fiscalCode" to data.fiscalCode,
            "docSerialNumber" to data.docSerialNumber
          ))
        }

        override fun onError(error: NfcError) = emitError(error)
      })
    }

    AsyncFunction("stopReading") { cieSdk.stopNFCListening() }
    Function("setLogMode") { _: String ->
      Unit.also { throw unsupportedException() }
    }
    AsyncFunction("getLogsFilePath") { throw unsupportedException() }
    AsyncFunction("getLogs") { throw unsupportedException() }
  }

  private fun nfcEvents(progress: (NfcEvent) -> Double) = object : NfcEvents {
    override fun event(event: NfcEvent) {
      sendEvent("onEvent", mapOf("name" to event.name, "progress" to progress(event)))
    }

    override fun error(error: NfcError) = emitError(error)
  }

  private fun emitError(error: NfcError) {
    val event = mapNfcError(error)
    val payload = mutableMapOf<String, Any>("name" to event)
    error.msg?.let { payload["message"] = it }
    error.numberOfAttempts?.let { payload["attemptsLeft"] = it }
    sendEvent("onError", payload)
  }

  private fun emitNetworkError(error: NetworkError) {
    val payload = mutableMapOf<String, Any>("name" to mapNetworkError(error))
    error.msg?.let { payload["message"] = it }
    sendEvent("onError", payload)
  }

  private fun unsupportedException() = CodedException(
    "UNSUPPORTED",
    "Logging is not supported on Android",
    null
  )

  private fun mapNfcError(error: NfcError): String = when (error) {
    NfcError.NOT_A_CIE -> "NOT_A_CIE"
    NfcError.TAG_LOST -> "TAG_LOST"
    NfcError.APDU_ERROR, NfcError.EXTENDED_APDU_NOT_SUPPORTED -> "APDU_ERROR"
    NfcError.WRONG_PIN -> "WRONG_PIN"
    NfcError.WRONG_CAN -> "WRONG_CAN"
    NfcError.PIN_BLOCKED -> "CARD_BLOCKED"
    else -> "GENERIC_ERROR"
  }

  private fun mapNetworkError(error: NetworkError): String = when (error) {
    NetworkError.NO_INTERNET_CONNECTION -> "NO_INTERNET_CONNECTION"
    NetworkError.CERTIFICATE_EXPIRED -> "CERTIFICATE_EXPIRED"
    NetworkError.CERTIFICATE_REVOKED -> "CERTIFICATE_REVOKED"
    NetworkError.AUTHENTICATION_ERROR -> "AUTHENTICATION_ERROR"
    else -> "GENERIC_ERROR"
  }

  private enum class ResultEncoding {
    HEX, BASE64, BASE64URL;

    fun encode(data: ByteArray): String = when (this) {
      HEX -> data.toHex().uppercase()
      BASE64 -> Base64.encodeToString(data, Base64.DEFAULT or Base64.NO_WRAP)
      BASE64URL -> Base64.encodeToString(data, Base64.URL_SAFE or Base64.NO_WRAP)
    }

    companion object {
      fun fromString(value: String) = when (value.lowercase()) {
        "hex" -> HEX
        "base64url" -> BASE64URL
        else -> BASE64
      }
    }
  }
}