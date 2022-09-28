import * as AR from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import _ from "lodash";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { pipe } from "fp-ts/lib/function";
import { WinningTransactionPageResource } from "../../../../../../../../definitions/bpd/winning_transactions_v2/WinningTransactionPageResource";
import { cardIcons } from "../../../../../../../components/wallet/card/Logo";
import { Action } from "../../../../../../../store/actions/types";
import {
  IndexedById,
  toArray
} from "../../../../../../../store/helpers/indexer";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { paymentMethodsSelector } from "../../../../../../../store/reducers/wallet/wallets";
import { FOUR_UNICODE_CIRCLES } from "../../../../../../../utils/wallet";
import { BpdTransactionDetailRepresentationV2 } from "../../../../screens/details/transaction/detail/BpdTransactionDetailComponent";
import { AwardPeriodId } from "../../../actions/periods";
import {
  BpdTransactionId,
  bpdTransactionsLoadPage,
  bpdTransactionsLoadRequiredData
} from "../../../actions/transactions";
import { pickPaymentMethodFromHashpan } from "../combiner";
import { bpdSelectedPeriodSelector } from "../selectedPeriod";

/**
 * The type that represents a section item that will be rendered with a SectionList.
 * Each section contains an header (dayInfoId) and a list of trxId (data)
 */
export type BpdTransactionsSectionItem = {
  dayInfoId: string;
  data: ReadonlyArray<BpdTransactionId>;
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
        data: val.transactions.map(trx => trx.idTrx as BpdTransactionId)
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
      data: obj.data.concat(dst.data)
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
      const newSectionItems =
        fromWinningTransactionPageResourceToBpdTransactionsSectionItem(
          action.payload.results
        );

      return {
        ...state,
        awardPeriodId: action.payload.awardPeriodId,
        // If lastTransactionDate is null, pick the first transaction date
        lastTransactionDate:
          state.lastTransactionDate ??
          pipe(
            AR.head([...action.payload.results.transactions]),
            O.chain(x => AR.head([...x.transactions])),
            O.map(y => y.trxDate),
            O.toNullable
          ),
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
      return { ...initState, awardPeriodId: action.payload };
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
    pipe(
      maybeSelectedPeriod,
      O.fromNullable,
      O.chain(selectedPeriod =>
        selectedPeriod.awardPeriodId === currentPeriodId
          ? O.some(potRequiredData)
          : O.none
      ),
      O.getOrElseW(() => pot.none)
    )
);

/**
 * Return the {@link Date} of the most recent transaction
 */
export const bpdLastTransactionUpdateSelector = createSelector(
  [
    (state: GlobalState) =>
      state.bonus.bpd.details.transactionsV2.ui.lastTransactionDate
  ],
  (lastTransactionDate): O.Option<Date> => O.fromNullable(lastTransactionDate)
);

/**
 * Return the Pot List of BpdTransactionsSectionItem
 */
export const bpdTransactionsSelector = createSelector(
  [
    (state: GlobalState) =>
      state.bonus.bpd.details.transactionsV2.ui.sectionItems
  ],
  (sectionItems): pot.Pot<ReadonlyArray<BpdTransactionsSectionItem>, Error> =>
    pot.map(sectionItems, si => toArray(si))
);

export const bpdTransactionsGetNextCursor = createSelector(
  [
    (state: GlobalState) => state.bonus.bpd.details.transactionsV2.ui.nextCursor
  ],
  cursor => cursor
);

/**
 * From BpdTransactionId to Option<BpdTransactionDetailRepresentation>
 */
export const bpdTransactionByIdSelector = createSelector(
  [
    (state: GlobalState) =>
      state.bonus.bpd.details.transactionsV2.ui.awardPeriodId,
    (state: GlobalState) =>
      state.bonus.bpd.details.transactionsV2.entitiesByPeriod,
    paymentMethodsSelector,
    bpdSelectedPeriodSelector,
    (_: GlobalState, trxId: BpdTransactionId) => trxId
  ],
  (
    awardPeriodId,
    entitiesByPeriod,
    paymentMethods,
    selectedPeriod,
    trxId
  ): O.Option<BpdTransactionDetailRepresentationV2> =>
    pipe(
      awardPeriodId,
      O.fromNullable,
      O.chain(periodId =>
        pipe(
          entitiesByPeriod[periodId]?.byId[trxId],
          O.fromNullable,
          O.map(trx => ({
            ...trx,
            image: pipe(
              pickPaymentMethodFromHashpan(trx.hashPan, paymentMethods),
              O.map(pm => pm.icon),
              O.getOrElse(() => cardIcons.UNKNOWN)
            ),
            title: pipe(
              pickPaymentMethodFromHashpan(trx.hashPan, paymentMethods),
              O.map(pm => pm.caption),
              O.getOrElse(() => FOUR_UNICODE_CIRCLES)
            ),
            keyId: trx.idTrx,
            maxCashbackForTransactionAmount:
              selectedPeriod?.maxTransactionCashback
          }))
        )
      )
    )
);
