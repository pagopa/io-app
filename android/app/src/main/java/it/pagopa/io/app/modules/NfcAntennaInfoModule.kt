package it.pagopa.io.app.modules

import android.nfc.NfcAdapter
import android.os.Build
import com.facebook.react.bridge.*


class NfcAntennaInfoModule(reactContext: ReactApplicationContext) :
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
      // NFC is not available on this device
      promise.resolve(null)
      return
    }
    promise.resolve(
      adapter.nfcAntennaInfo?.let { info ->
        WritableNativeMap().apply {
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
      }
    )
  }

}
