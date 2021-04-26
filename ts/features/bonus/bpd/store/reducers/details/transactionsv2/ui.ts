import { head } from "fp-ts/lib/Array";
import { fromNullable, none, Option, some } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import _ from "lodash";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { WinningTransactionPageResource } from "../../../../../../../../definitions/bpd/winning_transactions_v2/WinningTransactionPageResource";
import { Action } from "../../../../../../../store/actions/types";
import { IndexedById } from "../../../../../../../store/helpers/indexer";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { AwardPeriodId } from "../../../actions/periods";
import {
  BpdTransactionId,
  bpdTransactionsLoadPage,
  bpdTransactionsLoadRequiredData
} from "../../../actions/transactions";
import { bpdSelectedPeriodSelector } from "../selectedPeriod";

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
  requiredDataLoaded: pot.Pot<true, Error>;
  sectionItems: pot.Pot<IndexedById<BpdTransactionsSectionItem>, Error>;
  // Is the date of the first transaction of the first page (aka: the most recent transaction date)
  lastTransactionDate: Date | null;
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
  requiredDataLoaded: pot.none,
  nextCursor: null,
  lastTransactionDate: null
};

export const bpdTransactionsUiReducer = (
  state: BpdTransactionsUiState = initState,
  action: Action
): BpdTransactionsUiState => {
  switch (action.type) {
    case getType(bpdTransactionsLoadPage.request):
      return {
        ...state,
        awardPeriodId: action.payload.awardPeriodId,
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
        ...state,
        // If lastTransactionDate is null, pick the first transaction date
        lastTransactionDate:
          state.lastTransactionDate ??
          head([...action.payload.results.transactions])
            .chain(x => head([...x.transactions]))
            .map(y => y.trxDate)
            .toNullable(),
        awardPeriodId: action.payload.awardPeriodId,
        nextCursor: action.payload.results.nextCursor ?? null,
        sectionItems: pot.some(
          _.mergeWith(currentSectionItems, newSectionItems, customizer)
        )
      };
    case getType(bpdTransactionsLoadPage.failure):
      return {
        ...state,
        awardPeriodId: action.payload.awardPeriodId,
        nextCursor: state.nextCursor,
        sectionItems: pot.toError(state.sectionItems, action.payload.error)
      };

    case getType(bpdTransactionsLoadRequiredData.request):
      return {
        // If the request data are from a different period, clean the state
        ...(action.payload !== state.awardPeriodId ? initState : state),
        requiredDataLoaded: pot.toLoading(state.requiredDataLoaded)
      };
    case getType(bpdTransactionsLoadRequiredData.success):
      return {
        ...state,
        requiredDataLoaded: pot.some(true)
      };
    case getType(bpdTransactionsLoadRequiredData.failure):
      return {
        ...state,
        requiredDataLoaded: pot.toError(
          state.requiredDataLoaded,
          action.payload.error
        )
      };
  }

  return state;
};

/**
 * Return the remote state for all the required data to load the transaction screen.
 * Return always pot.none if the selectedPeriod is different from the local currentPeriod (a different period is chosen, need to reload)
 */
export const bpdTransactionsRequiredDataLoadStateSelector = createSelector(
  [
    (state: GlobalState) =>
      state.bonus.bpd.details.transactionsV2.ui.requiredDataLoaded,
    (state: GlobalState) =>
      state.bonus.bpd.details.transactionsV2.ui.awardPeriodId,
    bpdSelectedPeriodSelector
  ],
  (
    potRequiredData,
    currentPeriodId,
    maybeSelectedPeriod
  ): pot.Pot<true, Error> =>
    fromNullable(maybeSelectedPeriod)
      .chain(selectedPeriod =>
        selectedPeriod.awardPeriodId === currentPeriodId
          ? some(potRequiredData)
          : none
      )
      .getOrElse(pot.none)
);

export const bpdLastTransactionUpdateSelector = createSelector(
  [
    (state: GlobalState) =>
      state.bonus.bpd.details.transactionsV2.ui.lastTransactionDate
  ],
  (lastTransactionDate): Option<Date> => fromNullable(lastTransactionDate)
);
