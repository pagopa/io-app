import Alamofire
import ExpoModulesCore

private let nonHttpErrorCode = 900
private let defaultTimeoutSeconds: TimeInterval = 60

public class ExpoHttpClientModule: Module {
  private var runningRequests: [String: Request] = [:]
  private let runningRequestsLock = NSLock()

  public func definition() -> ModuleDefinition {
    Name("ExpoHttpClient")

    AsyncFunction("nativeRequest") { (config: HttpRequestConfig, promise: Promise) in
      self.nativeRequest(config, promise: promise)
    }

    AsyncFunction("setCookieForDomain") { (domain: String, path: String, name: String, value: String) in
      let cookieProperties: [HTTPCookiePropertyKey: Any] = [
        .originURL: domain,
        .path: path,
        .name: name,
        .value: value
      ]
      if let cookie = HTTPCookie(properties: cookieProperties) {
        AF.session.configuration.httpCookieStorage?.setCookie(cookie)
      }
    }

    AsyncFunction("removeAllCookiesForDomain") { (domain: String) in
      guard let domainUrl = URL(string: domain),
            let cookieStorage = AF.session.configuration.httpCookieStorage else {
        return
      }
      cookieStorage.cookies(for: domainUrl)?.forEach { cookieStorage.deleteCookie($0) }
    }

    AsyncFunction("cancelRequestWithId") { (requestId: String) in
      self.removeRunningRequest(forKey: requestId)?.cancel()
    }

    AsyncFunction("cancelAllRunningRequests") {
      self.cancelAllRunningRequests()
    }

    AsyncFunction("deallocate") {
      self.cancelAllRunningRequests()
    }

    OnDestroy {
      self.cancelAllRunningRequests()
    }
  }

  private func nativeRequest(_ config: HttpRequestConfig, promise: Promise) {
    guard let verb = config.verb else {
      resolveNonHttpFailure("Bad configuration, missing 'verb'", promise: promise)
      return
    }
    guard let method = methodFromVerb(verb) else {
      resolveNonHttpFailure("Unsupported configuration, unknown verb '\(verb)'", promise: promise)
      return
    }
    guard let url = config.url else {
      resolveNonHttpFailure("Bad configuration, missing 'url'", promise: promise)
      return
    }

    // As in the original library, a body with any non-string value is dropped entirely.
    let parameters = method == .post ? config.body as? [String: String] : nil
    let headers = HTTPHeaders(stringValues(config.headers) ?? [:])
    let redirector = Redirector(behavior: (config.followRedirects ?? true) ? .follow : .doNotFollow)
    let timeoutSeconds = config.timeoutMilliseconds.map { $0 / 1000 } ?? defaultTimeoutSeconds
    let requestId = config.requestId ?? UUID().uuidString

    let request = AF.request(
      url,
      method: method,
      parameters: parameters,
      headers: headers,
      requestModifier: { $0.timeoutInterval = timeoutSeconds }
    )
    .redirect(using: redirector)

    setRunningRequest(request, forKey: requestId)

    request.response { response in
      self.removeRunningRequest(forKey: requestId, ifMatching: request)
      self.handleResponse(response, cancelled: request.isCancelled, promise: promise)
    }
  }

  private func methodFromVerb(_ verb: String) -> HTTPMethod? {
    switch verb.lowercased() {
    case "get": return .get
    case "post": return .post
    default: return nil
    }
  }

  private func stringValues(_ dictionary: [String: Any]?) -> [String: String]? {
    dictionary?.compactMapValues { $0 as? String }
  }

  private func handleResponse(_ response: AFDataResponse<Data?>, cancelled: Bool, promise: Promise) {
    if case .failure(let error) = response.result {
      if cancelled {
        resolveNonHttpFailure("Cancelled", promise: promise)
      } else if error.isSessionTaskError,
                let urlError = error.underlyingError as? URLError,
                urlError.code == .timedOut {
        resolveNonHttpFailure("Timeout", promise: promise)
      } else if error.isServerTrustEvaluationError {
        resolveNonHttpFailure("TLS Failure", promise: promise)
      } else {
        resolveNonHttpFailure(error.localizedDescription, promise: promise)
      }
      return
    }

    guard let httpResponse = response.response else {
      resolveNonHttpFailure("Unable to read 'status code' from network response", promise: promise)
      return
    }

    var body = ""
    if let data = response.data, !data.isEmpty {
      guard let decodedBody = String(data: data, encoding: .utf8) else {
        resolveNonHttpFailure("Serialization Failure", promise: promise)
        return
      }
      body = decodedBody
    }

    let headers = Dictionary(
      httpResponse.headers.map { ($0.name.lowercased(), $0.value) },
      uniquingKeysWith: { _, last in last }
    )
    let statusCode = httpResponse.statusCode

    promise.resolve(
      statusCode < 400
        ? ["type": "success", "status": statusCode, "body": body, "headers": headers]
        : ["type": "failure", "code": statusCode, "message": body, "headers": headers]
    )
  }

  private func resolveNonHttpFailure(_ message: String, promise: Promise) {
    promise.resolve([
      "type": "failure",
      "code": nonHttpErrorCode,
      "message": message,
      "headers": [String: String]()
    ])
  }

  private func cancelAllRunningRequests() {
    runningRequestsLock.lock()
    let requests = runningRequests.values
    runningRequests.removeAll()
    runningRequestsLock.unlock()
    requests.forEach { $0.cancel() }
  }

  private func setRunningRequest(_ request: Request, forKey requestId: String) {
    runningRequestsLock.lock()
    defer { runningRequestsLock.unlock() }
    runningRequests[requestId] = request
  }

  @discardableResult
  private func removeRunningRequest(forKey requestId: String, ifMatching request: Request? = nil) -> Request? {
    runningRequestsLock.lock()
    defer { runningRequestsLock.unlock() }
    if let request, runningRequests[requestId] !== request {
      return nil
    }
    return runningRequests.removeValue(forKey: requestId)
  }
}
