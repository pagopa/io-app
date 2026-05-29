import AsyncStorage from "@react-native-async-storage/async-storage";
import * as repository from "../repository";
import { type StatusListPayload } from "../schemas";

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

    it("does not duplicate URI in index on re-upsert", async () => {
      const payload = makePayload(1);
      await repository.upsert(makeUri(1), payload, RESOLVED_AT);
      await repository.upsert(makeUri(1), payload, RESOLVED_AT + 1000);

      const entries = await repository.list();
      expect(entries).toHaveLength(1);
    });
  });

  describe("get", () => {
    it("returns undefined for a non-existent URI", async () => {
      const result = await repository.get(makeUri(999));
      expect(result).toBeUndefined();
    });

    it("returns undefined for malformed stored data", async () => {
      const key = `@io.itwallet.statusList:entry:${encodeURIComponent(makeUri(1))}`;
      await AsyncStorage.setItem(key, "not-valid-json{{");

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

    it("excludes malformed entries and self-heals the index", async () => {
      await repository.upsert(makeUri(1), makePayload(1), RESOLVED_AT);
      await repository.upsert(makeUri(2), makePayload(2), RESOLVED_AT);

      // Corrupt one entry
      const key = `@io.itwallet.statusList:entry:${encodeURIComponent(makeUri(1))}`;
      await AsyncStorage.setItem(key, "corrupt");

      const entries = await repository.list();
      expect(entries).toHaveLength(1);
      expect(entries[0].payload.sub).toBe(makeUri(2));

      // Verify index was self-healed: listing again should still return 1
      const entries2 = await repository.list();
      expect(entries2).toHaveLength(1);
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
    it("removes all entries and the index", async () => {
      await repository.upsert(makeUri(1), makePayload(1), RESOLVED_AT);
      await repository.upsert(makeUri(2), makePayload(2), RESOLVED_AT);

      await repository.clear();

      const entries = await repository.list();
      expect(entries).toEqual([]);
    });
  });
});
