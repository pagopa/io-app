import * as pot from "italia-ts-commons/lib/pot";
import { Action } from "../../../../../../store/actions/types";
import { IndexedById } from "../../../../../../store/helpers/indexer";
import { BpdTransactionId, BpdTransactionV2 } from "../../actions/transactions";

type BpdPivotTransaction = {
  id: BpdTransactionId;
  amount: number;
};

type BpdTransactionsDayInfo = {
  trxDate: Date;
  count: number;
};

type BpdPaginatedTransactionState = {
  pivot: pot.Pot<BpdPivotTransaction, Error>;
  entities: {
    transactions: {
      byId: IndexedById<BpdTransactionV2>;
      all: pot.Pot<ReadonlyArray<BpdTransactionId>, Error>;
      nextCursor: string | null;
      foundPivot: boolean;
    };
    daysInfo: {
      byId: IndexedById<BpdTransactionsDayInfo>;
      all: pot.Pot<ReadonlyArray<string>, Error>;
    };
  };
};

const initState: BpdPaginatedTransactionState = {
  pivot: pot.none,
  entities: {
    transactions: {
      nextCursor: null,
      foundPivot: false,
      byId: {},
      all: pot.none
    },
    daysInfo: {
      byId: {},
      all: pot.none
    }
  }
};

export const paginatedTransactionsReducer = (
  state: BpdPaginatedTransactionState = initState,
  action: Action
): BpdPaginatedTransactionState => {
  switch (action.type) {
  }

  return state;
};
