package it.ipzs.cieidsdk.common

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.nfc.NfcAdapter
import android.nfc.NfcManager
import android.nfc.Tag
import android.nfc.TagLostException
import android.nfc.tech.IsoDep
import android.os.Build
import android.provider.Settings
import io.reactivex.android.schedulers.AndroidSchedulers
import io.reactivex.observers.DisposableSingleObserver
import io.reactivex.plugins.RxJavaPlugins
import io.reactivex.schedulers.Schedulers
import it.ipzs.cieidsdk.event.*
import it.ipzs.cieidsdk.exceptions.BlockedPinException
import it.ipzs.cieidsdk.exceptions.NoCieException
import it.ipzs.cieidsdk.exceptions.PinInputNotValidException
import it.ipzs.cieidsdk.exceptions.PinNotValidException
import it.ipzs.cieidsdk.network.NetworkClient
import it.ipzs.cieidsdk.network.service.IdpService
import it.ipzs.cieidsdk.nfc.Ias
import it.ipzs.cieidsdk.url.DeepLinkInfo
import it.ipzs.cieidsdk.util.CieIDSdkLogger
import okhttp3.ResponseBody
import retrofit2.Response
import java.net.SocketTimeoutException
import java.net.UnknownHostException
import javax.net.ssl.SSLProtocolException

val CERTIFICATE_EXPIRED: CharSequence = "SSLV3_ALERT_CERTIFICATE_EXPIRED"
val CERTIFICATE_REVOKED: CharSequence = "SSLV3_ALERT_CERTIFICATE_REVOKED"


interface Callback {

    fun onSuccess(url: String)
    fun onError(error: Throwable)
    fun onEvent(event: Event)
}

object CieIDSdk : NfcAdapter.ReaderCallback {

    private var nfcAdapter: NfcAdapter? = null
    private var callback: Callback? = null
    internal var deepLinkInfo: DeepLinkInfo = DeepLinkInfo()
    internal var ias: Ias? = null
    private var idpCustomUrl: String? = null
    internal var enableLog: Boolean = false
    private var ciePin = ""
    // the timeout of transceive(byte[]) in milliseconds (https://developer.android.com/reference/android/nfc/tech/IsoDep#setTimeout(int))
    // a longer timeout may be useful when performing transactions that require a long processing time on the tag such as key generation.
    private const val isoDepTimeout: Int = 10000

    private val ciePinRegex = Regex("^[0-9]{8}$")
    // pin property
    // 'set' checks if the given value has a valid pin cie format (string, 8 length, all chars are digits)
    var pin: String
        get() = ciePin
        set(value) {
            require(ciePinRegex.matches(value)) { "the given cie PIN has no valid format" }
            ciePin = value
        }


    @SuppressLint("CheckResult")
    fun call(certificate: ByteArray) {

        val idpService: IdpService = NetworkClient(certificate, idpCustomUrl).idpService
        val mapValues = hashMapOf<String, String>().apply {
            put(deepLinkInfo.name!!, deepLinkInfo.value!!)
            put(IdpService.authnRequest, deepLinkInfo.authnRequest ?: "")
            put(IdpService.generaCodice, "1")
        }

        RxJavaPlugins.setErrorHandler { error -> run {
            CieIDSdkLogger.log("error handled by RxJavaPlugins $error")
            callback?.onError(error)
        } }

        idpService.callIdp(mapValues).subscribeOn(Schedulers.io())
            .observeOn(AndroidSchedulers.mainThread())
            .subscribeWith(object :
                DisposableSingleObserver<Response<ResponseBody>>() {
                override fun onSuccess(idpResponse: Response<ResponseBody>) {
                    if (idpResponse.isSuccessful) {
                        CieIDSdkLogger.log("onSuccess")
                        val responseBody = idpResponse.body()
                        CieIDSdkLogger.log("$responseBody")
                        if (responseBody != null) {
                          val responseString = responseBody.string()
                          val responseParts =
                            responseString.split(":".toRegex()).dropLastWhile { it.isEmpty() }
                              .toTypedArray()
                          if (responseParts.size >= 2) {
                            val serverCode = responseParts[1]
                            if (!checkCodiceServer(serverCode)) {
                              callback?.onEvent(Event(EventError.GENERAL_ERROR))
                            }
                            val url =
                              "${deepLinkInfo.nextUrl}?${deepLinkInfo.name}=${deepLinkInfo.value}&login=1&codice=$serverCode"
                            callback?.onSuccess(url)
                          } else {
                            CieIDSdkLogger.log("Missing server code")
                            callback?.onEvent(Event(EventError.AUTHENTICATION_ERROR))
                          }
                        }
                    } else {
                        CieIDSdkLogger.log("onError")
                        callback?.onEvent(Event(EventError.AUTHENTICATION_ERROR))
                    }
                }

                override fun onError(e: Throwable) {
                    CieIDSdkLogger.log("onError")

                    when (e) {
                        is SocketTimeoutException, is UnknownHostException -> {
                            CieIDSdkLogger.log("SocketTimeoutException or UnknownHostException")
                            callback?.onEvent(Event(EventError.ON_NO_INTERNET_CONNECTION))

                        }
                        is SSLProtocolException -> {

                            CieIDSdkLogger.log("SSLProtocolException")
                            e.message?.let {
                                when {
                                    it.contains(CERTIFICATE_EXPIRED) -> callback?.onEvent(
                                        Event(
                                            EventCertificate.CERTIFICATE_EXPIRED
                                        )
                                    )
                                    it.contains(CERTIFICATE_REVOKED) -> callback?.onEvent(
                                        Event(
                                            EventCertificate.CERTIFICATE_REVOKED
                                        )
                                    )
                                    else -> callback?.onError(e)
                                }
                            }

                        }
                        else -> callback?.onError(e)
                    }
                }
            })
    }

    private fun checkCodiceServer(codiceServer: String): Boolean {
        val regex = Regex("^[0-9]{16}$")
        return regex.matches(codiceServer)
    }


    override fun onTagDiscovered(tag: Tag?) {
        try {
            callback?.onEvent(Event(EventTag.ON_TAG_DISCOVERED))
            val isoDep = IsoDep.get(tag)
            isoDep.timeout = isoDepTimeout
            isoDep.connect()
            
            if(!isoDep.isExtendedLengthApduSupported) {
                CieIDSdkLogger.log("isExtendedLengthApduSupported : false")
                callback?.onEvent(Event(EventSmartphone.EXTENDED_APDU_NOT_SUPPORTED))
                return
            }

            ias = Ias(isoDep)
            ias!!.getIdServizi()
            ias!!.startSecureChannel(ciePin)
            val certificate = ias!!.readCertCie()
            call(certificate)

        } catch (throwable: Throwable) {
            CieIDSdkLogger.log(throwable.toString())
            when (throwable) {
                is PinNotValidException -> callback?.onEvent(
                    Event(
                        EventCard.ON_PIN_ERROR,
                        throwable.tentativi
                    )
                )
                is PinInputNotValidException -> callback?.onEvent(Event(EventError.PIN_INPUT_ERROR))
                is BlockedPinException -> callback?.onEvent(Event(EventCard.ON_CARD_PIN_LOCKED))
                is NoCieException -> callback?.onEvent(Event(EventTag.ON_TAG_DISCOVERED_NOT_CIE))
                is TagLostException -> callback?.onEvent(Event(EventTag.ON_TAG_LOST))
                else -> callback?.onError(throwable)
            }
        }
    }


    /**
     * Set the SDK callback and init NFC adapter.
     * start method must be called before accessing nfc features
     * */
    fun start(activity: Activity, cb: Callback) {
        callback = cb
        nfcAdapter = (activity.getSystemService(Context.NFC_SERVICE) as NfcManager).defaultAdapter
    }


    fun setUrl(url: String) {
        val appLinkData = Uri.parse(url)
        deepLinkInfo = DeepLinkInfo(
            value = appLinkData.getQueryParameter(DeepLinkInfo.KEY_VALUE),
            name = appLinkData.getQueryParameter(DeepLinkInfo.KEY_NAME),
            authnRequest = appLinkData.getQueryParameter(DeepLinkInfo.KEY_AUTHN_REQUEST_STRING),
            nextUrl = appLinkData.getQueryParameter(DeepLinkInfo.KEY_NEXT_UTL),
            opText = appLinkData.getQueryParameter(DeepLinkInfo.KEY_OP_TEXT),
            host = appLinkData.host ?: "",
            logo = appLinkData.getQueryParameter(DeepLinkInfo.KEY_LOGO)
        )

    }

    /**
     * Call on Resume of NFC Activity
     */
    fun startNFCListening(activity: Activity) {
        try {
            if (!activity.isFinishing) {
                nfcAdapter?.enableReaderMode(
                    activity,
                    this,
                    NfcAdapter.FLAG_READER_NFC_A or
                            NfcAdapter.FLAG_READER_NFC_B or NfcAdapter.FLAG_READER_SKIP_NDEF_CHECK,
                    null
                )
            }
        } catch (throwable: Throwable) {
            callback?.onEvent(Event(EventError.START_NFC_ERROR))
        }

    }

    /**
     * Call on Pause Of NFC Activity
     */
    fun stopNFCListening(activity: Activity) {
        try {
            nfcAdapter?.disableReaderMode(activity)

        } catch (throwable: Throwable) {
            callback?.onEvent(Event(EventError.STOP_NFC_ERROR))
        }
    }

    /**
     *  Return true if device has NFC supports
     */
    fun hasFeatureNFC(context: Context): Boolean {
        return context.packageManager.hasSystemFeature(PackageManager.FEATURE_NFC)
    }

    /**
     *  Return true if NFC is enabled on device
     */
    fun isNFCEnabled(context: Context): Boolean {
        val enabled = (context.getSystemService(Context.NFC_SERVICE) as NfcManager).defaultAdapter?.isEnabled ?: false
        return hasFeatureNFC(context) && enabled
    }

    /**
    Open NFC Settings PAge
     */
    fun openNFCSettings(activity: Activity) {
        activity.startActivity(Intent(Settings.ACTION_NFC_SETTINGS))
    }

    /**
    return true if the current OS supports the authentication. This method is due because with API level < 23 a security exception is raised
    read more here - https://github.com/teamdigitale/io-cie-android-sdk/issues/10
     */
    fun hasApiLevelSupport(): Boolean {
        // M is for Marshmallow! -> Api level 23
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
    }

    fun enableLog(isEnabled: Boolean) {
        this.enableLog = isEnabled
    }

    fun setCustomIdpUrl(idpUrl: String?) {
        this.idpCustomUrl = idpUrl
    }

}
