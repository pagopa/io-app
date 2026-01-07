package it.pagopa.io.app

import android.app.Activity
import android.graphics.Color
import android.os.Build
import android.view.WindowInsetsController
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = NavigationBarManagerModule.NAME)
class NavigationBarManagerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    companion object {
        const val NAME = "NavigationBarManager"
    }

    override fun getName(): String {
        return NAME
    }

    @ReactMethod
    fun setNavigationBarColor(theme: String, backgroundColor: String, promise: Promise) {
        val activity = reactApplicationContext.currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "No current activity available")
            return
        }

        try {
            activity.runOnUiThread {
                when (theme.lowercase()) {
                    "light" -> setLightNavBar(activity, backgroundColor)
                    "dark" -> setDarkNavBar(activity, backgroundColor)
                    else -> setLightNavBar(activity, backgroundColor) // Default to light
                }
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to set navigation bar color: ${e.message}")
        }
    }

    private fun setLightNavBar(activity: Activity, backgroundColor: String) {
        val navBarColor = try {
            Color.parseColor(backgroundColor)
        } catch (e: IllegalArgumentException) {
            Color.parseColor("#FFFFFF") // Fallback to white
        }
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
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
                android.view.View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
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
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
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
                android.view.View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR.inv()
            activity.window.navigationBarColor = navBarColor
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            // Android 5.0+ (API 21+)
            activity.window.navigationBarColor = navBarColor
        }
    }
}