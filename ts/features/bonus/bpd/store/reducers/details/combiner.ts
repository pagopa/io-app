import { Option, none, fromNullable } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { createSelector } from "reselect";
import { WalletTypeEnum } from "../../../../../../../definitions/pagopa/bancomat/WalletV2";
import {
  cardIcons,
  getCardIconFromBrandLogo
} from "../../../../../../components/wallet/card/Logo";
import { readPot } from "../../../../../../store/reducers/IndexedByIdPot";
import { walletV2Selector } from "../../../../../../store/reducers/wallet/wallets";
import { PatchedWalletV2 } from "../../../../../../types/pagopa";
import { abiListSelector } from "../../../../../wallet/onboarding/store/abi";
import { isReady, RemoteValue } from "../../../model/RemoteValue";
import { BpdAmount } from "../../actions/amount";
import { BpdPeriod } from "../../actions/periods";
import pagoBancomatImage from "../../../../../../../img/wallet/cards-icons/pagobancomat.png";
import { bpdEnabledSelector } from "./activation";
import { bpdAllAmountSelector } from "./amounts";
import { bpdPeriodsSelector } from "./periods";
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
const pickWalletFromHashpan = (
  hashPan: string,
  potWalletV2: pot.Pot<ReadonlyArray<PatchedWalletV2>, Error>
): Option<PatchedWalletV2> =>
  pot.getOrElse(
    pot.map(potWalletV2, walletV2 =>
      fromNullable(walletV2.find(w => w.info.hashPan === hashPan))
    ),
    none
  );

const extractImageFromWallet = (w2: PatchedWalletV2) => {
  switch (w2.walletType) {
    case WalletTypeEnum.Card:
      return getCardIconFromBrandLogo(w2.info);
    case WalletTypeEnum.Bancomat:
      return pagoBancomatImage;
    default:
      return cardIcons.UNKNOWN;
  }
};

export const bpdDisplayTransactionsSelector = createSelector(
  [bpdTransactionsForSelectedPeriod, walletV2Selector, abiListSelector],
  (potTransactions, wallet, abiListSelector) =>
    pot.map(potTransactions, transactions =>
      transactions.map(t => ({
        ...t,
        imageMy: pickWalletFromHashpan(t.hashPan, wallet)
          .map(extractImageFromWallet)
          .getOrElse(cardIcons.UNKNOWN)
      }))
    )
);
