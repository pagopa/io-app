package it.pagopa.io.app.appreview

import android.app.Activity
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.android.play.core.review.ReviewManagerFactory


class AppReviewModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return "AppReviewModule"
  }

  @ReactMethod
  fun requestReview() {
    val context = reactApplicationContext
    val manager = ReviewManagerFactory.create(context)
    val request = manager.requestReviewFlow()
    request.addOnCompleteListener { task ->
      if (task.isSuccessful) {
        val reviewInfo = task.result
        val currentActivity: Activity? = context.getCurrentActivity()
        if (currentActivity != null) {
          manager.launchReviewFlow(currentActivity, reviewInfo)
        } else {
          Log.w(name, "Current activity is null. Unable to launch review flow.")
        }
      } else {
        Log.w(name, "Requesting review failed", task.exception)
      }
    }
  }
}
