import { getType } from "typesafe-actions";
import * as pot from "italia-ts-commons/lib/pot";
import _ from "lodash";
import { WinningTransactionPageResource } from "../../../../../../../../definitions/bpd/winning_transactions_v2/WinningTransactionPageResource";
import { Action } from "../../../../../../../store/actions/types";
import { IndexedById } from "../../../../../../../store/helpers/indexer";
import { AwardPeriodId } from "../../../actions/periods";
import {
  BpdTransactionId,
  bpdTransactionsLoadPage
} from "../../../actions/transactions";

type BpdTransactionsSectionItem = {
  dayInfoId: string;
  list: ReadonlyArray<BpdTransactionId>;
};

export type BpdTransactionsUiState = {
  period: AwardPeriodId | null;
  sectionItems: pot.Pot<IndexedById<BpdTransactionsSectionItem>, Error>;
};

const fromWinningTransactionPageResourceToBpdTransactionsSectionItem = (
  page: WinningTransactionPageResource
): IndexedById<BpdTransactionsSectionItem> =>
  page.transactions.reduce(
    (acc, val) => ({
      ...acc,
      [val.date.toISOString()]: {
        dayInfoId: val.date.toISOString(),
        list: val.transactions.map(trx => trx.idTrx as BpdTransactionId)
      }
    }),
    {}
  );

const combiner = (
  obj: BpdTransactionsSectionItem | undefined,
  dst: BpdTransactionsSectionItem | undefined
): BpdTransactionsSectionItem | undefined => {
  if (obj !== undefined && dst !== undefined) {
    return {
      dayInfoId: dst.dayInfoId,
      list: obj.list.concat(dst.list)
    };
  }

  if (obj === undefined && dst !== undefined) {
    return dst;
  }
  return undefined;
};

const initState: BpdTransactionsUiState = {
  period: null,
  sectionItems: pot.none
};

export const bpdTransactionsUiReducer = (
  state: BpdTransactionsUiState = initState,
  action: Action
): BpdTransactionsUiState => {
  switch (action.type) {
    case getType(bpdTransactionsLoadPage.request):
      return {
        period: action.payload.awardPeriodId,
        sectionItems:
          action.payload.nextCursor === null
            ? pot.noneLoading
            : pot.toLoading(state.sectionItems)
      };
    case getType(bpdTransactionsLoadPage.success):
      const currentSectionItems = pot.getOrElse(state.sectionItems, {});
      const newSectionItems = fromWinningTransactionPageResourceToBpdTransactionsSectionItem(
        action.payload.results
      );

      return {
        period: action.payload.awardPeriodId,
        sectionItems: pot.some(
          _.mergeWith(currentSectionItems, newSectionItems, combiner)
        )
      };
    case getType(bpdTransactionsLoadPage.failure):
      return {
        period: action.payload.awardPeriodId,
        sectionItems: pot.toError(state.sectionItems, action.payload.error)
      };
  }

  return state;
};
