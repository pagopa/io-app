package expo.modules.deviceinternal

import android.annotation.SuppressLint
import android.provider.Settings
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
  private fun readUniqueId(): String? {
    val context = appContext.reactContext ?: return null
    return Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID)
  }
}
