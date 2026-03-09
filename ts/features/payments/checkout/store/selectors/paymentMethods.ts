import _ from "lodash";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { isValidPaymentMethod } from "../../utils";
import { WalletApplicationStatusEnum } from "../../../../../../definitions/pagopa/ecommerce/WalletApplicationStatus";
import { WalletLastUsageTypeEnum } from "../../../../../../definitions/pagopa/ecommerce/WalletLastUsageType";
import { WalletApplicationNameEnum } from "../../../../../../definitions/pagopa/ecommerce/WalletApplicationName";
import { UIWalletInfoDetails } from "../../../common/types/UIWalletInfoDetails";
import { isPaymentMethodExpired } from "../../../common/utils";
import { selectPaymentsCheckoutState } from ".";

export const walletPaymentUserWalletsSelector = createSelector(
  selectPaymentsCheckoutState,
  state => pot.map(state.userWallets, _ => _.wallets ?? [])
);

export const walletPaymentEnabledUserWalletsSelector = createSelector(
  walletPaymentUserWalletsSelector,
  userWalletsPot =>
    pot.map(userWalletsPot, userWallets =>
      userWallets.filter(wallet => {
        const walletDetails = wallet.details as UIWalletInfoDetails;
        return (
          !isPaymentMethodExpired(walletDetails) &&
          wallet.applications.find(
            app =>
              app.name === WalletApplicationNameEnum.PAGOPA &&
              app.status === WalletApplicationStatusEnum.ENABLED
          )
        );
      })
    )
);

export const walletPaymentAllMethodsSelector = createSelector(
  selectPaymentsCheckoutState,
  state =>
    pot.map(
      state.allPaymentMethods,
      ({ paymentMethods }) => paymentMethods?.filter(isValidPaymentMethod) ?? []
    )
);

export const walletRecentPaymentMethodSelector = createSelector(
  selectPaymentsCheckoutState,
  walletPaymentEnabledUserWalletsSelector,
  walletPaymentAllMethodsSelector,
  ({ recentUsedPaymentMethod }, userWallets, allPaymentMethods) => {
    const recentPaymentMethod = pot.toUndefined(recentUsedPaymentMethod);
    if (!recentPaymentMethod) {
      return undefined;
    }
    return recentPaymentMethod?.type === WalletLastUsageTypeEnum.wallet
      ? pot
          .toUndefined(userWallets)
          ?.find(wallet => wallet.walletId === recentPaymentMethod.walletId)
      : pot
          .toUndefined(allPaymentMethods)
          ?.find(method => method.id === recentPaymentMethod.paymentMethodId);
  }
  //   pot.isSome(state.recentUsedPaymentMethod)
  //     ? state.recentUsedPaymentMethod.type === WalletLastUsageTypeEnum.wallet
  //       ? pot
  //           .toUndefined(userWallets)
  //           ?.find(wallet => wallet.id === recentUsedPaymentMethod.walletId)
  //       : pot
  //           .toUndefined(allPaymentMethods)
  //           ?.find(
  //             method =>
  //               method.paymentMethodId ===
  //               recentUsedPaymentMethod.paymentMethodId
  //           )
  //     : undefined;
  // }
);

export const walletPaymentSelectedWalletOptionSelector = createSelector(
  selectPaymentsCheckoutState,
  state => state.selectedWallet
);

export const walletPaymentSelectedPaymentMethodOptionSelector = createSelector(
  selectPaymentsCheckoutState,
  state => state.selectedPaymentMethod
);

export const walletPaymentSelectedPaymentMethodIdOptionSelector =
  createSelector(
    walletPaymentSelectedWalletOptionSelector,
    walletPaymentSelectedPaymentMethodOptionSelector,
    (selectedWalletOption, selectedPaymentMethodOption) =>
      pipe(
        selectedWalletOption,
        O.map(({ paymentMethodId }) => paymentMethodId),
        O.alt(() =>
          pipe(
            selectedPaymentMethodOption,
            O.map(({ id }) => id)
          )
        )
      )
  );

export const walletPaymentSelectedWalletIdOptionSelector = createSelector(
  walletPaymentSelectedWalletOptionSelector,
  selectedWalletOption =>
    pipe(
      selectedWalletOption,
      O.map(({ walletId }) => walletId)
    )
);

export const walletPaymentSelectedPaymentMethodManagementOptionSelector =
  createSelector(
    walletPaymentSelectedPaymentMethodOptionSelector,
    selectedPaymentMethodOption =>
      pipe(
        selectedPaymentMethodOption,
        O.map(({ methodManagement }) => methodManagement)
      )
  );

export const isPaymentsPspBannerClosedSelector = (paymentMethodName: string) =>
  createSelector(
    selectPaymentsCheckoutState,
    state => state.pspBannerClosed?.has(paymentMethodName) ?? false
  );

export const walletPaymentContextualOnboardingUrlSelector = createSelector(
  selectPaymentsCheckoutState,
  state => state.contextualPayment.onboardingUrl
);
