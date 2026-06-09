import AsyncStorage from "@react-native-async-storage/async-storage";
import * as repository from "../repository";
import * as refresh from "../refresh";
import { startupCoherence, backgroundRefresh } from "../cache";
import { type StatusListPayload } from "../schemas";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("../refresh");

const makeSub = (id: number) => `https://issuer.example/status/${id}`;

const makePayload = (
  id: number,
  overrides: Partial<StatusListPayload> = {}
): StatusListPayload => ({
  sub: makeSub(id),
  exp: 1700000000,
  status_list: { bits: 2, lst: "eNrbuRgAAhcBXQ" },
  ...overrides
});

const NOW = 1700000001000; // Just past exp (1700000000 * 1000)
const FRESH_RESOLVED_AT = NOW; // Not stale (resolved right now)
const STALE_RESOLVED_AT = 1000; // Very old

describe("cache service", () => {
  beforeEach(async () => {
    (refresh.refreshStatusListToken as jest.Mock)
      .mockReset()
      .mockResolvedValue(true);
    await AsyncStorage.clear();

    (refresh.refreshStatusListToken as jest.Mock).mockResolvedValue(true);
  });

  describe("startupCoherence", () => {
    describe("when referencedStatusListUris is undefined (owner metadata unavailable)", () => {
      it("refreshes stale entries without pruning", async () => {
        // Cache has 2 entries: one stale (exp passed), one fresh (ttl not elapsed)
        await repository.upsert(
          makeSub(1),
          makePayload(1, { exp: 1000 }),
          STALE_RESOLVED_AT
        );
        await repository.upsert(
          makeSub(2),
          makePayload(2, { ttl: 999999 }),
          FRESH_RESOLVED_AT
        );

        await startupCoherence(undefined, NOW);

        expect(refresh.refreshStatusListToken).toHaveBeenCalledWith(makeSub(1));
        expect(refresh.refreshStatusListToken).toHaveBeenCalledTimes(1);

        // Neither entry should be pruned
        expect(await repository.get(makeSub(1))).toBeDefined();
        expect(await repository.get(makeSub(2))).toBeDefined();
      });
    });

    describe("when referencedStatusListUris is provided", () => {
      it("removes unreachable cached entries", async () => {
        await repository.upsert(
          makeSub(1),
          makePayload(1, { ttl: 999999 }),
          FRESH_RESOLVED_AT
        );
        await repository.upsert(
          makeSub(2),
          makePayload(2, { ttl: 999999 }),
          FRESH_RESOLVED_AT
        );

        // Only sub 1 is referenced
        await startupCoherence([makeSub(1)], NOW);

        // Sub 2 should be removed
        expect(await repository.get(makeSub(1))).toBeDefined();
        expect(await repository.get(makeSub(2))).toBeUndefined();
      });

      it("refreshes missing referenced entries", async () => {
        // Cache is empty, but sub 1 is referenced
        await startupCoherence([makeSub(1)], NOW);

        expect(refresh.refreshStatusListToken).toHaveBeenCalledWith(makeSub(1));
      });

      it("refreshes stale referenced entries", async () => {
        await repository.upsert(
          makeSub(1),
          makePayload(1, { exp: 1000 }),
          STALE_RESOLVED_AT
        );

        await startupCoherence([makeSub(1)], NOW);

        expect(refresh.refreshStatusListToken).toHaveBeenCalledWith(makeSub(1));
      });

      it("does not refresh fresh referenced entries", async () => {
        await repository.upsert(
          makeSub(1),
          makePayload(1, { ttl: 999999 }),
          FRESH_RESOLVED_AT
        );

        await startupCoherence([makeSub(1)], NOW);

        expect(refresh.refreshStatusListToken).not.toHaveBeenCalled();
      });

      it("deduplicates referenced subs", async () => {
        await startupCoherence([makeSub(1), makeSub(1), makeSub(1)], NOW);

        expect(refresh.refreshStatusListToken).toHaveBeenCalledTimes(1);
      });

      it("handles empty referenced subs (prunes everything)", async () => {
        await repository.upsert(
          makeSub(1),
          makePayload(1, { ttl: 999999 }),
          FRESH_RESOLVED_AT
        );

        await startupCoherence([], NOW);

        expect(await repository.get(makeSub(1))).toBeUndefined();
      });
    });
  });

  describe("backgroundRefresh", () => {
    it("refreshes stale cached entries", async () => {
      await repository.upsert(
        makeSub(1),
        makePayload(1, { exp: 1000 }),
        STALE_RESOLVED_AT
      );
      await repository.upsert(
        makeSub(2),
        makePayload(2, { ttl: 999999 }),
        FRESH_RESOLVED_AT
      );

      await backgroundRefresh(NOW);

      expect(refresh.refreshStatusListToken).toHaveBeenCalledWith(makeSub(1));
      expect(refresh.refreshStatusListToken).toHaveBeenCalledTimes(1);
    });

    it("does nothing when cache is empty", async () => {
      await backgroundRefresh(NOW);

      expect(refresh.refreshStatusListToken).not.toHaveBeenCalled();
    });

    it("does nothing when all entries are fresh", async () => {
      await repository.upsert(
        makeSub(1),
        makePayload(1, { ttl: 999999 }),
        FRESH_RESOLVED_AT
      );

      await backgroundRefresh(NOW);

      expect(refresh.refreshStatusListToken).not.toHaveBeenCalled();
    });

    it("continues refreshing when one refresh fails", async () => {
      await repository.upsert(
        makeSub(1),
        makePayload(1, { exp: 1000 }),
        STALE_RESOLVED_AT
      );
      await repository.upsert(
        makeSub(2),
        makePayload(2, { exp: 1000 }),
        STALE_RESOLVED_AT
      );

      (refresh.refreshStatusListToken as jest.Mock)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);

      await backgroundRefresh(NOW);

      expect(refresh.refreshStatusListToken).toHaveBeenCalledTimes(2);
    });
  });
});
