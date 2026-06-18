import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusListRepository } from "../repository";
import * as refresh from "../refresh";
import { startupCoherence, refreshStaleEntries } from "../cache";
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
  iat: 1690000000,
  exp: 1700000000,
  status_list: { bits: 2, lst: "eNrbuRgAAhcBXQ" },
  ...overrides
});

const NOW = 1700000001000; // Just past the default exp (1700000000 * 1000)
const STALE_EXP = 1000; // exp*1000 = 1000000, far in the past
const FRESH_EXP = 9999999999; // exp*1000 far in the future

describe("cache service", () => {
  beforeEach(async () => {
    (refresh.refreshStatusListToken as jest.Mock)
      .mockReset()
      .mockResolvedValue(true);
    await AsyncStorage.clear();

    (refresh.refreshStatusListToken as jest.Mock).mockResolvedValue(true);
  });

  describe("startupCoherence", () => {
    it("does nothing when referencedStatusListUris is undefined", async () => {
      // Owner metadata unavailable: the cache must be left untouched
      await StatusListRepository.upsert(
        makeSub(1),
        makePayload(1, { exp: STALE_EXP })
      );
      await StatusListRepository.upsert(
        makeSub(2),
        makePayload(2, { exp: FRESH_EXP })
      );

      await startupCoherence(undefined);

      // Neither entry should be pruned and no refresh is triggered
      expect(await StatusListRepository.get(makeSub(1))).toBeDefined();
      expect(await StatusListRepository.get(makeSub(2))).toBeDefined();
      expect(refresh.refreshStatusListToken).not.toHaveBeenCalled();
    });

    it("removes unreferenced cached entries", async () => {
      await StatusListRepository.upsert(
        makeSub(1),
        makePayload(1, { exp: FRESH_EXP })
      );
      await StatusListRepository.upsert(
        makeSub(2),
        makePayload(2, { exp: FRESH_EXP })
      );

      // Only sub 1 is referenced
      await startupCoherence([makeSub(1)]);

      // Sub 2 should be removed
      expect(await StatusListRepository.get(makeSub(1))).toBeDefined();
      expect(await StatusListRepository.get(makeSub(2))).toBeUndefined();
    });

    it("keeps referenced entries listed multiple times", async () => {
      await StatusListRepository.upsert(
        makeSub(1),
        makePayload(1, { exp: FRESH_EXP })
      );

      await startupCoherence([makeSub(1), makeSub(1), makeSub(1)]);

      expect(await StatusListRepository.get(makeSub(1))).toBeDefined();
    });

    it("prunes everything when referenced subs is empty", async () => {
      await StatusListRepository.upsert(
        makeSub(1),
        makePayload(1, { exp: FRESH_EXP })
      );

      await startupCoherence([]);

      expect(await StatusListRepository.get(makeSub(1))).toBeUndefined();
    });

    it("never refreshes (refresh is delegated to refreshStaleEntries)", async () => {
      await StatusListRepository.upsert(
        makeSub(1),
        makePayload(1, { exp: STALE_EXP })
      );

      await startupCoherence([makeSub(1)]);

      expect(refresh.refreshStatusListToken).not.toHaveBeenCalled();
    });
  });

  describe("refreshStaleEntries", () => {
    it("refreshes stale cached entries", async () => {
      await StatusListRepository.upsert(
        makeSub(1),
        makePayload(1, { exp: STALE_EXP })
      );
      await StatusListRepository.upsert(
        makeSub(2),
        makePayload(2, { exp: FRESH_EXP })
      );

      await refreshStaleEntries(NOW);

      expect(refresh.refreshStatusListToken).toHaveBeenCalledWith(makeSub(1));
      expect(refresh.refreshStatusListToken).toHaveBeenCalledTimes(1);
    });

    it("does nothing when cache is empty", async () => {
      await refreshStaleEntries(NOW);

      expect(refresh.refreshStatusListToken).not.toHaveBeenCalled();
    });

    it("does nothing when all entries are fresh", async () => {
      await StatusListRepository.upsert(
        makeSub(1),
        makePayload(1, { exp: FRESH_EXP })
      );

      await refreshStaleEntries(NOW);

      expect(refresh.refreshStatusListToken).not.toHaveBeenCalled();
    });

    it("continues refreshing when one refresh fails", async () => {
      await StatusListRepository.upsert(
        makeSub(1),
        makePayload(1, { exp: STALE_EXP })
      );
      await StatusListRepository.upsert(
        makeSub(2),
        makePayload(2, { exp: STALE_EXP })
      );

      (refresh.refreshStatusListToken as jest.Mock)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);

      await refreshStaleEntries(NOW);

      expect(refresh.refreshStatusListToken).toHaveBeenCalledTimes(2);
    });
  });
});
