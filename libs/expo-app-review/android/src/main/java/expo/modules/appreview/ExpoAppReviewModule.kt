package expo.modules.appreview

import com.google.android.play.core.review.ReviewManagerFactory
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoAppReviewModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoAppReview")

    AsyncFunction("requestReview") { promise: expo.modules.kotlin.Promise ->
      val context = appContext.reactContext
        ?: return@AsyncFunction promise.resolve(null)
      val manager = ReviewManagerFactory.create(context)
      val request = manager.requestReviewFlow()
      request.addOnCompleteListener { task ->
        val currentActivity = appContext.currentActivity
        if (task.isSuccessful && currentActivity != null) {
          manager.launchReviewFlow(currentActivity, task.result)
        }
        promise.resolve(null)
      }
    }
  }
}
