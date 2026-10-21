import Foundation

protocol DeviceIdentityStorage {
  func readKeychain() throws -> String?
  func readUserDefaults() throws -> String?
  func writeKeychain(_ value: String) throws
  func writeUserDefaults(_ value: String)
}

// Serializes the first lookup so concurrent callers cannot create different IDs.
final class DeviceIdentityResolver {
  private let storage: DeviceIdentityStorage
  private let vendorIdentifier: () -> String?
  private let generateIdentifier: () -> String
  private let lock = NSLock()
  private var cachedIdentifier: String?

  init(
    storage: DeviceIdentityStorage,
    vendorIdentifier: @escaping () -> String?,
    generateIdentifier: @escaping () -> String = { UUID().uuidString }
  ) {
    self.storage = storage
    self.vendorIdentifier = vendorIdentifier
    self.generateIdentifier = generateIdentifier
  }

  func getUniqueIdSync() throws -> String {
    lock.lock()
    defer { lock.unlock() }

    if let cachedIdentifier {
      return cachedIdentifier
    }

    let keychainIdentifier = try storage.readKeychain()
    let defaultsIdentifier = try storage.readUserDefaults()
    let identifier = keychainIdentifier ?? defaultsIdentifier
      ?? vendorIdentifier() ?? generateIdentifier()

    if keychainIdentifier == nil {
      try storage.writeKeychain(identifier)
    }
    if defaultsIdentifier == nil {
      storage.writeUserDefaults(identifier)
    }

    cachedIdentifier = identifier
    return identifier
  }
}
