package expo.modules.navigationbarmanager

import android.app.Activity
import android.graphics.Color
import android.os.Build
import android.provider.Settings
import android.view.WindowInsetsController
import androidx.core.view.WindowCompat
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class NoActivityException :
  CodedException("No current activity available")

class NavigationBarManagerModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("NavigationBarManager")

    AsyncFunction("setNavigationBarColor") { theme: String, backgroundColor: String ->
      val activity = appContext.currentActivity ?: throw NoActivityException()
      when (theme.lowercase()) {
        "dark" -> setDarkNavBar(activity, backgroundColor)
        else -> setLightNavBar(activity, backgroundColor) // Default to light
      }
      true
    }.runOnQueue(Queues.MAIN)
  }

  private fun isGestureNavigationEnabled(activity: Activity): Boolean =
    try {
      // NAVIGATION_MODE: 0 = buttons, 1 = 3-button, 2 = gestures
      val navigationMode = Settings.Secure.getInt(
        activity.contentResolver,
        "navigation_mode",
        0
      )
      navigationMode == 2
    } catch (e: Exception) {
      false // Default to button navigation if we can't detect
    }

  private fun setLightNavBar(activity: Activity, backgroundColor: String) {
    val navBarColor = try {
      Color.parseColor(backgroundColor)
    } catch (e: IllegalArgumentException) {
      Color.parseColor("#FFFFFF") // Fallback to white
    }

    if (Build.VERSION.SDK_INT == Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
      // Android 14 (API 34) - disable contrast enforcement for edge-to-edge
      activity.window.isNavigationBarContrastEnforced = false
      activity.window.insetsController?.setSystemBarsAppearance(
        WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS,
        WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS
      )
      setNavigationBarColor(activity, if (isGestureNavigationEnabled(activity)) {
        Color.TRANSPARENT
      } else {
        navBarColor
      })
    } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      // Android 11+ (API 30+)
      val controller = activity.window.insetsController
      controller?.setSystemBarsAppearance(
        WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS,
        WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS
      )
      setNavigationBarColor(activity, navBarColor)
    } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      // Android 8.0+ (API 26+)
      WindowCompat.getInsetsController(activity.window, activity.window.decorView)
        .isAppearanceLightNavigationBars = true
      setNavigationBarColor(activity, navBarColor)
    } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
      // Android 5.0+ (API 21+) - no light navigation bar support
      setNavigationBarColor(activity, navBarColor)
    }
  }

  private fun setDarkNavBar(activity: Activity, backgroundColor: String) {
    val navBarColor = try {
      Color.parseColor(backgroundColor)
    } catch (e: IllegalArgumentException) {
      Color.parseColor("#000000") // Fallback to black
    }

    if (Build.VERSION.SDK_INT == Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
      // Android 14 (API 34) - disable contrast enforcement for edge-to-edge
      activity.window.isNavigationBarContrastEnforced = false
      activity.window.insetsController?.setSystemBarsAppearance(
        0,
        WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS
      )
      setNavigationBarColor(activity, if (isGestureNavigationEnabled(activity)) {
        Color.TRANSPARENT
      } else {
        navBarColor
      })
    } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      // Android 11+ (API 30+)
      val controller = activity.window.insetsController
      controller?.setSystemBarsAppearance(
        0,
        WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS
      )
      setNavigationBarColor(activity, navBarColor)
    } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      // Android 8.0+ (API 26+)
      WindowCompat.getInsetsController(activity.window, activity.window.decorView)
        .isAppearanceLightNavigationBars = false
      setNavigationBarColor(activity, navBarColor)
    } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
      // Android 5.0+ (API 21+)
      setNavigationBarColor(activity, navBarColor)
    }
  }

  @Suppress("DEPRECATION")
  private fun setNavigationBarColor(activity: Activity, color: Int) {
    activity.window.navigationBarColor = color
  }
}
