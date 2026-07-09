import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getLastStatusListCheckTimestamp,
  STORAGE_KEY_LAST_CHECK_TIME,
  storeLastStatusListCheckTimestamp
} from "../storage";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

describe("storage", () => {
  beforeEach(async () => {
    jest.restoreAllMocks();
    await AsyncStorage.clear();
  });

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
});
