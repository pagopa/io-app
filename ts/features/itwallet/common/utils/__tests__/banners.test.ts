import { addDays, addYears } from "date-fns";
import MockDate from "mockdate";
import { NonEmptyArray } from "../../../../../types/helpers";
import { BannerHiddenState, getNextBannerState } from "../banners";

describe("ITWallet Banners Utils", () => {
  describe("getNextBannerState", () => {
    describe("when policy is 'always'", () => {
      const mockDate = "2025-01-14T20:43:21.361Z";
      const hiddenUntil = addYears(mockDate, 100).toISOString();

      test.each([
        [
          { hiddenUntil, dismissCount: 1 },
          { hiddenUntil: undefined, dismissCount: 0 }
        ],
        [
          { hiddenUntil, dismissCount: 3 },
          { hiddenUntil: mockDate, dismissCount: 2 }
        ]
      ])(
        "should return %p when current state is %p",
        (nextState, currentState) => {
          MockDate.set(mockDate);
          expect(
            getNextBannerState(
              { kind: "always" },
              currentState as BannerHiddenState
            )
          ).toEqual(nextState);
          MockDate.reset();
        }
      );
    });
    describe("when policy is 'duration'", () => {
      const days = 60;
      const mockDate = "2025-01-14T20:43:21.361Z";
      const hiddenUntil = addDays(mockDate, 60).toISOString();

      test.each([
        [
          { hiddenUntil, dismissCount: 1 },
          { hiddenUntil: undefined, dismissCount: 0 }
        ],
        [
          { hiddenUntil, dismissCount: 2 },
          { hiddenUntil: mockDate, dismissCount: 1 }
        ]
      ])(
        "should return %p when current state is %p",
        (nextState, currentState) => {
          MockDate.set(mockDate);
          expect(
            getNextBannerState(
              { kind: "duration", amount: days },
              currentState as BannerHiddenState
            )
          ).toEqual(nextState);
        }
      );
    });

    describe("when policy is 'progressive-durations'", () => {
      const amounts: NonEmptyArray<number> = [30, 60, 120];
      const mockDate = "2025-01-14T20:43:21.361Z";
      const dates = amounts.map(n => addDays(mockDate, n).toISOString());

      test.each([
        [
          { hiddenUntil: dates[0], dismissCount: 1 },
          { hiddenUntil: undefined, dismissCount: 0 }
        ],
        [
          { hiddenUntil: dates[1], dismissCount: 2 },
          { hiddenUntil: dates[0], dismissCount: 1 }
        ],
        [
          { hiddenUntil: dates[2], dismissCount: 6 },
          { hiddenUntil: undefined, dismissCount: 5 }
        ],
        [
          { hiddenUntil: dates[0], dismissCount: 1 },
          { hiddenUntil: dates[0], dismissCount: 0 }
        ],
        [
          { hiddenUntil: dates[1], dismissCount: 2 },
          { hiddenUntil: dates[0], dismissCount: 1 }
        ],
        [
          { hiddenUntil: dates[2], dismissCount: 6 },
          { hiddenUntil: dates[0], dismissCount: 5 }
        ]
      ])(
        "should return hidden state regardless of current state",
        (nextState, currentState) => {
          MockDate.set(mockDate);
          expect(
            getNextBannerState(
              {
                kind: "progressive-durations",
                amounts
              },
              currentState as BannerHiddenState
            )
          ).toEqual(nextState);
          MockDate.reset();
        }
      );
    });
  });
});
