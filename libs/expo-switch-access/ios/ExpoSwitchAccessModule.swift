import ExpoModulesCore
import UIKit

public class ExpoSwitchAccessModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoSwitchAccess")

    AsyncFunction("isEnabled") { () async -> Bool in
      await MainActor.run {
        UIAccessibility.isSwitchControlRunning
      }
    }
  }
}