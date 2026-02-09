package it.pagopa.io.app.modules

import android.nfc.NfcAdapter
import android.os.Build
import com.facebook.react.bridge.*


class NfcInfoModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return "NfcAntennaInfo"
  }

  @ReactMethod
  fun getNfcAntennaInfo(promise: Promise) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
      promise.reject("UNSUPPORTED_DEVICE", "This Android version is not supported");
      return
    }

    val adapter = NfcAdapter.getDefaultAdapter(reactApplicationContext)
    if (adapter == null) {
      promise.reject("NFC_UNAVAILABLE", "NFC adapter not available")
      return
    }

    val info = adapter.nfcAntennaInfo
    if (info == null) {
      promise.reject("ANTENNA_INFO_UNAVAILABLE", "NFC antenna info not available")
      return
    }

    val result = WritableNativeMap().apply {
      putInt("deviceWidth", info.deviceWidth)
      putInt("deviceHeight", info.deviceHeight)
      putBoolean("isDeviceFoldable", info.isDeviceFoldable)
      putArray("availableNfcAntennas", Arguments.createArray().apply {
        info.availableNfcAntennas.forEach { antenna ->
          pushMap(WritableNativeMap().apply {
            putInt("locationX", antenna.locationX)
            putInt("locationY", antenna.locationY)
          })
        }
      })
    }

    promise.resolve(result)
  }

  @ReactMethod
  fun isHceSupported(promise: Promise) {
    try {
      val hasHceFeature = reactApplicationContext
        .packageManager
        .hasSystemFeature(PackageManager.FEATURE_NFC_HOST_CARD_EMULATION)

      promise.resolve(hasHceFeature)
    } catch (e: Exception) {
      promise.reject("HCE_INFO_UNAVAILABLE", e.message, e)
    }
  }

}
