package expo.modules.navigationbarmanager

import android.app.Activity
import android.graphics.Color
import android.os.Build
import android.provider.Settings
import android.view.View
import android.view.WindowInsetsController
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class NoActivityException :
  CodedException("No current activity available")

class NavigationBarManagerModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("NavigationBarManager")

    AsyncFunction("setNavigationBarColor") { theme: String, backgroundColor: String ->
      val activity = appContext.currentActivity ?: throw NoActivityException()

      activity.runOnUiThread {
        when (theme.lowercase()) {
          "dark" -> setDarkNavBar(activity, backgroundColor)
          else -> setLightNavBar(activity, backgroundColor) // Default to light
        }
      }
      true
    }
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
      activity.window.navigationBarColor = if (isGestureNavigationEnabled(activity)) {
        Color.TRANSPARENT
      } else {
        navBarColor
      }
    } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      // Android 11+ (API 30+)
      val controller = activity.window.insetsController
      controller?.setSystemBarsAppearance(
        WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS,
        WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS
      )
      activity.window.navigationBarColor = navBarColor
    } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      // Android 8.0+ (API 26+)
      activity.window.decorView.systemUiVisibility =
        activity.window.decorView.systemUiVisibility or
          View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
      activity.window.navigationBarColor = navBarColor
    } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
      // Android 5.0+ (API 21+) - no light navigation bar support
      activity.window.navigationBarColor = navBarColor
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
      activity.window.navigationBarColor = if (isGestureNavigationEnabled(activity)) {
        Color.TRANSPARENT
      } else {
        navBarColor
      }
    } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      // Android 11+ (API 30+)
      val controller = activity.window.insetsController
      controller?.setSystemBarsAppearance(
        0,
        WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS
      )
      activity.window.navigationBarColor = navBarColor
    } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      // Android 8.0+ (API 26+)
      activity.window.decorView.systemUiVisibility =
        activity.window.decorView.systemUiVisibility and
          View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR.inv()
      activity.window.navigationBarColor = navBarColor
    } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
      // Android 5.0+ (API 21+)
      activity.window.navigationBarColor = navBarColor
    }
  }
}
