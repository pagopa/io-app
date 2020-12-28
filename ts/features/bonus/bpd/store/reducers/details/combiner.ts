import { fromNullable, none, Option } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { createSelector } from "reselect";
import { cardIcons } from "../../../../../../components/wallet/card/Logo";
import { paymentMethodsSelector } from "../../../../../../store/reducers/wallet/wallets";
import { PaymentMethod } from "../../../../../../types/pagopa";
import { getPaymentMethodHash } from "../../../../../../utils/paymentMethod";
import { FOUR_UNICODE_CIRCLES } from "../../../../../../utils/wallet";
import { EnhancedBpdTransaction } from "../../../components/transactionItem/BpdTransactionItem";
import { isReady, RemoteValue } from "../../../model/RemoteValue";
import { BpdPaymentMethodActivation } from "../../actions/paymentMethods";
import { BpdTransaction } from "../../actions/transactions";
import { bpdEnabledSelector } from "./activation";
import { bpdPaymentMethodActivationSelector } from "./paymentMethods";
import { BpdPeriodWithInfo, bpdPeriodsSelector } from "./periods";
import { bpdSelectedPeriodSelector } from "./selectedPeriod";
import { bpdTransactionsForSelectedPeriod } from "./transactions";

/**
 * A period is visible in the wallet if the bpd is enabled AND the period is active OR
 * the period is closed and the transactionNumber > 0 OR
 * bpd is enabled AND the period is inactive (future) AND there are no active or closed period
 * @param periodList
 * @param periodAmount should be a period in periodList
 * @param bpdEnabled
 */
const isPeriodAmountWalletVisible = (
  periodList: ReadonlyArray<BpdPeriodWithInfo>,
  periodAmount: BpdPeriodWithInfo,
  bpdEnabled: RemoteValue<boolean, Error>
) =>
  isReady(bpdEnabled) &&
  ((periodAmount.status === "Active" && bpdEnabled.value) ||
    (periodAmount.status === "Closed" &&
      periodAmount.amount.transactionNumber > 0) ||
    // All the periods are inactive
    (periodList.every(p => p.status === "Inactive") &&
      // This is the first inactive period
      periodList.indexOf(periodAmount) === 0 &&
      periodAmount.status === "Inactive" &&
      bpdEnabled.value));

/**
 * Return the {@link BpdPeriodWithInfo} that can be visible in the wallet
 */
export const bpdPeriodsAmountWalletVisibleSelector = createSelector(
  [bpdPeriodsSelector, bpdEnabledSelector],
  (potPeriodsAmount, bpdEnabled) =>
    pot.map(potPeriodsAmount, periodsAmountList => {
      const periodsOrderedByDate = periodsAmountList
        // create a sorted copy of the array
        .concat()
        .sort((pa1, pa2) =>
          pa1.startDate < pa2.startDate
            ? -1
            : pa1.startDate > pa2.startDate
            ? 1
            : 0
        );
      return periodsOrderedByDate.filter(periodAmount =>
        isPeriodAmountWalletVisible(
          periodsOrderedByDate,
          periodAmount,
          bpdEnabled
        )
      );
    })
);

/**
 * The period should be visible in the snapped list only if:
 * state === Closed (a closed period is always visible)
 * bpdEnabled === true (a inactive or current period is visible only if bpd is Enabled)
 * @param periodAmount
 * @param bpdEnabled
 */
const isPeriodAmountSnappedVisible = (
  periodAmount: BpdPeriodWithInfo,
  bpdEnabled: RemoteValue<boolean, Error>
) =>
  periodAmount.status === "Closed" || (isReady(bpdEnabled) && bpdEnabled.value);

/**
 * Return the {@link BpdPeriodWithInfo} that should be visible in the snapped List selector
 */
export const bpdPeriodsAmountSnappedListSelector = createSelector(
  [bpdPeriodsSelector, bpdEnabledSelector],
  (potPeriodsAmount, bpdEnabled) =>
    pot.map(potPeriodsAmount, periodsAmountList =>
      periodsAmountList.filter(periodAmount =>
        isPeriodAmountSnappedVisible(periodAmount, bpdEnabled)
      )
    )
);

/**
 * Pick a payment instrument from the wallet, using the provided hashpan
 * @param hashPan
 * @param potPaymentMethods
 */
const pickPaymentMethodFromHashpan = (
  hashPan: string,
  potPaymentMethods: pot.Pot<ReadonlyArray<PaymentMethod>, Error>
): Option<PaymentMethod> =>
  pot.getOrElse(
    pot.map(potPaymentMethods, paymentMethods =>
      fromNullable(
        paymentMethods.find(w => getPaymentMethodHash(w) === hashPan)
      )
    ),
    none
  );

const getId = (transaction: BpdTransaction) =>
  `${transaction.awardPeriodId}${transaction.trxDate}${transaction.hashPan}${transaction.idTrxAcquirer}${transaction.idTrxIssuer}${transaction.amount}`;

/**
 * Enhance a {@link BpdTransaction}, trying to found the payment method in the wallet,
 * in order to associate a caption and an icon
 */
export const bpdDisplayTransactionsSelector = createSelector(
  [
    bpdTransactionsForSelectedPeriod,
    paymentMethodsSelector,
    bpdSelectedPeriodSelector
  ],
  (
    potTransactions,
    paymentMethod,
    period
  ): pot.Pot<ReadonlyArray<EnhancedBpdTransaction>, Error> =>
    pot.map(potTransactions, transactions =>
      transactions.map(
        t =>
          ({
            ...t,
            image: pickPaymentMethodFromHashpan(t.hashPan, paymentMethod)
              .map(pm => pm.icon)
              .getOrElse(cardIcons.UNKNOWN),
            title: pickPaymentMethodFromHashpan(t.hashPan, paymentMethod)
              .map(pm => pm.caption)
              .getOrElse(FOUR_UNICODE_CIRCLES),
            keyId: getId(t),
            maxCashbackForTransactionAmount: period?.maxTransactionCashback
          } as EnhancedBpdTransaction)
      )
    )
);

/**
 * There is at least one payment method with bpd enabled?
 */
export const atLeastOnePaymentMethodHasBpdEnabledSelector = createSelector(
  [paymentMethodsSelector, bpdPaymentMethodActivationSelector],
  (paymentMethodsPot, bpdActivations): boolean =>
    pot.getOrElse(
      pot.map(paymentMethodsPot, paymentMethods =>
        paymentMethods.some(pm =>
          fromNullable(getPaymentMethodHash(pm))
            .map(hpan => bpdActivations[hpan])
            .map(
              potActivation =>
                potActivation &&
                pot.isSome(potActivation) &&
                potActivation.value.activationStatus === "active"
            )
            .getOrElse(false)
        )
      ),
      false
    )
);

export type PaymentMethodWithActivation = PaymentMethod &
  Partial<Pick<BpdPaymentMethodActivation, "activationStatus">>;

/**
 * Add the information of activationStatus to a PatchedWalletV2
 * in order to group the elements "notActivable"
 */
export const paymentMethodsWithActivationStatusSelector = createSelector(
  [paymentMethodsSelector, bpdPaymentMethodActivationSelector],
  (paymentMethodsPot, bpdActivations) =>
    pot.map(paymentMethodsPot, paymentMethods =>
      paymentMethods.map(pm => {
        // try to extract the activation status to enhance the wallet
        const activationStatus = fromNullable(getPaymentMethodHash(pm))
          .chain(hp => fromNullable(bpdActivations[hp]))
          .map(paymentMethodActivation =>
            pot.getOrElse(
              pot.map(
                paymentMethodActivation,
                activationStatus => activationStatus.activationStatus
              ),
              undefined
            )
          )
          .getOrElse(undefined);
        return { ...pm, activationStatus };
      })
    )
);
