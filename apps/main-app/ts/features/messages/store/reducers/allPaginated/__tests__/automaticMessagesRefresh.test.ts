import * as pot from "@pagopa/ts-commons/lib/pot";

import { requestAutomaticMessagesRefresh } from "../../../actions";
import { reduceAutomaticMessageRefreshRequest } from "../automaticMessagesRefresh";
import { AllPaginated } from "../types";

const emptyCollection = {
  data: pot.none,
  lastRequest: undefined,
  lastUpdateTime: new Date(0)
} as const;

describe("reduceAutomaticMessageRefreshRequest", () => {
  describe.each([
    {
      category: "INBOX" as const,
      targetKey: "inbox" as const,
      otherKey: "archive" as const
    },
    {
      category: "ARCHIVE" as const,
      targetKey: "archive" as const,
      otherKey: "inbox" as const
    }
  ])(
    "given a requestAutomaticMessagesRefresh('$category') action",
    ({ category, targetKey, otherKey }) => {
      it("should reset the target collection's lastUpdateTime to new Date(0)", () => {
        const lastUpdateTime = new Date();
        const state: AllPaginated = {
          archive: { ...emptyCollection, lastUpdateTime },
          inbox: { ...emptyCollection, lastUpdateTime },
          shownCategory: "INBOX"
        };
        const next = reduceAutomaticMessageRefreshRequest(
          state,
          requestAutomaticMessagesRefresh(category)
        );
        expect(next[targetKey].lastUpdateTime).toStrictEqual(new Date(0));
      });

      it("should not reset the other collection's lastUpdateTime", () => {
        const lastUpdateTime = new Date();
        const state: AllPaginated = {
          archive: { ...emptyCollection, lastUpdateTime },
          inbox: { ...emptyCollection, lastUpdateTime },
          shownCategory: "INBOX"
        };
        const next = reduceAutomaticMessageRefreshRequest(
          state,
          requestAutomaticMessagesRefresh(category)
        );
        expect(next[otherKey].lastUpdateTime).toStrictEqual(lastUpdateTime);
      });
    }
  );
});
