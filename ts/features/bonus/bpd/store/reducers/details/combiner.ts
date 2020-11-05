import * as pot from "italia-ts-commons/lib/pot";
import { createSelector } from "reselect";
import { readPot } from "../../../../../../store/reducers/IndexedByIdPot";
import { isReady, RemoteValue } from "../../../model/RemoteValue";
import { BpdAmount } from "../../actions/amount";
import { BpdPeriod } from "../../actions/periods";
import { bpdEnabledSelector } from "./activation";
import { bpdAllAmountSelector } from "./amounts";
import { bpdPeriodsSelector } from "./periods";

/**
 * Combine the period & amount
 */
export type BpdPeriodAmount = {
  period: BpdPeriod;
  amount: BpdAmount;
};

/**
 * Combine period with the related amount.
 * The pot state is periods driven and the entry BpdPeriodAmount is skipped if the amount
 * for a specific period is !== pot.Some
 * @return {pot.Pot<ReadonlyArray<BpdPeriodAmount>, Error>}
 */
export const bpdAllPeriodsWithAmountSelector = createSelector(
  [bpdPeriodsSelector, bpdAllAmountSelector],
  (potPeriods, amountsIndex) =>
    pot.map(potPeriods, periods =>
      periods.reduce((acc, val) => {
        const potAmount = readPot(val.awardPeriodId, amountsIndex);
        if (pot.isSome(potAmount)) {
          return [...acc, { period: val, amount: potAmount.value }];
        }
        return acc;
      }, [] as ReadonlyArray<BpdPeriodAmount>)
    )
);

/**
 * A period is visible in the wallet if the bpd is enabled and the period is active OR
 * the period is closed and the transactionNumber > 0
 * @param periodAmount
 * @param bpdEnabled
 */
const isPeriodAmountWalletVisible = (
  periodAmount: BpdPeriodAmount,
  bpdEnabled: RemoteValue<boolean, Error>
) =>
  isReady(bpdEnabled) &&
  ((periodAmount.period.status === "Active" && bpdEnabled.value) ||
    (periodAmount.period.status === "Closed" &&
      periodAmount.amount.transactionNumber > 0));

/**
 * Return the {@link BpdPeriodAmount} that can be visible in the wallet
 */
export const bpdPeriodsAmountWalletVisibleSelector = createSelector(
  [bpdAllPeriodsWithAmountSelector, bpdEnabledSelector],
  (potPeriodsAmount, bpdEnabled) =>
    pot.map(potPeriodsAmount, periodsAmountList =>
      periodsAmountList.filter(periodAmount =>
        isPeriodAmountWalletVisible(periodAmount, bpdEnabled)
      )
    )
);

/**
 * The period should be visible in the snapped list only if:
 * state === Closed (a closed period is always visible)
 * bpdEnabled === true (a inactive or current period is visible only if bpd is Enabled)
 * @param periodAmount
 * @param bpdEnabled
 */
const isPeriodAmountSnappedVisible = (
  periodAmount: BpdPeriodAmount,
  bpdEnabled: RemoteValue<boolean, Error>
) =>
  periodAmount.period.status === "Closed" ||
  (isReady(bpdEnabled) && bpdEnabled.value);

/**
 * Return the {@link BpdPeriodAmount} that should be visible in the snapped List selector
 */
export const bpdPeriodsAmountSnappedListSelector = createSelector(
  [bpdAllPeriodsWithAmountSelector, bpdEnabledSelector],
  (potPeriodsAmount, bpdEnabled) =>
    pot.map(potPeriodsAmount, periodsAmountList =>
      periodsAmountList.filter(periodAmount =>
        isPeriodAmountSnappedVisible(periodAmount, bpdEnabled)
      )
    )
);
