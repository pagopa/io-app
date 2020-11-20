import { fromNullable, none, Option } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { createSelector } from "reselect";
import { Abi } from "../../../../../../../definitions/pagopa/walletv2/Abi";
import pagoBancomatImage from "../../../../../../../img/wallet/cards-icons/pagobancomat.png";
import {
  cardIcons,
  getCardIconFromBrandLogo
} from "../../../../../../components/wallet/card/Logo";
import I18n from "../../../../../../i18n";
import { readPot } from "../../../../../../store/reducers/IndexedByIdPot";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  getPaymentMethodHash,
  paymentMethodsSelector
} from "../../../../../../store/reducers/wallet/wallets";
import {
  BancomatInfo,
  CreditCardInfo,
  isBancomat,
  isCreditCard,
  PaymentMethod
} from "../../../../../../types/pagopa";
import { abiListSelector } from "../../../../../wallet/onboarding/store/abi";
import { EnhancedBpdTransaction } from "../../../components/transactionItem/BpdTransactionItem";
import { isReady, RemoteValue } from "../../../model/RemoteValue";
import { BpdAmount } from "../../actions/amount";
import { BpdPaymentMethodActivation } from "../../actions/paymentMethods";
import { BpdPeriod } from "../../actions/periods";
import { BpdTransaction } from "../../actions/transactions";
import { bpdEnabledSelector } from "./activation";
import { bpdAllAmountSelector } from "./amounts";
import { bpdPaymentMethodActivationSelector } from "./paymentMethods";
import { bpdPeriodsSelector } from "./periods";
import { bpdSelectedPeriodSelector } from "./selectedPeriod";
import { bpdTransactionsForSelectedPeriod } from "./transactions";

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

/**
 * Pick a payment instrument from the wallet, using the provided hashpan
 * @param hashPan
 * @param potWalletV2
 */
const pickPaymentMethodFromHashpan = (
  hashPan: string,
  potPaymentMethods: pot.Pot<ReadonlyArray<PaymentMethod>, Error>
): Option<PaymentMethod> =>
  pot.getOrElse(
    pot.map(potPaymentMethods, paymentMethods =>
      fromNullable(
        paymentMethods.find(w => getPaymentMethodHash(w.info) === hashPan)
      )
    ),
    none
  );

/**
 * Choose an image to represent a {@link PaymentMethod}
 * @param paymentMethod
 */
const getImageFromPaymentMethod = (paymentMethod: PaymentMethod) => {
  if (isCreditCard(paymentMethod)) {
    return getCardIconFromBrandLogo(paymentMethod);
  }
  if (isBancomat(paymentMethod)) {
    return pagoBancomatImage;
  }
  return cardIcons.UNKNOWN;
};

// TODO: unify card representation (multiple part of the application use this)
const FOUR_UNICODE_CIRCLES = "●".repeat(4);

/**
 * Choose a textual representation for a {@link PatchedWalletV2}
 * @param paymentMethod
 * @param abiList
 */
const getTitleFromPaymentMethod = (
  paymentMethod: PaymentMethod,
  abiList: ReadonlyArray<Abi>
) => {
  if (isCreditCard(paymentMethod)) {
    return getTitleFromCard(paymentMethod.info);
  }
  if (isBancomat(paymentMethod)) {
    return getTitleFromBancomat(paymentMethod.info, abiList);
  }
  return FOUR_UNICODE_CIRCLES;
};

const getTitleFromCard = (creditCard: CreditCardInfo) =>
  `${FOUR_UNICODE_CIRCLES} ${creditCard.creditCard.blurredNumber}`;

const getTitleFromBancomat = (
  bancomatInfo: BancomatInfo,
  abiList: ReadonlyArray<Abi>
) =>
  fromNullable(
    abiList.find(abi => abi.abi === bancomatInfo.bancomat.issuerAbiCode)
  )
    .map(abi => abi.name)
    .getOrElse(I18n.t("wallet.methods.bancomat.name"));

const getId = (transaction: BpdTransaction) =>
  `${transaction.awardPeriodId}${transaction.trxDate}${transaction.hashPan}${transaction.idTrxAcquirer}${transaction.idTrxIssuer}${transaction.amount}`;

/**
 * Enhance a {@link BpdTransaction} with an image and a title, using the wallet and the abilist
 */
export const bpdDisplayTransactionsSelector = createSelector<
  GlobalState,
  pot.Pot<ReadonlyArray<BpdTransaction>, Error>,
  pot.Pot<ReadonlyArray<PaymentMethod>, Error>,
  ReadonlyArray<Abi>,
  BpdPeriod | undefined,
  pot.Pot<ReadonlyArray<EnhancedBpdTransaction>, Error>
>(
  [
    bpdTransactionsForSelectedPeriod,
    paymentMethodsSelector,
    abiListSelector,
    bpdSelectedPeriodSelector
  ],
  (potTransactions, paymentMethod, abiList, period) =>
    pot.map(potTransactions, transactions =>
      transactions.map(
        t =>
          ({
            ...t,
            image: pickPaymentMethodFromHashpan(t.hashPan, paymentMethod)
              .map(getImageFromPaymentMethod)
              .getOrElse(cardIcons.UNKNOWN),
            title: pickPaymentMethodFromHashpan(t.hashPan, paymentMethod)
              .map(w2 => getTitleFromPaymentMethod(w2, abiList))
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
          fromNullable(getPaymentMethodHash(pm.info))
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
export const walletV2WithActivationStatusSelector = createSelector(
  [paymentMethodsSelector, bpdPaymentMethodActivationSelector],
  (paymentMethodsPot, bpdActivations) =>
    pot.map(paymentMethodsPot, paymentMethods =>
      paymentMethods.map(pm => {
        // try to extract the activation status to enhance the wallet
        const activationStatus = fromNullable(getPaymentMethodHash(pm.info))
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
