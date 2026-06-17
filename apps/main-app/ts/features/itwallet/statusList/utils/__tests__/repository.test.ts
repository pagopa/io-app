import AsyncStorage from "@react-native-async-storage/async-storage";
import * as repository from "../repository";
import { type StatusListPayload } from "../schemas";
import { STORAGE_PREFIX } from "../consts";
import { STORAGE_ENTRY_PREFIX } from "../repository";
import { STORAGE_KEY_LAST_CHECK_TIME } from "../storage";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

const makeUri = (id: number) => `https://issuer.example/status/${id}`;

const makePayload = (id: number): StatusListPayload => ({
  sub: makeUri(id),
  exp: 1700000000,
  status_list: { bits: 2, lst: "eNrbuRgAAhcBXQ" }
});

const RESOLVED_AT = 1700000000000;

const makeEntryKey = (uri: string) =>
  `${STORAGE_ENTRY_PREFIX}${encodeURIComponent(uri)}`;

describe("repository", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  describe("upsert and get", () => {
    it("persists an entry and retrieves it by URI", async () => {
      const payload = makePayload(1);
      await repository.upsert(makeUri(1), payload, RESOLVED_AT);

      const result = await repository.get(makeUri(1));
      expect(result).toEqual({
        payload,
        meta: { resolvedAt: RESOLVED_AT }
      });
    });

    it("stores entries under the entry namespace", async () => {
      await repository.upsert(makeUri(1), makePayload(1), RESOLVED_AT);

      await expect(
        AsyncStorage.getItem(makeEntryKey(makeUri(1)))
      ).resolves.toBe(
        JSON.stringify({
          payload: makePayload(1),
          meta: { resolvedAt: RESOLVED_AT }
        })
      );
      await expect(
        AsyncStorage.getItem(
          `${STORAGE_PREFIX}:${encodeURIComponent(makeUri(1))}`
        )
      ).resolves.toBeNull();
    });

    it("overwrites an existing entry for the same URI", async () => {
      const payload1 = makePayload(1);
      const payload2 = { ...makePayload(1), ttl: 7200 };

      await repository.upsert(makeUri(1), payload1, RESOLVED_AT);
      await repository.upsert(makeUri(1), payload2, RESOLVED_AT + 1000);

      const result = await repository.get(makeUri(1));
      expect(result).toEqual({
        payload: payload2,
        meta: { resolvedAt: RESOLVED_AT + 1000 }
      });
    });

    it("does not duplicate entries on re-upsert", async () => {
      const payload = makePayload(1);
      await repository.upsert(makeUri(1), payload, RESOLVED_AT);
      await repository.upsert(makeUri(1), payload, RESOLVED_AT + 1000);

      const entries = await repository.list();
      expect(entries).toHaveLength(1);
    });

    it("keeps concurrently inserted entries visible without index write races", async () => {
      await Promise.all([
        repository.upsert(makeUri(1), makePayload(1), RESOLVED_AT),
        repository.upsert(makeUri(2), makePayload(2), RESOLVED_AT)
      ]);

      const entries = await repository.list();
      expect(entries.map(entry => entry.payload.sub).sort()).toEqual([
        makeUri(1),
        makeUri(2)
      ]);
    });
  });

  describe("get", () => {
    it("returns undefined for a non-existent URI", async () => {
      const result = await repository.get(makeUri(999));
      expect(result).toBeUndefined();
    });

    it("returns undefined for malformed stored data", async () => {
      await AsyncStorage.setItem(makeEntryKey(makeUri(1)), "not-valid-json{{");

      const result = await repository.get(makeUri(1));
      expect(result).toBeUndefined();
    });
  });

  describe("list", () => {
    it("returns empty array when no entries exist", async () => {
      const entries = await repository.list();
      expect(entries).toEqual([]);
    });

    it("returns all valid entries", async () => {
      await repository.upsert(makeUri(1), makePayload(1), RESOLVED_AT);
      await repository.upsert(makeUri(2), makePayload(2), RESOLVED_AT);

      const entries = await repository.list();
      expect(entries).toHaveLength(2);
    });

    it("ignores other storage keys with the same feature prefix", async () => {
      await repository.upsert(makeUri(1), makePayload(1), RESOLVED_AT);
      await AsyncStorage.setItem(STORAGE_KEY_LAST_CHECK_TIME, "1700000000000");

      const entries = await repository.list();
      expect(entries).toHaveLength(1);
      expect(entries[0].payload.sub).toBe(makeUri(1));
    });

    it("does not mutate storage when an entry is malformed", async () => {
      await repository.upsert(makeUri(1), makePayload(1), RESOLVED_AT);
      await repository.upsert(makeUri(2), makePayload(2), RESOLVED_AT);

      await AsyncStorage.setItem(makeEntryKey(makeUri(1)), "corrupt");

      await expect(repository.list()).rejects.toThrow();
      await expect(
        AsyncStorage.getItem(makeEntryKey(makeUri(1)))
      ).resolves.toBe("corrupt");
    });
  });

  describe("remove", () => {
    it("removes an entry by URI", async () => {
      await repository.upsert(makeUri(1), makePayload(1), RESOLVED_AT);
      await repository.remove(makeUri(1));

      const result = await repository.get(makeUri(1));
      expect(result).toBeUndefined();

      const entries = await repository.list();
      expect(entries).toHaveLength(0);
    });

    it("is a no-op for a non-existent URI", async () => {
      await expect(repository.remove(makeUri(999))).resolves.not.toThrow();
    });
  });

  describe("removeMany", () => {
    it("removes multiple entries", async () => {
      await repository.upsert(makeUri(1), makePayload(1), RESOLVED_AT);
      await repository.upsert(makeUri(2), makePayload(2), RESOLVED_AT);
      await repository.upsert(makeUri(3), makePayload(3), RESOLVED_AT);

      await repository.removeMany([makeUri(1), makeUri(3)]);

      const entries = await repository.list();
      expect(entries).toHaveLength(1);
      expect(entries[0].payload.sub).toBe(makeUri(2));
    });

    it("is a no-op for empty array", async () => {
      await expect(repository.removeMany([])).resolves.not.toThrow();
    });
  });

  describe("clear", () => {
    it("removes all entries", async () => {
      await repository.upsert(makeUri(1), makePayload(1), RESOLVED_AT);
      await repository.upsert(makeUri(2), makePayload(2), RESOLVED_AT);

      await repository.clear();

      const entries = await repository.list();
      expect(entries).toEqual([]);
    });

    it("keeps non-entry keys with the same feature prefix", async () => {
      await repository.upsert(makeUri(1), makePayload(1), RESOLVED_AT);
      await AsyncStorage.setItem(STORAGE_KEY_LAST_CHECK_TIME, "1700000000000");

      await repository.clear();

      await expect(
        AsyncStorage.getItem(STORAGE_KEY_LAST_CHECK_TIME)
      ).resolves.toBe("1700000000000");
    });
  });
});
