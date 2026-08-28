import ExpoModulesCore
import AuthenticationServices
import WebKit

public class ExpoLoginUtilsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoLoginUtils")

    AsyncFunction("getRedirects") { (url: String, headers: [String: String], callbackUrlParameter: String, promise: Promise) in
      getRedirects(for: url, headers: headers, callbackUrlParameter: callbackUrlParameter, promise: promise)
    }
  }

  func getRedirects(for url: String, headers:[String: String],callbackUrlParameter: String,promise: Promise) -> Void {
        var session: URLSession
        guard let parsedUrl = URL(string: url) else {
            promise.reject("NativeRedirectError", generateErrorObject(error: "InvalidURL", responseCode: nil, url: nil, parameters: nil))
            return
        }
        let delegate = RedirectDelegate(callback: callbackUrlParameter, promise: promise)
        session = URLSession(configuration: .default, delegate: delegate, delegateQueue: nil)
        
        var request = URLRequest(url: parsedUrl)
        request.httpMethod = "GET"
        
        for (key,value) in headers {
            request.addValue(value, forHTTPHeaderField: key)
        }
        
        
        session.dataTask(with: request) { data, response, error in
            // Invalidate the session when we exit the function scope
            defer { session.finishTasksAndInvalidate() }
            if (error != nil) {
                promise.reject("NativeRedirectError", generateErrorObject(error: "RequestError", responseCode: nil, url: nil, parameters: nil))
                return
            }
            guard let httpResponse = response as? HTTPURLResponse else {
                promise.reject("NativeRedirectError", generateErrorObject(error: "InvalidResponse", responseCode: nil, url: nil, parameters: nil))
                    return
                }
            if httpResponse.statusCode >= 400 {
                let urlParameters = getUrlQueryParameters(url: parsedUrl.absoluteString)
                let urlNoQuery = getUrlNoQuery(url: parsedUrl.absoluteString)
                let errorObject = generateErrorObject(error: "RedirectingError", responseCode: httpResponse.statusCode, url: urlNoQuery, parameters: urlParameters)
                promise.reject("NativeRedirectError", errorObject)
                return
            }
            promise.resolve(delegate.redirects)
            return
        }.resume()
        
    }
}

class RedirectDelegate: NSObject, URLSessionTaskDelegate {
    var redirects: [String] = []
    let callback: String
    let promise: Promise
        
    init(callback: String, promise: Promise) {
        self.callback = callback
        self.promise = promise
    }

    deinit {
        #if DEBUG
        print("RedirectDelegate cleaned up!")
        #endif
    }
    
    func urlSession(_ session: URLSession, task: URLSessionTask, willPerformHTTPRedirection response: HTTPURLResponse, newRequest request: URLRequest, completionHandler: @escaping (URLRequest?) -> Void) {
        if response.statusCode >= 300 && response.statusCode <= 399 {
            guard let newUrl = request.url?.absoluteString else {
                let errorObject = generateErrorObject(error: "RedirectingErrorMissingURL", responseCode: nil, url: nil, parameters: nil)
                promise.reject("NativeRedirectError", errorObject)
                return
            }
            redirects.append(newUrl)
            if let headerFields = response.allHeaderFields as? [String: String],
               let url = response.url {
              
              let cookies = HTTPCookie.cookies(withResponseHeaderFields: headerFields, for: url)
              if cookies.isEmpty {
                if getUrlQueryParameters(url: newUrl).contains(self.callback) {
                  completionHandler(nil)
                } else {
                  completionHandler(request)
                }
                return
              }
              
              let dispatchGroup = DispatchGroup()
              // [WKWebsiteDataStore httpCookieStore] must be used from main thread only
              DispatchQueue.main.async {
                let cookieStore = WKWebsiteDataStore.default().httpCookieStore
                for cookie in cookies {
                  dispatchGroup.enter()
                  cookieStore.setCookie(cookie) {
                    dispatchGroup.leave()
                  }
                }
              }
              
              // Wait for all cookies to be set (on the main thread)
              // and then execute the notify block (also on the main thread)
              dispatchGroup.notify(queue: .main) {
                if getUrlQueryParameters(url: newUrl).contains(self.callback) {
                  completionHandler(nil)
                } else {
                  completionHandler(request)
                }
              }
              return
            } else {              
              if getUrlQueryParameters(url: newUrl).contains(self.callback) {
                completionHandler(nil)
              } else {
                completionHandler(request)
              }
              return
            }
        } else if response.statusCode >= 400{
            let urlParameters = getUrlQueryParameters(url: redirects.last ?? "")
            let urlNoQuery = getUrlNoQuery(url: redirects.last ?? "")
            let errorObject = generateErrorObject(error: "RedirectingError", responseCode: response.statusCode, url: urlNoQuery, parameters: urlParameters)
            promise.reject("NativeRedirectError", errorObject)
            completionHandler(nil)
            return
        }
        else {
            completionHandler(nil)
            return
        }
    }
}

func getUrlNoQuery(url: String) -> String {
    guard let urlAsURL =  URLComponents(string: url),
          let scheme = urlAsURL.scheme,
          let host = urlAsURL.host
    else {
        return ""
    }
    return "\(scheme)://\(host)\(urlAsURL.path)"
    
}

func getUrlQueryParameters(url: String) -> [String] {
    var parameters: [String] = []
    
    if let urlComponents = URLComponents(string: url), let queryItems = urlComponents.queryItems {
            for queryItem in queryItems {
                parameters.append(queryItem.name)
            }
        }
    
    return parameters
}

/// Builds a JSON-encoded string describing the redirect error, so it can be passed as the
/// `description` argument of `Promise.reject(_:_:)`, which only accepts `String` parameters.
func generateErrorObject(error: String, responseCode: Int?, url: String?, parameters: [String]?) -> String {
    var errorObject = [String: Any]()
    errorObject["error"] = error
    if let responseCode = responseCode {
        errorObject["statusCode"] = responseCode
    }
    if let url = url {
        errorObject["url"] = url
        if let parameters = parameters {
            errorObject["parameters"] = parameters
        }
    }

    guard let data = try? JSONSerialization.data(withJSONObject: errorObject),
          let jsonString = String(data: data, encoding: .utf8) else {
        return error
    }
    return jsonString
}
