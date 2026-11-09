package expo.modules.deviceinternal

import android.annotation.SuppressLint
import android.content.Context
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.UUID

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

  // Never throws. Order: ANDROID_ID, then a UUID previously saved in
  // SharedPreferences, then a newly generated UUID (saved). Without a React
  // context nothing can be read or saved, so a per-process UUID is used.
  @Synchronized
  @SuppressLint("HardwareIds")
  private fun readUniqueId(): String {
    val context = appContext.reactContext
      ?: return processUuid ?: UUID.randomUUID().toString().also { processUuid = it }

    val androidId = Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID)
    if (!androidId.isNullOrEmpty()) {
      return androidId
    }

    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val savedId = prefs.getString(PREFS_KEY, null)
    if (!savedId.isNullOrEmpty()) {
      return savedId
    }

    val generated = processUuid ?: UUID.randomUUID().toString()
    prefs.edit().putString(PREFS_KEY, generated).apply()
    processUuid = generated
    return generated
  }

  private var processUuid: String? = null

  private companion object {
    const val PREFS_NAME = "io_device_internal"
    const val PREFS_KEY = "fallback_unique_id"
  }
}
