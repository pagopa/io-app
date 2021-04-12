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
import { bpdTransactionsUiReducer, BpdTransactionsUiState } from "./ui";

export type BpdTransactionsV2State = {
  daysInfoByPeriod: IndexedById<BpdTransactionsDaysInfoState>;
  entitiesByPeriod: IndexedById<BpdTransactionsEntityState>;
  ui: BpdTransactionsUiState;
};

export const bpdTransactionsV2Reducer = combineReducers<
  BpdTransactionsV2State,
  Action
>({
  daysInfoByPeriod: bpdTransactionsDaysInfoReducer,
  entitiesByPeriod: bpdTransactionsEntityReducer,
  ui: bpdTransactionsUiReducer
});
