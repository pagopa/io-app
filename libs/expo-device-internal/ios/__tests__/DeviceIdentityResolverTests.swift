import Foundation

private enum StorageError: Error {
  case unavailable
}

private final class MemoryStorage: DeviceIdentityStorage {
  var keychain: String?
  var defaults: String?
  var failRead = false
  var failReadDefaults = false
  var failWrite = false
  var reads = 0
  var keychainWrites = 0

  init(keychain: String? = nil, defaults: String? = nil) {
    self.keychain = keychain
    self.defaults = defaults
  }

  func readKeychain() throws -> String? {
    reads += 1
    if failRead { throw StorageError.unavailable }
    return keychain
  }

  func readUserDefaults() throws -> String? {
    if failReadDefaults { throw StorageError.unavailable }
    return defaults
  }

  func writeKeychain(_ value: String) throws {
    keychainWrites += 1
    if failWrite { throw StorageError.unavailable }
    keychain = value
  }

  func writeUserDefaults(_ value: String) { defaults = value }
}

@main
private struct DeviceIdentityResolverTests {
  static func main() {
    let scenarios: [(String, String?, String?, String?, String)] = [
      ("Keychain wins and realigns defaults", "Legacy-ID", "Other-ID", "Vendor-ID", "Legacy-ID"),
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
      let actual = resolver.getUniqueIdSync()
      precondition(actual == expected, name)
      precondition(storage.keychain == expected, name)
      precondition(storage.defaults == expected, name)
      let repeated = resolver.getUniqueIdSync()
      precondition(repeated == expected && storage.reads == 1, "Successful reads are cached")
    }

    struct Failure {
      let name: String
      let keychain: String?
      let defaults: String?
      let vendor: String?
      let failRead: Bool
      let failReadDefaults: Bool
      let failWrite: Bool
      let expected: String
      let keychainAfter: String?
      let defaultsAfter: String?
    }

    let failures = [
      Failure(name: "Unreadable Keychain falls back to defaults",
              keychain: "Legacy-ID", defaults: "Defaults-ID", vendor: "Vendor-ID",
              failRead: true, failReadDefaults: false, failWrite: false,
              expected: "Defaults-ID", keychainAfter: "Defaults-ID", defaultsAfter: "Defaults-ID"),
      Failure(name: "Unreadable Keychain falls back to IDFV",
              keychain: "Legacy-ID", defaults: nil, vendor: "Vendor-ID",
              failRead: true, failReadDefaults: false, failWrite: false,
              expected: "Vendor-ID", keychainAfter: "Vendor-ID", defaultsAfter: "Vendor-ID"),
      Failure(name: "Unreadable Keychain falls back to a generated UUID",
              keychain: "Legacy-ID", defaults: nil, vendor: nil,
              failRead: true, failReadDefaults: false, failWrite: false,
              expected: "Generated-ID", keychainAfter: "Generated-ID", defaultsAfter: "Generated-ID"),
      Failure(name: "Invalid defaults fall back to Keychain",
              keychain: "Legacy-ID", defaults: "Defaults-ID", vendor: "Vendor-ID",
              failRead: false, failReadDefaults: true, failWrite: false,
              expected: "Legacy-ID", keychainAfter: "Legacy-ID", defaultsAfter: "Legacy-ID"),
      Failure(name: "Invalid defaults and missing Keychain fall back to IDFV",
              keychain: nil, defaults: "Defaults-ID", vendor: "Vendor-ID",
              failRead: false, failReadDefaults: true, failWrite: false,
              expected: "Vendor-ID", keychainAfter: "Vendor-ID", defaultsAfter: "Vendor-ID"),
      Failure(name: "Keychain write failure still returns the ID",
              keychain: nil, defaults: nil, vendor: "Vendor-ID",
              failRead: false, failReadDefaults: false, failWrite: true,
              expected: "Vendor-ID", keychainAfter: nil, defaultsAfter: "Vendor-ID"),
      Failure(name: "Every storage failing still returns an ID",
              keychain: "Legacy-ID", defaults: "Defaults-ID", vendor: nil,
              failRead: true, failReadDefaults: true, failWrite: true,
              expected: "Generated-ID", keychainAfter: "Legacy-ID", defaultsAfter: "Generated-ID")
    ]

    for failure in failures {
      let storage = MemoryStorage(keychain: failure.keychain, defaults: failure.defaults)
      storage.failRead = failure.failRead
      storage.failReadDefaults = failure.failReadDefaults
      storage.failWrite = failure.failWrite
      let resolver = DeviceIdentityResolver(
        storage: storage,
        vendorIdentifier: { failure.vendor },
        generateIdentifier: { "Generated-ID" }
      )
      let actual = resolver.getUniqueIdSync()
      precondition(actual == failure.expected, failure.name)
      precondition(storage.keychain == failure.keychainAfter, "\(failure.name): Keychain content")
      precondition(storage.defaults == failure.defaultsAfter, "\(failure.name): defaults content")
      if failure.failRead {
        precondition(storage.keychainWrites == 1, "\(failure.name): unreadable Keychain is rewritten")
      }
      precondition(resolver.getUniqueIdSync() == failure.expected, "\(failure.name): stable across calls")
    }

    let storage = MemoryStorage()
    let resolver = DeviceIdentityResolver(storage: storage, vendorIdentifier: { nil })
    DispatchQueue.concurrentPerform(iterations: 20) { _ in
      _ = resolver.getUniqueIdSync()
    }
    precondition(storage.reads == 1, "Concurrent callers must share one persisted ID")
    precondition(storage.keychain == storage.defaults, "Both stores must contain the same ID")
    print("Passed \(scenarios.count + failures.count + 1) device identity resolver scenarios")
  }
}
