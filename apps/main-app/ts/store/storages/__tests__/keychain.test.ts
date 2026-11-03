import * as SecureStore from "expo-secure-store";
import * as LegacyKeychain from "react-native-keychain";

import createSecureStorage from "../keychain";

jest.mock("react-native-keychain", () => ({
  STORAGE_TYPE: { AES_GCM_NO_AUTH: "KeystoreAESGCM_NoAuth" },
  getGenericPassword: jest.fn().mockResolvedValue(false),
  resetGenericPassword: jest.fn().mockResolvedValue(true)
}));

const base = "k.006d0079006b00650079";
const options = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
};
const write = jest.mocked(SecureStore.setItemAsync).getMockImplementation()!;
const remove = jest
  .mocked(SecureStore.deleteItemAsync)
  .getMockImplementation()!;

describe("keychain", () => {
  beforeEach(async () => {
    jest.restoreAllMocks();
    jest.mocked(SecureStore.setItemAsync).mockImplementation(write);
    jest.mocked(SecureStore.deleteItemAsync).mockImplementation(remove);
    await createSecureStorage().removeItem("mykey");
    jest.clearAllMocks();
  });

  it("should set,get and remove a value correctly", async () => {
    const storage = createSecureStorage();

    // Set the value
    await storage.setItem("mykey", "myvalue");

    // Get the value and check it is the same
    const value1 = await storage.getItem("mykey");
    expect(value1).toEqual("myvalue");

    // Remove the value
    await storage.removeItem("mykey");

    // Try to get the value and check that undefined (not found) is returned
    const value2 = await storage.getItem("mykey");
    expect(value2).toBeUndefined();
  });

  it.each([
    { name: "slot metadata", suffix: ".s1.n" },
    { name: "first chunk", suffix: ".s1.c0" },
    { name: "second chunk", suffix: ".s1.c1" },
    { name: "commit", suffix: ".active" }
  ])(
    "should preserve the committed value when $name fails",
    async ({ suffix }) => {
      const storage = createSecureStorage();
      await storage.setItem("mykey", "previous value");
      jest
        .spyOn(SecureStore, "setItemAsync")
        .mockImplementation((key, value, options) => {
          if (key === `${base}${suffix}`) {
            return Promise.reject(new Error("interrupted write"));
          }
          return write(key, value, options);
        });

      await expect(storage.setItem("mykey", "x".repeat(2000))).resolves.toBe(
        false
      );
      await expect(createSecureStorage().getItem("mykey")).resolves.toBe(
        "previous value"
      );

      jest.restoreAllMocks();
      jest.mocked(SecureStore.setItemAsync).mockImplementation(write);
      await storage.setItem("mykey", "retried value");
      await expect(storage.getItem("mykey")).resolves.toBe("retried value");
    }
  );

  it("should preserve the previous format until the new value is committed", async () => {
    await SecureStore.setItemAsync(`${base}.n`, "1", options);
    await SecureStore.setItemAsync(`${base}.c0`, "previous format", options);
    const storage = createSecureStorage();
    await expect(storage.getItem("mykey")).resolves.toBe("previous format");
    jest
      .spyOn(SecureStore, "setItemAsync")
      .mockRejectedValueOnce(new Error("interrupted write"));

    await expect(storage.setItem("mykey", "new format")).resolves.toBe(false);
    await expect(storage.getItem("mykey")).resolves.toBe("previous format");

    await storage.setItem("mykey", "new format");
    await expect(storage.getItem("mykey")).resolves.toBe("new format");
  });

  it.each([
    { name: "chunk", suffix: ".s0.c0" },
    { name: "metadata", suffix: ".s0.n" }
  ])(
    "should preserve the active slot when inactive $name cleanup fails",
    async ({ suffix }) => {
      const storage = createSecureStorage();
      await storage.setItem("mykey", "first value");
      await storage.setItem("mykey", "second value");
      jest
        .mocked(SecureStore.deleteItemAsync)
        .mockImplementation((key, options) => {
          if (key === `${base}${suffix}`) {
            return Promise.reject(new Error("interrupted cleanup"));
          }
          return remove(key, options);
        });

      await expect(storage.setItem("mykey", "third value")).resolves.toBe(
        false
      );
      await expect(createSecureStorage().getItem("mykey")).resolves.toBe(
        "second value"
      );

      jest.mocked(SecureStore.deleteItemAsync).mockImplementation(remove);
      await storage.setItem("mykey", "third value");
      await expect(storage.getItem("mykey")).resolves.toBe("third value");
    }
  );

  it("should keep legacy credentials when migration fails and retry later", async () => {
    const credentials = {
      username: "mykey",
      password: "legacy value",
      service: "mykey",
      storage: LegacyKeychain.STORAGE_TYPE.AES_GCM_NO_AUTH
    };
    jest
      .mocked(LegacyKeychain.getGenericPassword)
      .mockResolvedValueOnce(credentials)
      .mockResolvedValueOnce(credentials);
    jest
      .mocked(SecureStore.setItemAsync)
      .mockRejectedValueOnce(new Error("interrupted migration"));
    const storage = createSecureStorage();

    await expect(storage.getItem("mykey")).resolves.toBe("legacy value");
    expect(LegacyKeychain.resetGenericPassword).not.toHaveBeenCalled();
    await expect(storage.getItem("mykey")).resolves.toBe("legacy value");
    expect(LegacyKeychain.resetGenericPassword).toHaveBeenCalledTimes(1);
  });

  it("should migrate legacy credentials before deleting them", async () => {
    jest.mocked(LegacyKeychain.getGenericPassword).mockResolvedValueOnce({
      username: "mykey",
      password: "legacy value",
      service: "mykey",
      storage: LegacyKeychain.STORAGE_TYPE.AES_GCM_NO_AUTH
    });
    const storage = createSecureStorage();

    await expect(storage.getItem("mykey")).resolves.toBe("legacy value");
    expect(LegacyKeychain.resetGenericPassword).toHaveBeenCalledWith({
      service: "mykey"
    });
    await expect(storage.getItem("mykey")).resolves.toBe("legacy value");
  });

  it("should serialize operations across storage instances", async () => {
    const storage = createSecureStorage();
    const otherStorage = createSecureStorage();
    const firstValue = "a".repeat(4000);
    const secondValue = "b".repeat(2000);
    const results = await Promise.all([
      storage.setItem("mykey", firstValue),
      otherStorage.getItem("mykey"),
      otherStorage.setItem("mykey", secondValue),
      storage.getItem("mykey")
    ]);

    expect(results[1]).toBe(firstValue);
    expect(results[3]).toBe(secondValue);
    await storage.removeItem("mykey");
    await expect(otherStorage.getItem("mykey")).resolves.toBeUndefined();
  });
});
