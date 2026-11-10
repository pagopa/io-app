package expo.modules.loginutils

import org.json.JSONArray
import org.json.JSONObject

class IoLoginError {
  enum class Type(val value: String) {
    MISSING_ACTIVITY_ON_PREPARE("MissingActivityOnPrepare"),
    FIRST_REQUEST_ERROR("FirstRequestError"),
    CONNECTION_REDIRECT_ERROR("ConnectionRedirectError"),
    REDIRECTING_ERROR("RedirectingError"),
    NATIVE_AUTH_SESSION_CLOSED("NativeAuthSessionClosed"),
    BROWSER_NOT_FOUND("BrowserNotFound"),
    ILLEGAL_STATE_EXCEPTION("IllegalStateException"),
    ANDROID_SYSTEM_FAILURE("AndroidSystemFailure")
  }

  companion object {
    /**
     * Builds a JSON-encoded string describing the redirect error, so it can be passed as the
     * `message` argument of `Promise.reject(code, message)`, which only accepts a `String`.
     */
    fun generateErrorUserInfo(
      error: Type,
      responseCode: Int? = null,
      url: String? = null,
      parameters: List<String>? = null
    ): String =
      JSONObject().apply {
        put("error", error.value)
        url?.let { put("url", it) }
        responseCode?.let { put("statusCode", it) }
        parameters?.let { params ->
          put("parameters", JSONArray().apply {
            params.forEach { param -> put(param) }
          })
        }
      }.toString()
  }
}
