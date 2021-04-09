import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../../../store/actions/types";
import { IndexedById } from "../../../../../../../store/helpers/indexer";
import {
  BpdTransactionId,
  bpdTransactionsLoadCountByDay,
  BpdTransactionV2
} from "../../../actions/transactions";

export type BpdPivotTransaction = {
  id: BpdTransactionId;
  amount: number;
};

export type BpdTransactionsEntityState = {
  pivot: pot.Pot<BpdPivotTransaction, Error>;
  byId: IndexedById<BpdTransactionV2>;
  nextCursor: string | null;
  foundPivot: boolean;
};

const initState: BpdTransactionsEntityState = {
  pivot: pot.none,
  nextCursor: null,
  foundPivot: false,
  byId: {}
};

export const bpdTransactionsEntityReducer = (
  state: IndexedById<BpdTransactionsEntityState> = {},
  action: Action
): IndexedById<BpdTransactionsEntityState> => {
  switch (action.type) {
    case getType(bpdTransactionsLoadCountByDay.request):
  }

  return state;
};
