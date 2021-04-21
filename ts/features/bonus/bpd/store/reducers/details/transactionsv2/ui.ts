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

/**
 * The type that represents a section item that will be rendered with a SectionList.
 * Each section contains an header (dayInfoId) and a list of trxId (trxList)
 */
type BpdTransactionsSectionItem = {
  dayInfoId: string;
  trxList: ReadonlyArray<BpdTransactionId>;
};

/**
 * Describe this store section, dedicated to rendering paginated transactions.
 */
export type BpdTransactionsUiState = {
  nextCursor: number | null;
  awardPeriodId: AwardPeriodId | null;
  sectionItems: pot.Pot<IndexedById<BpdTransactionsSectionItem>, Error>;
};

/**
 * Extract the ids from the received payload
 * @param page
 */
const fromWinningTransactionPageResourceToBpdTransactionsSectionItem = (
  page: WinningTransactionPageResource
): IndexedById<BpdTransactionsSectionItem> =>
  page.transactions.reduce<IndexedById<BpdTransactionsSectionItem>>(
    (acc, val) => ({
      ...acc,
      [val.date.toISOString()]: {
        dayInfoId: val.date.toISOString(),
        trxList: val.transactions.map(trx => trx.idTrx as BpdTransactionId)
      }
    }),
    {}
  );

/**
 * Helper function for mergeWith, in order to merge the inner list of transactions
 * @param obj
 * @param dst
 */
const customizer = (
  obj: BpdTransactionsSectionItem | undefined,
  dst: BpdTransactionsSectionItem | undefined
): BpdTransactionsSectionItem | undefined => {
  if (obj !== undefined && dst !== undefined) {
    return {
      dayInfoId: dst.dayInfoId,
      trxList: obj.trxList.concat(dst.trxList)
    };
  }

  if (obj === undefined && dst !== undefined) {
    return dst;
  }
  return undefined;
};

const initState: BpdTransactionsUiState = {
  awardPeriodId: null,
  sectionItems: pot.none,
  nextCursor: null
};

export const bpdTransactionsUiReducer = (
  state: BpdTransactionsUiState = initState,
  action: Action
): BpdTransactionsUiState => {
  switch (action.type) {
    case getType(bpdTransactionsLoadPage.request):
      return {
        awardPeriodId: action.payload.awardPeriodId,
        nextCursor: state.nextCursor,
        sectionItems:
          action.payload.awardPeriodId !== state.awardPeriodId
            ? pot.noneLoading
            : pot.toLoading(state.sectionItems)
      };
    case getType(bpdTransactionsLoadPage.success):
      const currentSectionItems = pot.getOrElse(state.sectionItems, {});
      const newSectionItems = fromWinningTransactionPageResourceToBpdTransactionsSectionItem(
        action.payload.results
      );

      return {
        awardPeriodId: action.payload.awardPeriodId,
        nextCursor: action.payload.results.nextCursor ?? null,
        sectionItems: pot.some(
          _.mergeWith(currentSectionItems, newSectionItems, customizer)
        )
      };
    case getType(bpdTransactionsLoadPage.failure):
      return {
        awardPeriodId: action.payload.awardPeriodId,
        nextCursor: state.nextCursor,
        sectionItems: pot.toError(state.sectionItems, action.payload.error)
      };
  }

  return state;
};
