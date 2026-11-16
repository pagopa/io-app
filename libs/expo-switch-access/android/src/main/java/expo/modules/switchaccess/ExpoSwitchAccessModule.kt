package expo.modules.switchaccess

import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Context
import android.view.accessibility.AccessibilityManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoSwitchAccessModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoSwitchAccess")

    AsyncFunction("isEnabled") {
      val context = appContext.reactContext
      val accessibilityManager = context?.getSystemService(Context.ACCESSIBILITY_SERVICE)
        as? AccessibilityManager

      accessibilityManager
        ?.getEnabledAccessibilityServiceList(AccessibilityServiceInfo.FEEDBACK_ALL_MASK)
        ?.any { service ->
          service.id.contains("switchaccess", ignoreCase = true) ||
            service.resolveInfo.serviceInfo.name.contains(
              "switchaccess",
              ignoreCase = true
            )
        } ?: false
    }
  }
}