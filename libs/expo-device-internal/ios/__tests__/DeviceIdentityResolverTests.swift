import Foundation

private enum StorageError: Error {
  case unavailable
}

private final class MemoryStorage: DeviceIdentityStorage {
  var keychain: String?
  var defaults: String?
  var failRead = false
  var failWrite = false
  var reads = 0

  init(keychain: String? = nil, defaults: String? = nil) {
    self.keychain = keychain
    self.defaults = defaults
  }

  func readKeychain() throws -> String? {
    reads += 1
    if failRead { throw StorageError.unavailable }
    return keychain
  }

  func readUserDefaults() throws -> String? { defaults }

  func writeKeychain(_ value: String) throws {
    if failWrite { throw StorageError.unavailable }
    keychain = value
  }

  func writeUserDefaults(_ value: String) { defaults = value }
}

@main
private struct DeviceIdentityResolverTests {
  static func main() throws {
    let scenarios: [(String, String?, String?, String?, String)] = [
      ("Keychain wins without overwriting defaults", "Legacy-ID", "Other-ID", "Vendor-ID", "Legacy-ID"),
      ("Keychain restores missing defaults", "Legacy-ID", nil, "Vendor-ID", "Legacy-ID"),
      ("Defaults restores missing Keychain", nil, "Legacy-ID", "Vendor-ID", "Legacy-ID"),
      ("New installation uses IDFV", nil, nil, "Vendor-ID", "Vendor-ID"),
      ("Missing IDFV generates a UUID", nil, nil, nil, "Generated-ID")
    ]

    for (name, keychain, defaults, vendor, expected) in scenarios {
      let storage = MemoryStorage(keychain: keychain, defaults: defaults)
      let resolver = DeviceIdentityResolver(
        storage: storage,
        vendorIdentifier: { vendor },
        generateIdentifier: { "Generated-ID" }
      )
      let actual = try resolver.getUniqueIdSync()
      precondition(actual == expected, name)
      precondition(storage.keychain == expected, name)
      precondition(storage.defaults == (defaults ?? expected), name)
      let repeated = try resolver.getUniqueIdSync()
      precondition(repeated == expected && storage.reads == 1, "Successful reads are cached")
    }

    for failure in ["read", "write"] {
      let storage = MemoryStorage()
      storage.failRead = failure == "read"
      storage.failWrite = failure == "write"
      let resolver = DeviceIdentityResolver(storage: storage, vendorIdentifier: { "Vendor-ID" })
      do {
        _ = try resolver.getUniqueIdSync()
        preconditionFailure("Storage failure must propagate")
      } catch StorageError.unavailable {
        precondition(storage.defaults == nil, "Failure must not persist a replacement")
      }
      storage.failRead = false
      storage.failWrite = false
      let recovered = try resolver.getUniqueIdSync()
      precondition(recovered == "Vendor-ID", "Failures must not be cached")
    }

    let storage = MemoryStorage()
    let resolver = DeviceIdentityResolver(storage: storage, vendorIdentifier: { nil })
    DispatchQueue.concurrentPerform(iterations: 20) { _ in
      do {
        _ = try resolver.getUniqueIdSync()
      } catch {
        preconditionFailure("Concurrent lookup failed: \(error)")
      }
    }
    precondition(storage.reads == 1, "Concurrent callers must share one persisted ID")
    precondition(storage.keychain == storage.defaults, "Both stores must contain the same ID")
    print("Passed 8 device identity resolver scenarios")
  }
}
