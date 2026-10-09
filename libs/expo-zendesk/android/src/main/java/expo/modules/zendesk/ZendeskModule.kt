package expo.modules.zendesk

import android.app.Activity
import com.zendesk.service.ErrorResponse
import com.zendesk.service.ZendeskCallback
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import zendesk.answerbot.AnswerBot
import zendesk.core.AnonymousIdentity
import zendesk.core.Identity
import zendesk.core.JwtIdentity
import zendesk.core.Zendesk
import zendesk.support.CustomField
import zendesk.support.Request
import zendesk.support.RequestProvider
import zendesk.support.RequestUpdates
import zendesk.support.Support
import zendesk.support.request.RequestActivity
import zendesk.support.requestlist.RequestListActivity
import java.util.ArrayList

class ZendeskModule : Module() {
  private val customFields = mutableMapOf<String, CustomField>()
  private val tags = mutableListOf<String>()
  private var log = StringBuilder()
  private var logId: String? = null
  private var pendingActivityPromise: Promise? = null

  override fun definition() = ModuleDefinition {
    Name("ExpoZendesk")

    Function("init") { options: Map<String, String> ->
      val appId = options.getValue("appId")
      val context = requireNotNull(appContext.reactContext) { "Zendesk requires an active React context." }
      Zendesk.INSTANCE.init(context, options.getValue("url"), appId, options.getValue("clientId"))
      Support.INSTANCE.init(Zendesk.INSTANCE)
      AnswerBot.INSTANCE.init(Zendesk.INSTANCE, Support.INSTANCE)
      logId = options["logId"]
      initChat(options.getValue("key"))
    }
    Function("initChat") { key: String -> initChat(key) }
    Function("setPrimaryColor") { _: String -> Unit }
    Function("showHelpCenter") { _: Map<String, Any?> -> Unit }
    Function("setVisitorInfo") { _: Map<String, Any?> -> Unit }
    Function("setUserIdentity") { options: Map<String, String> ->
      val identity: Identity = options["token"]?.let(::JwtIdentity)
        ?: AnonymousIdentity.Builder().apply {
          options["name"]?.let(::withNameIdentifier)
          options["email"]?.let(::withEmailIdentifier)
        }.build()
      Zendesk.INSTANCE.setIdentity(identity)
    }
    Function("resetUserIdentity") { zendesk.chat.Chat.INSTANCE.resetIdentity() }
    Function("addTicketCustomField") { key: String, value: String -> customFields[key] = CustomField(key.toLong(), value) }
    Function("addTicketTag") { tag: String ->
      val normalizedTag = tag.replace(' ', '_')
      if (normalizedTag !in tags) {
        tags.add(normalizedTag)
        if (tags.size > MAX_TAGS_SIZE) tags.removeAt(0)
      }
    }
    Function("appendLog") { entry: String ->
      log.insert(0, "\n$entry")
      if (log.length > MAX_LOG_LENGTH) log = StringBuilder(log.substring(0, MAX_LOG_LENGTH))
    }
    Function("resetCustomFields") { customFields.clear() }
    Function("resetTags") { tags.clear() }
    Function("resetLog") { log = StringBuilder() }
    AsyncFunction("openTicket") { promise: Promise ->
      val activity = requireActivity()
      pendingActivityPromise = promise
      logId?.let { customFields[it] = CustomField(it.toLong(), log.toString()) }
      val intent = RequestActivity.builder()
        .withCustomFields(ArrayList(customFields.values))
        .withTags(tags)
        .intent(activity)
      activity.startActivityForResult(intent, REQUEST_CODE)
    }
    AsyncFunction("showTickets") { promise: Promise ->
      val activity = requireActivity()
      pendingActivityPromise = promise
      val intent = RequestListActivity.builder()
        .withContactUsButtonVisible(false)
        .intent(activity)
      activity.startActivityForResult(intent, REQUEST_CODE)
    }
    AsyncFunction("hasOpenedTickets") { promise: Promise ->
      requestProvider().getAllRequests(object : ZendeskCallback<List<Request>>() {
        override fun onSuccess(requests: List<Request>) = promise.resolve(requests.size)
        override fun onError(errorResponse: ErrorResponse) = promise.reject("zendesk_error", errorResponse.reason, null)
      })
    }
    AsyncFunction("getTotalNewResponses") { promise: Promise ->
      requestProvider().getUpdatesForDevice(object : ZendeskCallback<RequestUpdates>() {
        override fun onSuccess(requestUpdates: RequestUpdates) = promise.resolve(requestUpdates.totalUpdates())
        override fun onError(errorResponse: ErrorResponse) = promise.reject("zendesk_error", errorResponse.reason, null)
      })
    }
    Function("dismiss") { appContext.currentActivity?.finishActivity(REQUEST_CODE) }
    Function("setNotificationToken") { token: String ->
      zendesk.chat.Chat.INSTANCE.providers()?.pushNotificationsProvider()?.registerPushToken(token)
    }
    OnActivityResult { _, payload ->
      if (payload.requestCode == REQUEST_CODE) {
        pendingActivityPromise?.resolve(null)
        pendingActivityPromise = null
      }
    }
  }

  private fun requireActivity(): Activity =
    requireNotNull(appContext.currentActivity) { "Zendesk UI requires an active Activity." }

  private fun requestProvider(): RequestProvider =
    requireNotNull(Support.INSTANCE.provider()) { "Zendesk Support is not initialized." }.requestProvider()

  private fun initChat(key: String) {
    val context = requireNotNull(appContext.reactContext) { "Zendesk requires an active React context." }
    zendesk.chat.Chat.INSTANCE.init(context, key)
  }

  private companion object {
    const val REQUEST_CODE = 100
    const val MAX_TAGS_SIZE = 100
    const val MAX_LOG_LENGTH = 60_000
  }
}