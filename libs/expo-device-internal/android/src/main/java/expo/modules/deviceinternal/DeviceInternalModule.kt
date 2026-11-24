package expo.modules.deviceinternal

import android.annotation.SuppressLint
import android.content.Context
import android.media.AudioManager
import android.provider.Settings
import android.util.Log
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.UUID

private const val HAPTIC_FEEDBACK_DISABLED = 0

class DeviceInternalModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("DeviceInternal")

    Function("getUniqueIdSync") {
      readUniqueId()
    }
    
    Function("isDisplayZoomed") {
      false
    }

    Function("isHapticFeedbackEnabled") {
      val context = appContext.reactContext ?: run {
        Log.w("DeviceInternal", "Cannot read haptic feedback preference: React context is unavailable")
        return@Function false
      }
      val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as? AudioManager
        ?: run {
          Log.w("DeviceInternal", "Cannot read haptic feedback preference: audio service is unavailable")
          return@Function false
        }
      val touchFeedbackEnabled = Settings.System.getInt(
        context.contentResolver,
        Settings.System.HAPTIC_FEEDBACK_ENABLED,
        HAPTIC_FEEDBACK_DISABLED
      ) != HAPTIC_FEEDBACK_DISABLED

      touchFeedbackEnabled && audioManager.ringerMode != AudioManager.RINGER_MODE_SILENT
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

    val androidId = runCatching {
      Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID)
    }.getOrNull()
    if (!androidId.isNullOrEmpty()) {
      return androidId
    }

    val prefs = runCatching {
      context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }.getOrNull()
    val savedId = runCatching { prefs?.getString(PREFS_KEY, null) }.getOrNull()
    if (!savedId.isNullOrEmpty()) {
      return savedId
    }

    val generated = processUuid ?: UUID.randomUUID().toString()
    processUuid = generated
    runCatching { prefs?.edit()?.putString(PREFS_KEY, generated)?.apply() }
    return generated
  }

  private var processUuid: String? = null

  private companion object {
    const val PREFS_NAME = "io_device_internal"
    const val PREFS_KEY = "fallback_unique_id"
  }
}