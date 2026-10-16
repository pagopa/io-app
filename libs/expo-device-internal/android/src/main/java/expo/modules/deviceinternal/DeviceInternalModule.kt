package expo.modules.deviceinternal

import android.annotation.SuppressLint
import android.provider.Settings
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class DeviceInternalModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("DeviceInternal")

    Function("getUniqueIdSync") {
      readUniqueId()
    }
    
    Function("isDisplayZoomed") {
      false
    }
  }

  @SuppressLint("HardwareIds")
  private fun readUniqueId(): String {
    val context = appContext.reactContext ?: throw DeviceInternalUnavailableException()
    return Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID)
      ?.takeIf { it.isNotEmpty() }
      ?: throw DeviceInternalUnavailableException()
  }
}

private class DeviceInternalUnavailableException :
  CodedException("The Android device identity is unavailable")
