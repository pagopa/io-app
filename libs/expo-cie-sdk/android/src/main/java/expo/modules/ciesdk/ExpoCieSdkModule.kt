package expo.modules.ciesdk

import android.content.Intent
import android.net.Uri
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import it.ipzs.cieidsdk.common.Callback
import it.ipzs.cieidsdk.common.CieIDSdk
import it.ipzs.cieidsdk.event.Event

class ExpoCieSdkModule : Module(), Callback {
  private var attemptsLeft = 0
  private val activity
    get() = appContext.currentActivity ?: throw Exceptions.MissingActivity()
  private val context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("ExpoCieSdk")
    Events("onEvent", "onSuccess", "onError")

    AsyncFunction("setPin") { pin: String -> CieIDSdk.pin = pin }
    Function("setAuthenticationUrl") { url: String -> CieIDSdk.setUrl(url) }
    Function("setCustomIdpUrl") { url: String? -> CieIDSdk.setCustomIdpUrl(url) }
    Function("enableLog") { enabled: Boolean -> CieIDSdk.enableLog(enabled) }
    Function("setAlertMessage") { _: String, _: String -> Unit }

    AsyncFunction("start") {
      CieIDSdk.start(activity, this@ExpoCieSdkModule)
    }.runOnQueue(Queues.MAIN)
    AsyncFunction("startListeningNFC") {
      CieIDSdk.startNFCListening(activity)
    }.runOnQueue(Queues.MAIN)
    AsyncFunction("stopListeningNFC") {
      CieIDSdk.stopNFCListening(activity)
    }.runOnQueue(Queues.MAIN)

    AsyncFunction("isNFCEnabled") { CieIDSdk.isNFCEnabled(context) }
    AsyncFunction("hasNFCFeature") { CieIDSdk.hasFeatureNFC(context) }
    AsyncFunction("hasApiLevelSupport") { CieIDSdk.hasApiLevelSupport() }
    AsyncFunction("openNFCSettings") {
      CieIDSdk.openNFCSettings(activity)
    }.runOnQueue(Queues.MAIN)
    AsyncFunction("launchCieID") {
      val currentActivity = activity
      val packageName = "it.ipzs.cieid"
      val intent = currentActivity.packageManager.getLaunchIntentForPackage(packageName)
        ?: Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/apps/details?id=$packageName"))
      currentActivity.startActivity(intent)
    }.runOnQueue(Queues.MAIN)
  }

  override fun onSuccess(url: String) = emit("onSuccess", url)
  override fun onError(error: Throwable) = emit("onError", error.message ?: "generic error")
  override fun onEvent(event: Event) {
    attemptsLeft = event.attemptsLeft ?: attemptsLeft
    emit("onEvent", event.event.toString())
  }

  private fun emit(channel: String, value: String) {
    sendEvent(channel, mapOf("event" to value, "attemptsLeft" to attemptsLeft))
  }
}