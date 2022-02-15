import * as pot from "italia-ts-commons/lib/pot";
import { DeepPartial } from "redux";
import { Transaction } from "../../../../types/pagopa";
import { GlobalState } from "../../types";
import { getSafeUnreadTransactionsNumSelector } from "../readTransactions";

const transactionsState: DeepPartial<GlobalState> = {
  wallet: {
    transactions: {
      transactions: pot.some({
        "1": { id: 1, accountingStatus: 1 } as Transaction,
        "2": { id: 2, accountingStatus: 1 } as Transaction,
        "3": { id: 3, accountingStatus: 1 } as Transaction
      })
    }
  },
  entities: {
    transactionsRead: {
      "1": 1
    }
  }
};

describe("readTransaction", () => {
  describe("getSafeUnreadTransactionsNumSelector", () => {
    it("should return the correct unread transaction number", () => {
      const state: DeepPartial<GlobalState> = {
        profile: pot.some<any>({
          is_email_validated: true,
          email: "test@email.it"
        }),
        ...transactionsState
      };

      const output = getSafeUnreadTransactionsNumSelector(
        state as unknown as GlobalState
      );

      expect(output).toBe(2);
    });

    it("should return the 0 because the email is not validated", () => {
      const state: DeepPartial<GlobalState> = {
        profile: pot.some<any>({
          is_email_validated: false,
          email: "test@email.it"
        }),
        ...transactionsState
      };

      const output = getSafeUnreadTransactionsNumSelector(
        state as unknown as GlobalState
      );

      expect(output).toBe(0);
    });
  });
});
