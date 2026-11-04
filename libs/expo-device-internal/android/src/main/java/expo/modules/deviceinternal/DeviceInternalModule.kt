package expo.modules.deviceinternal

import android.annotation.SuppressLint
import android.content.Context
import android.media.AudioManager
import android.provider.Settings
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

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
      val context = appContext.reactContext ?: throw HapticFeedbackUnavailableException()
      val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as? AudioManager
        ?: throw HapticFeedbackUnavailableException()
      val touchFeedbackEnabled = Settings.System.getInt(
        context.contentResolver,
        Settings.System.HAPTIC_FEEDBACK_ENABLED,
        HAPTIC_FEEDBACK_DISABLED
      ) != HAPTIC_FEEDBACK_DISABLED

      touchFeedbackEnabled && audioManager.ringerMode != AudioManager.RINGER_MODE_SILENT
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

private class HapticFeedbackUnavailableException :
  CodedException("The Android haptic feedback settings are unavailable")
