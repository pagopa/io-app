package expo.modules.httpclient

import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import io.ktor.client.HttpClient
import io.ktor.client.HttpClientConfig
import io.ktor.client.call.body
import io.ktor.client.engine.android.Android
import io.ktor.client.engine.android.AndroidEngineConfig
import io.ktor.client.network.sockets.ConnectTimeoutException
import io.ktor.client.network.sockets.SocketTimeoutException
import io.ktor.client.plugins.HttpRequestTimeoutException
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.plugins.cookies.AcceptAllCookiesStorage
import io.ktor.client.plugins.cookies.HttpCookies
import io.ktor.client.plugins.cookies.addCookie
import io.ktor.client.plugins.timeout
import io.ktor.client.request.forms.FormDataContent
import io.ktor.client.request.headers
import io.ktor.client.request.request
import io.ktor.client.request.setBody
import io.ktor.http.Cookie
import io.ktor.http.HttpMethod
import io.ktor.http.Parameters
import io.ktor.http.ParametersBuilder
import io.ktor.http.Url
import io.ktor.util.StringValues
import io.ktor.util.date.GMTDate
import io.ktor.utils.io.charsets.MalformedInputException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.CoroutineStart
import kotlinx.coroutines.DelicateCoroutinesApi
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import java.util.UUID
import java.util.concurrent.CancellationException
import java.util.concurrent.ConcurrentHashMap
import javax.net.ssl.SSLHandshakeException

private const val NON_HTTP_ERROR_CODE = 900
private const val DEFAULT_TIMEOUT_MILLISECONDS = 60_000L

class ExpoHttpClientModule : Module() {
  private val coroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)

  private val runningRequestJobs = ConcurrentHashMap<String, Job>()

  @Volatile
  private var inMemoryCookieStorage = AcceptAllCookiesStorage()

  private var followsRedirectClient: HttpClient? = null
  private var doesNotFollowRedirectClient: HttpClient? = null

  override fun definition() = ModuleDefinition {
    Name("ExpoHttpClient")

    AsyncFunction("nativeRequest") { config: HttpRequestConfig, promise: Promise ->
      nativeRequest(config, promise)
    }

    AsyncFunction("setCookieForDomain") { domain: String, path: String, name: String, value: String ->
      val cookieStorage = inMemoryCookieStorage
      coroutineScope.launch {
        try {
          val cookie = Cookie(name, value, path = path, domain = Url(domain).host)
          cookieStorage.addCookie(domain, cookie)
        } catch (_: Exception) {
        }
      }
    }

    AsyncFunction("removeAllCookiesForDomain") { domain: String ->
      val cookieStorage = inMemoryCookieStorage
      coroutineScope.launch {
        try {
          cookieStorage.get(Url(domain)).forEach {
            val expiredCookie =
              Cookie(it.name, it.value, path = it.path, domain = it.domain, expires = GMTDate(0))
            cookieStorage.addCookie(domain, expiredCookie)
          }
        } catch (_: Exception) {
        }
      }
    }

    AsyncFunction("cancelRequestWithId") { requestId: String ->
      runningRequestJobs.remove(requestId)?.cancel()
    }

    AsyncFunction("cancelAllRunningRequests") {
      cancelAllRunningRequests()
    }

    AsyncFunction("deallocate") {
      cancelAllRunningRequests()
      closeClients()
      inMemoryCookieStorage = AcceptAllCookiesStorage()
    }

    OnDestroy {
      cancelAllRunningRequests()
      closeClients()
      coroutineScope.cancel()
    }
  }

  @OptIn(DelicateCoroutinesApi::class)
  private fun nativeRequest(config: HttpRequestConfig, promise: Promise) {
    val verb = config.verb
      ?: return resolveNonHttpFailure("Bad configuration, missing 'verb'", promise)

    val requestMethod = methodFromVerb(verb)
      ?: return resolveNonHttpFailure("Unsupported configuration, unknown verb '$verb'", promise)

    val url = config.url
      ?: return resolveNonHttpFailure("Bad configuration, missing 'url'", promise)

    val body = if (requestMethod == HttpMethod.Post) formDataFromBody(config.body) else null
    val headers = headersFromConfig(config.headers)
    val timeoutMilliseconds = config.timeoutMilliseconds?.toLong() ?: DEFAULT_TIMEOUT_MILLISECONDS
    val requestId = config.requestId ?: UUID.randomUUID().toString()
    val client = clientFor(config.followRedirects ?: true)

    // ATOMIC guarantees the body runs, so the promise is resolved even if cancelled before dispatch.
    val requestJob = coroutineScope.launch(start = CoroutineStart.ATOMIC) {
      try {
        val response = sendRequest(client, url, requestMethod, body, headers, timeoutMilliseconds)
        promise.resolve(response)
      } catch (e: Exception) {
        resolveNonHttpFailure(messageFromException(e), promise)
      } finally {
        coroutineContext[Job]?.let { runningRequestJobs.remove(requestId, it) }
      }
    }
    runningRequestJobs[requestId] = requestJob
    if (requestJob.isCompleted) {
      runningRequestJobs.remove(requestId, requestJob)
    }
  }

  private suspend fun sendRequest(
    client: HttpClient,
    url: String,
    requestMethod: HttpMethod,
    body: FormDataContent?,
    requestHeaders: StringValues,
    timeoutMilliseconds: Long
  ): Map<String, Any> {
    val response = client.request(url) {
      method = requestMethod
      if (body != null) {
        setBody(body)
      }
      headers {
        appendAll(requestHeaders)
      }
      timeout {
        requestTimeoutMillis = timeoutMilliseconds
      }
    }
    val statusCode = response.status.value
    val responseBody = response.body<String>()
    val responseHeaders = response.headers.entries().associate { (name, values) ->
      name.lowercase() to values.joinToString()
    }

    return if (statusCode < 400) {
      mapOf("type" to "success", "status" to statusCode, "body" to responseBody, "headers" to responseHeaders)
    } else {
      mapOf("type" to "failure", "code" to statusCode, "message" to responseBody, "headers" to responseHeaders)
    }
  }

  @Synchronized
  private fun clientFor(followRedirects: Boolean): HttpClient =
    if (followRedirects) {
      followsRedirectClient ?: createClient(true).also { followsRedirectClient = it }
    } else {
      doesNotFollowRedirectClient ?: createClient(false).also { doesNotFollowRedirectClient = it }
    }

  private fun createClient(followRedirects: Boolean): HttpClient {
    val cookieStorage = inMemoryCookieStorage
    val configuration: HttpClientConfig<AndroidEngineConfig>.() -> Unit = {
      this.followRedirects = followRedirects
      install(HttpCookies) {
        storage = cookieStorage
      }
      install(HttpTimeout)
    }
    return HttpClient(Android, configuration)
  }

  @Synchronized
  private fun closeClients() {
    followsRedirectClient?.close()
    doesNotFollowRedirectClient?.close()
    followsRedirectClient = null
    doesNotFollowRedirectClient = null
  }

  private fun cancelAllRunningRequests() {
    runningRequestJobs.keys.forEach { requestId ->
      runningRequestJobs.remove(requestId)?.cancel()
    }
  }

  private fun methodFromVerb(verb: String): HttpMethod? =
    when (verb.lowercase()) {
      "get" -> HttpMethod.Get
      "post" -> HttpMethod.Post
      else -> null
    }

  private fun formDataFromBody(body: Map<String, Any?>?): FormDataContent? {
    if (body == null) return null
    val formData = Parameters.build {
      body.forEach { (name, value) ->
        if (value is String) {
          append(name, value)
        }
      }
    }
    return if (formData.isEmpty()) null else FormDataContent(formData)
  }

  private fun headersFromConfig(headers: Map<String, Any?>?): StringValues {
    val builder = ParametersBuilder()
    headers?.forEach { (name, value) ->
      if (value is String) {
        builder.append(name, value)
      }
    }
    return builder.build()
  }

  private fun messageFromException(e: Exception): String =
    when (e) {
      is HttpRequestTimeoutException, is ConnectTimeoutException, is SocketTimeoutException -> "Timeout"
      is CancellationException -> "Cancelled"
      is SSLHandshakeException -> "TLS Failure"
      is MalformedInputException -> "Serialization Failure"
      else -> e.message ?: "Unable to send network request, unknown error"
    }

  private fun resolveNonHttpFailure(message: String, promise: Promise) {
    promise.resolve(
      mapOf(
        "type" to "failure",
        "code" to NON_HTTP_ERROR_CODE,
        "message" to message,
        "headers" to emptyMap<String, String>()
      )
    )
  }
}
