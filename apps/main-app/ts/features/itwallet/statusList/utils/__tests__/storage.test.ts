import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getLastStatusListCheckTimestamp,
  getPersistedItwVersion,
  STORAGE_KEY_LAST_CHECK_TIME,
  storeLastStatusListCheckTimestamp
} from "../storage";

const PERSIST_KEY = "persist:itWallet";

// Mirrors the redux-persist on-disk shape: each whitelisted slice is itself a
// JSON string within the root object.
const writePersistedEnvironment = (environment: object) =>
  AsyncStorage.setItem(
    PERSIST_KEY,
    JSON.stringify({ environment: JSON.stringify(environment) })
  );

describe("storeLastStatusListCheckTimestamp", () => {
  it("stores the timestamp as a string under the expected key", async () => {
    await storeLastStatusListCheckTimestamp(1700000000000);

    await expect(
      AsyncStorage.getItem(STORAGE_KEY_LAST_CHECK_TIME)
    ).resolves.toBe("1700000000000");
  });

  it("swallows AsyncStorage errors", async () => {
    jest
      .spyOn(AsyncStorage, "setItem")
      .mockRejectedValueOnce(new Error("boom"));

    await expect(
      storeLastStatusListCheckTimestamp(1700000000000)
    ).resolves.toBeUndefined();
  });
});

describe("getLastStatusListCheckTimestamp", () => {
  it("returns the stored timestamp as number", async () => {
    await AsyncStorage.setItem(STORAGE_KEY_LAST_CHECK_TIME, "1700000000000");

    await expect(getLastStatusListCheckTimestamp()).resolves.toBe(
      1700000000000
    );
  });

  it("returns undefined when no timestamp is stored", async () => {
    await expect(getLastStatusListCheckTimestamp()).resolves.toBeUndefined();
  });

  it("returns undefined on AsyncStorage errors", async () => {
    jest
      .spyOn(AsyncStorage, "getItem")
      .mockRejectedValueOnce(new Error("boom"));

    await expect(getLastStatusListCheckTimestamp()).resolves.toBeUndefined();
  });
});

describe("getPersistedItwVersion", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("reads the version from the persisted itWallet store", async () => {
    await writePersistedEnvironment({
      env: "prod",
      itWalletSpecsVersion: "1.3.3"
    });
    await expect(getPersistedItwVersion()).resolves.toBe("1.3.3");
  });

  it("returns the app default when the store is absent", async () => {
    await expect(getPersistedItwVersion()).resolves.toBe("1.0.0");
  });

  it("returns the app default when the persisted payload is malformed", async () => {
    await AsyncStorage.setItem(PERSIST_KEY, "not-json");
    await expect(getPersistedItwVersion()).resolves.toBe("1.0.0");
  });
});
