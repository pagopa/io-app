import ExpoModulesCore
import UIKit

public class ExpoCieIdModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoCieId")

    Function("isAppInstalled") { (appScheme: String, _: String?) -> Bool in
      guard let url = URL(string: "\(appScheme)://") else {
        return false
      }
      if Thread.isMainThread {
        return UIApplication.shared.canOpenURL(url)
      }
      return DispatchQueue.main.sync {
        UIApplication.shared.canOpenURL(url)
      }
    }
  }
}