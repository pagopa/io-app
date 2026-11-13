package expo.modules.httpclient

import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

/**
 * Every field is optional so that a missing or unknown value is reported by the
 * module as a non-HTTP failure response, instead of an argument conversion error.
 */
class HttpRequestConfig : Record {
  @Field
  val verb: String? = null

  @Field
  val url: String? = null

  @Field
  val headers: Map<String, Any?>? = null

  @Field
  val body: Map<String, Any?>? = null

  @Field
  val followRedirects: Boolean? = null

  @Field
  val timeoutMilliseconds: Double? = null

  @Field
  val requestId: String? = null
}
