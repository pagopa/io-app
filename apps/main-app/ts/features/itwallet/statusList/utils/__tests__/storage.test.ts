import AsyncStorage from "@react-native-async-storage/async-storage";
import { getPersistedItwVersion } from "../storage";

const PERSIST_KEY = "persist:itWallet";

// Mirrors the redux-persist on-disk shape: each whitelisted slice is itself a
// JSON string within the root object.
const writePersistedEnvironment = (environment: object) =>
  AsyncStorage.setItem(
    PERSIST_KEY,
    JSON.stringify({ environment: JSON.stringify(environment) })
  );

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
