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
  // daysInfoState, groupBy period
  daysInfoByPeriod: IndexedById<BpdTransactionsDaysInfoState>;
  // transactionsEntitiesState, groupBy period
  entitiesByPeriod: IndexedById<BpdTransactionsEntityState>;
  // Ui state for transactions details
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
