import { type CredentialStatus } from "@pagopa/io-react-native-wallet";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { STORAGE_PREFIX } from "../consts";
import { StatusListRepository, STORAGE_ENTRY_PREFIX } from "../repository";
import { STORAGE_KEY_LAST_CHECK_TIME } from "../storage";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

const makeUri = (id: number) => `https://issuer.example/status/${id}`;

const makePayload = (id: number): CredentialStatus.StatusList => ({
  sub: makeUri(id),
  iat: 1690000000,
  exp: 1700000000,
  status_list: { bits: 2, lst: "eNrbuRgAAhcBXQ" }
});

const makeEntryKey = (uri: string) =>
  `${STORAGE_ENTRY_PREFIX}${encodeURIComponent(uri)}`;

describe("repository", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  describe("upsert and get", () => {
    it("persists an entry and retrieves it by URI", async () => {
      const payload = makePayload(1);
      await StatusListRepository.upsert(makeUri(1), payload);

      const result = await StatusListRepository.get(makeUri(1));
      expect(result).toEqual(payload);
    });

    it("stores entries under the entry namespace", async () => {
      await StatusListRepository.upsert(makeUri(1), makePayload(1));

      await expect(
        AsyncStorage.getItem(makeEntryKey(makeUri(1)))
      ).resolves.toBe(JSON.stringify(makePayload(1)));
      await expect(
        AsyncStorage.getItem(
          `${STORAGE_PREFIX}:${encodeURIComponent(makeUri(1))}`
        )
      ).resolves.toBeNull();
    });

    it("overwrites an existing entry for the same URI", async () => {
      const payload1 = makePayload(1);
      const payload2 = { ...makePayload(1), iat: 1695000000 };

      await StatusListRepository.upsert(makeUri(1), payload1);
      await StatusListRepository.upsert(makeUri(1), payload2);

      const result = await StatusListRepository.get(makeUri(1));
      expect(result).toEqual(payload2);
    });

    it("does not duplicate entries on re-upsert", async () => {
      const payload = makePayload(1);
      await StatusListRepository.upsert(makeUri(1), payload);
      await StatusListRepository.upsert(makeUri(1), payload);

      const entries = await StatusListRepository.list();
      expect(entries).toHaveLength(1);
    });

    it("keeps concurrently inserted entries visible without index write races", async () => {
      await Promise.all([
        StatusListRepository.upsert(makeUri(1), makePayload(1)),
        StatusListRepository.upsert(makeUri(2), makePayload(2))
      ]);

      const entries = await StatusListRepository.list();
      expect(entries.map(payload => payload.sub).sort()).toEqual([
        makeUri(1),
        makeUri(2)
      ]);
    });
  });

  describe("get", () => {
    it("returns undefined for a non-existent URI", async () => {
      const result = await StatusListRepository.get(makeUri(999));
      expect(result).toBeUndefined();
    });

    it("returns undefined for malformed stored data", async () => {
      await AsyncStorage.setItem(makeEntryKey(makeUri(1)), "not-valid-json{{");

      const result = await StatusListRepository.get(makeUri(1));
      expect(result).toBeUndefined();
    });
  });

  describe("list", () => {
    it("returns empty array when no entries exist", async () => {
      const entries = await StatusListRepository.list();
      expect(entries).toEqual([]);
    });

    it("returns all valid entries", async () => {
      await StatusListRepository.upsert(makeUri(1), makePayload(1));
      await StatusListRepository.upsert(makeUri(2), makePayload(2));

      const entries = await StatusListRepository.list();
      expect(entries).toHaveLength(2);
    });

    it("ignores other storage keys with the same feature prefix", async () => {
      await StatusListRepository.upsert(makeUri(1), makePayload(1));
      await AsyncStorage.setItem(STORAGE_KEY_LAST_CHECK_TIME, "1700000000000");

      const entries = await StatusListRepository.list();
      expect(entries).toHaveLength(1);
      expect(entries[0].sub).toBe(makeUri(1));
    });

    it("does not mutate storage when an entry is malformed", async () => {
      await StatusListRepository.upsert(makeUri(1), makePayload(1));
      await StatusListRepository.upsert(makeUri(2), makePayload(2));

      await AsyncStorage.setItem(makeEntryKey(makeUri(1)), "corrupt");

      await expect(StatusListRepository.list()).rejects.toThrow();
      await expect(
        AsyncStorage.getItem(makeEntryKey(makeUri(1)))
      ).resolves.toBe("corrupt");
    });
  });

  describe("remove", () => {
    it("removes an entry by URI", async () => {
      await StatusListRepository.upsert(makeUri(1), makePayload(1));
      await StatusListRepository.remove(makeUri(1));

      const result = await StatusListRepository.get(makeUri(1));
      expect(result).toBeUndefined();

      const entries = await StatusListRepository.list();
      expect(entries).toHaveLength(0);
    });

    it("is a no-op for a non-existent URI", async () => {
      await expect(
        StatusListRepository.remove(makeUri(999))
      ).resolves.not.toThrow();
    });
  });

  describe("removeMany", () => {
    it("removes multiple entries", async () => {
      await StatusListRepository.upsert(makeUri(1), makePayload(1));
      await StatusListRepository.upsert(makeUri(2), makePayload(2));
      await StatusListRepository.upsert(makeUri(3), makePayload(3));

      await StatusListRepository.removeMany([makeUri(1), makeUri(3)]);

      const entries = await StatusListRepository.list();
      expect(entries).toHaveLength(1);
      expect(entries[0].sub).toBe(makeUri(2));
    });

    it("is a no-op for empty array", async () => {
      await expect(StatusListRepository.removeMany([])).resolves.not.toThrow();
    });
  });

  describe("clear", () => {
    it("removes all entries", async () => {
      await StatusListRepository.upsert(makeUri(1), makePayload(1));
      await StatusListRepository.upsert(makeUri(2), makePayload(2));

      await StatusListRepository.clear();

      const entries = await StatusListRepository.list();
      expect(entries).toEqual([]);
    });

    it("keeps non-entry keys with the same feature prefix", async () => {
      await StatusListRepository.upsert(makeUri(1), makePayload(1));
      await AsyncStorage.setItem(STORAGE_KEY_LAST_CHECK_TIME, "1700000000000");

      await StatusListRepository.clear();

      await expect(
        AsyncStorage.getItem(STORAGE_KEY_LAST_CHECK_TIME)
      ).resolves.toBe("1700000000000");
    });
  });
});
