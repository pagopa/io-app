import { combineReducers } from "redux";
import { Action } from "../../../../../../../store/actions/types";
import { IndexedById } from "../../../../../../../store/helpers/indexer";
import {
  bpdTransactionsDaysInfoReducer,
  BpdTransactionsDaysInfoState
} from "./daysInfo";
import {
  bpdTransactionsEntityReducer,
  BpdTransactionsEntityState
} from "./entities";

export type BpdTransactionsV2State = {
  daysInfoByPeriod: IndexedById<BpdTransactionsDaysInfoState>;
  entitiesByPeriod: IndexedById<BpdTransactionsEntityState>;
  ui: unknown;
};

export const bpdTransactionsV2Reducer = combineReducers<
  BpdTransactionsV2State,
  Action
>({
  daysInfoByPeriod: bpdTransactionsDaysInfoReducer,
  entitiesByPeriod: bpdTransactionsEntityReducer,
  ui: () => null
});
