import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getLastStatusListCheckTimestamps,
  storeLastStatusListCheckTimestamp
} from "../storage";
import { STORAGE_KEY_LAST_CHECK_TIME } from "../consts";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

describe("storeLastStatusListCheckTimestamp", () => {
  it("stores the timestamp list under the expected key", async () => {
    await storeLastStatusListCheckTimestamp(1700000000000);

    await expect(
      AsyncStorage.getItem(STORAGE_KEY_LAST_CHECK_TIME)
    ).resolves.toBe("[1700000000000]");
  });

  it("stores at most the latest 10 timestamps", async () => {
    const timestamps = Array.from(
      { length: 11 },
      (_, index) => 1700000000000 + index
    );

    for (const timestamp of timestamps) {
      await storeLastStatusListCheckTimestamp(timestamp);
    }

    await expect(
      AsyncStorage.getItem(STORAGE_KEY_LAST_CHECK_TIME).then(raw =>
        JSON.parse(raw ?? "[]")
      )
    ).resolves.toEqual(timestamps.slice(1));
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

describe("getLastStatusListCheckTimestamps", () => {
  it("returns the stored timestamps", async () => {
    await AsyncStorage.setItem(
      STORAGE_KEY_LAST_CHECK_TIME,
      "[1700000000000,1700000000001]"
    );

    await expect(getLastStatusListCheckTimestamps()).resolves.toEqual([
      1700000000000, 1700000000001
    ]);
  });

  it("returns at most 10 timestamps", async () => {
    const timestamps = Array.from(
      { length: 11 },
      (_, index) => 1700000000000 + index
    );

    await AsyncStorage.setItem(
      STORAGE_KEY_LAST_CHECK_TIME,
      JSON.stringify(timestamps)
    );

    await expect(getLastStatusListCheckTimestamps()).resolves.toEqual(
      timestamps.slice(1)
    );
  });

  it("returns legacy stored timestamp as a single-item list", async () => {
    await AsyncStorage.setItem(STORAGE_KEY_LAST_CHECK_TIME, "1700000000000");

    await expect(getLastStatusListCheckTimestamps()).resolves.toEqual([
      1700000000000
    ]);
  });

  it("returns an empty list when no timestamp is stored", async () => {
    await expect(getLastStatusListCheckTimestamps()).resolves.toEqual([]);
  });

  it.each`
    name                | raw
    ${"invalid json"}   | ${"invalid"}
    ${"invalid schema"} | ${'["1700000000000"]'}
  `("returns an empty list for $name", async ({ raw }) => {
    await AsyncStorage.setItem(STORAGE_KEY_LAST_CHECK_TIME, raw);

    await expect(getLastStatusListCheckTimestamps()).resolves.toEqual([]);
  });

  it("returns an empty list on AsyncStorage errors", async () => {
    jest
      .spyOn(AsyncStorage, "getItem")
      .mockRejectedValueOnce(new Error("boom"));

    await expect(getLastStatusListCheckTimestamps()).resolves.toEqual([]);
  });
});
