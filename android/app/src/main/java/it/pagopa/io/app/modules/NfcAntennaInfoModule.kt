package it.pagopa.io.app.modules

import android.app.Activity
import android.nfc.AvailableNfcAntenna
import android.nfc.NfcAdapter
import android.nfc.NfcAntennaInfo
import android.os.Build
import com.facebook.react.bridge.*
import java.lang.ref.WeakReference


class NfcAntennaInfoModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return "NfcAntennaInfo"
  }

  @ReactMethod
  fun getNfcAntennaInfo(): WritableNativeMap? {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
      return null;
    }
    val adapter = NfcAdapter.getDefaultAdapter(reactApplicationContext)
    return adapter.nfcAntennaInfo?.let { info ->
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
  }

}
