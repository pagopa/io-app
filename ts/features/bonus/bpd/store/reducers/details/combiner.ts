import { fromNullable, none, Option } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { createSelector } from "reselect";
import { Abi } from "../../../../../../../definitions/pagopa/walletv2/Abi";
import { WalletTypeEnum } from "../../../../../../../definitions/pagopa/walletv2/WalletV2";
import pagoBancomatImage from "../../../../../../../img/wallet/cards-icons/pagobancomat.png";
import {
  cardIcons,
  getCardIconFromBrandLogo
} from "../../../../../../components/wallet/card/Logo";
import I18n from "../../../../../../i18n";
import { readPot } from "../../../../../../store/reducers/IndexedByIdPot";
import { GlobalState } from "../../../../../../store/reducers/types";
import { walletV2Selector } from "../../../../../../store/reducers/wallet/wallets";
import { PatchedWalletV2 } from "../../../../../../types/pagopa";
import { abiListSelector } from "../../../../../wallet/onboarding/store/abi";
import { EnhancedBpdTransaction } from "../../../components/transactionItem/BpdTransactionItem";
import { isReady, RemoteValue } from "../../../model/RemoteValue";
import { BpdAmount } from "../../actions/amount";
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

/**
 * Choose an image to represent a {@link PatchedWalletV2}
 * @param w2
 */
const getImageFromWallet = (w2: PatchedWalletV2) => {
  switch (w2.walletType) {
    case WalletTypeEnum.Card:
      return getCardIconFromBrandLogo(w2.info);
    case WalletTypeEnum.Bancomat:
      return pagoBancomatImage;
    default:
      return cardIcons.UNKNOWN;
  }
};

// TODO: unify card representation (multiple part of the application use this)
const FOUR_UNICODE_CIRCLES = "●".repeat(4);

/**
 * Choose a textual representation for a {@link PatchedWalletV2}
 * @param w2
 * @param abiList
 */
const getTitleFromWallet = (
  w2: PatchedWalletV2,
  abiList: ReadonlyArray<Abi>
) => {
  switch (w2.walletType) {
    case WalletTypeEnum.Card:
      return getTitleFromCard(w2);
    case WalletTypeEnum.Bancomat:
      return getTitleFromBancomat(w2, abiList);
    default:
      return FOUR_UNICODE_CIRCLES;
  }
};

const getTitleFromCard = (w2: PatchedWalletV2) =>
  `${FOUR_UNICODE_CIRCLES} ${w2.info.blurredNumber}`;

const getTitleFromBancomat = (
  w2: PatchedWalletV2,
  abiList: ReadonlyArray<Abi>
) =>
  fromNullable(abiList.find(abi => abi.abi === w2.info.issuerAbiCode))
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
  pot.Pot<ReadonlyArray<PatchedWalletV2>, Error>,
  ReadonlyArray<Abi>,
  BpdPeriod | undefined,
  pot.Pot<ReadonlyArray<EnhancedBpdTransaction>, Error>
>(
  [
    bpdTransactionsForSelectedPeriod,
    walletV2Selector,
    abiListSelector,
    bpdSelectedPeriodSelector
  ],
  (potTransactions, wallet, abiList, period) =>
    pot.map(potTransactions, transactions =>
      transactions.map(
        t =>
          ({
            ...t,
            image: pickWalletFromHashpan(t.hashPan, wallet)
              .map(getImageFromWallet)
              .getOrElse(cardIcons.UNKNOWN),
            title: pickWalletFromHashpan(t.hashPan, wallet)
              .map(w2 => getTitleFromWallet(w2, abiList))
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
  [walletV2Selector, bpdPaymentMethodActivationSelector],
  (walletV2Pot, bpdActivations): boolean =>
    pot.getOrElse(
      pot.map(walletV2Pot, walletv2 =>
        walletv2.some(w =>
          fromNullable(w.info.hashPan)
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
