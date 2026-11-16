import ExpoModulesCore

/// Every field is optional so that a missing or unknown value is reported by the
/// module as a non-HTTP failure response, instead of an argument conversion error.
struct HttpRequestConfig: Record {
  @Field
  var verb: String?

  @Field
  var url: String?

  @Field
  var headers: [String: Any]?

  @Field
  var body: [String: Any]?

  @Field
  var followRedirects: Bool?

  @Field
  var timeoutMilliseconds: Double?

  @Field
  var requestId: String?
}
