package expo.modules.nfcantennainfo

import android.content.pm.PackageManager
import android.nfc.NfcAdapter
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class NfcAntennaInfoModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("NfcAntennaInfo")

    AsyncFunction("getNfcAntennaInfo") {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
        throw NfcUnsupportedDeviceException()
      }

      val adapter = NfcAdapter.getDefaultAdapter(appContext.reactContext)
        ?: throw NfcAdapterUnavailableException()

      val info = adapter.nfcAntennaInfo ?: throw NfcAntennaInfoUnavailableException()

      NfcAntennaInfoRecord(
        deviceWidth = info.deviceWidth,
        deviceHeight = info.deviceHeight,
        isDeviceFoldable = info.isDeviceFoldable,
        availableNfcAntennas = info.availableNfcAntennas.map {
          AvailableNfcAntennaRecord(locationX = it.locationX, locationY = it.locationY)
        }
      )
    }

    AsyncFunction("isHceSupported") {
      appContext.reactContext
        ?.packageManager
        ?.hasSystemFeature(PackageManager.FEATURE_NFC_HOST_CARD_EMULATION)
        ?: false
    }
  }
}
