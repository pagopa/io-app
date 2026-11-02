import ExpoModulesCore
import Foundation
import Security

final class LegacyDeviceIdentityStorage: DeviceIdentityStorage {
  private static let identityKey = "deviceUID"

  // Match the legacy query, including accessibility and the default access group.
  private var keychainQuery: [String: Any] {
    [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrAccount as String: Self.identityKey,
      kSecAttrService as String: Self.identityKey,
      kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
    ]
  }

  func readKeychain() throws -> String? {
    var query = keychainQuery
    query[kSecReturnData as String] = true
    query[kSecReturnAttributes as String] = true
    var result: CFTypeRef?
    let status = SecItemCopyMatching(query as CFDictionary, &result)
    if status == errSecItemNotFound {
      return nil
    }
    guard status == errSecSuccess else {
      throw DeviceIdentityStorageException(status)
    }
    guard let attributes = result as? [String: Any],
          let data = attributes[kSecValueData as String] as? Data,
          let value = String(data: data, encoding: .utf8) else {
      throw InvalidDeviceIdentityException()
    }
    return value
  }

  func readUserDefaults() throws -> String? {
    guard let value = UserDefaults.standard.object(forKey: Self.identityKey) else {
      return nil
    }
    guard let identifier = value as? String else {
      throw InvalidDeviceIdentityException()
    }
    return identifier
  }

  func writeKeychain(_ value: String) throws {
    var query = keychainQuery
    query[kSecValueData as String] = Data(value.utf8)
    let status = SecItemAdd(query as CFDictionary, nil)
    if status == errSecDuplicateItem, try readKeychain() == value {
      return
    }
    guard status == errSecSuccess else {
      throw DeviceIdentityStorageException(status)
    }
  }

  func writeUserDefaults(_ value: String) {
    UserDefaults.standard.set(value, forKey: Self.identityKey)
  }
}

private final class DeviceIdentityStorageException: GenericException<OSStatus> {
  override var reason: String {
    "Device identity Keychain access failed (OSStatus \(param))"
  }
}

private final class InvalidDeviceIdentityException: Exception {
  override var reason: String {
    "The persisted device identity cannot be decoded"
  }
}
