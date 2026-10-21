import ExpoModulesCore
import UIKit

public final class DeviceInternalModule: Module {
  private let resolver = DeviceIdentityResolver(
    storage: LegacyDeviceIdentityStorage(),
    vendorIdentifier: { UIDevice.current.identifierForVendor?.uuidString }
  )

  public func definition() -> ModuleDefinition {
    Name("DeviceInternal")

    Function("getUniqueIdSync") { () throws -> String in
      try self.resolver.getUniqueIdSync()
    }

    Function("isDisplayZoomed") { () -> Bool in
      #if os(visionOS)
        return false
      #else
        return UIScreen.main.scale < UIScreen.main.nativeScale
      #endif
    }
  }
}
