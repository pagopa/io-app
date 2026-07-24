import {
  Alert,
  ListItemHeader,
  RadioGroup,
  RadioItem
} from "@io-app/design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import _, { capitalize } from "lodash";
import { useEffect, useMemo, useState } from "react";

import { WalletInfo } from "../../../../../definitions/pagopa/ecommerce/WalletInfo";
import { WalletStatusEnum } from "../../../../../definitions/pagopa/ecommerce/WalletStatus";
import { PaymentMethodResponse } from "../../../../../definitions/pagopa/walletv3/PaymentMethodResponse";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { centsToAmount } from "../../../../utils/stringBuilder";
import { UIWalletInfoDetails } from "../../common/types/UIWalletInfoDetails";
import { getPaymentLogoFromWalletDetails } from "../../common/utils";
import { selectPaymentMethodAction } from "../store/actions/orchestration";
import { walletPaymentAmountSelector } from "../store/selectors";
import {
  walletPaymentAllMethodsSelector,
  walletPaymentEnabledUserWalletsSelector,
  walletPaymentSelectedPaymentMethodIdOptionSelector,
  walletPaymentSelectedWalletIdOptionSelector,
  walletRecentPaymentMethodSelector
} from "../store/selectors/paymentMethods";

const CheckoutPaymentMethodsList = () => {
  const dispatch = useIODispatch();

  const [shouldShowWarningBanner, setShouldShowWarningBanner] =
    useState<boolean>(false);

  const paymentAmountPot = useIOSelector(walletPaymentAmountSelector);
  const allPaymentMethods = useIOSelector(walletPaymentAllMethodsSelector);
  const userWallets = useIOSelector(walletPaymentEnabledUserWalletsSelector);
  const recentUsedPaymentMethod = useIOSelector(
    walletRecentPaymentMethodSelector
  );

  const selectedUserWalletIdOption = useIOSelector(
    walletPaymentSelectedWalletIdOptionSelector
  );
  const selectedPaymentMethodIdOption = useIOSelector(
    walletPaymentSelectedPaymentMethodIdOptionSelector
  );

  const paymentAmount = pipe(
    pot.toOption(paymentAmountPot),
    O.map(centsToAmount),
    O.getOrElse(() => 0)
  );

  const recentPaymentMethodListItem = useMemo(
    () =>
      pipe(
        recentUsedPaymentMethod,
        O.fromNullable,
        O.chainNullableK(a => {
          if (a.status === WalletStatusEnum.VALIDATED) {
            return mapUserWalletToRadioItem(a);
          }
          return mapPaymentMethodToRadioItem(a, paymentAmount);
        }),
        O.map(A.of),
        O.getOrElse(() => [] as Array<RadioItem<string>>)
      ),
    [recentUsedPaymentMethod, paymentAmount]
  );

  const userPaymentMethodListItems = useMemo(
    () =>
      pipe(
        userWallets,
        pot.toOption,
        O.map(methods => methods.map(mapUserWalletToRadioItem)),
        O.map(A.map(O.fromNullable)),
        O.map(A.compact),
        O.map(
          A.filter(
            method =>
              !recentPaymentMethodListItem.some(item => item.id === method.id)
          )
        ),
        O.getOrElse(() => [] as Array<RadioItem<string>>)
      ),
    [userWallets, recentPaymentMethodListItem]
  );

  const allPaymentMethodListItems = useMemo(
    () =>
      pipe(
        allPaymentMethods,
        pot.toOption,
        O.map(methods =>
          methods.map(item => mapPaymentMethodToRadioItem(item, paymentAmount))
        ),
        O.map(
          A.filter(
            method =>
              !recentPaymentMethodListItem.some(item => item.id === method.id)
          )
        ),
        O.getOrElse(() => [] as Array<RadioItem<string>>)
      ),
    [allPaymentMethods, paymentAmount, recentPaymentMethodListItem]
  );

  useEffect(() => {
    const hasDisabledMethods =
      [
        ...userPaymentMethodListItems,
        ...allPaymentMethodListItems,
        ...recentPaymentMethodListItem
      ].find(item => item.disabled) !== undefined;
    setShouldShowWarningBanner(hasDisabledMethods);
  }, [
    userPaymentMethodListItems,
    allPaymentMethodListItems,
    recentPaymentMethodListItem
  ]);

  const handleSelectUserWallet = (walletId: string) =>
    pipe(
      userWallets,
      pot.toOption,
      O.chainNullableK(wallets =>
        wallets.find(wallets => wallets.walletId === walletId)
      ),
      O.map(userWallet => {
        dispatch(
          selectPaymentMethodAction({
            userWallet
          })
        );
      })
    );

  const handleSelectPaymentMethod = (paymentMethodId: string) =>
    pipe(
      allPaymentMethods,
      pot.toOption,
      O.chainNullableK(methods =>
        methods.find(method => method.id === paymentMethodId)
      ),
      O.map(paymentMethod => {
        dispatch(
          selectPaymentMethodAction({
            paymentMethod
          })
        );
      })
    );

  const handleOnSelectRecentPaymentMethod = (walletId: string) =>
    recentUsedPaymentMethod?.status === WalletStatusEnum.VALIDATED
      ? handleSelectUserWallet(walletId)
      : handleSelectPaymentMethod(walletId);

  const selectedWalletId = O.toUndefined(selectedUserWalletIdOption);
  const selectedPaymentMethodId = O.toUndefined(selectedPaymentMethodIdOption);

  return (
    <>
      {shouldShowWarningBanner && (
        <Alert
          action={I18n.t("wallet.payment.methodSelection.alert.cta")}
          content={I18n.t("wallet.payment.methodSelection.alert.body")}
          onPress={() => setShouldShowWarningBanner(false)}
          variant="warning"
        />
      )}
      {!_.isEmpty(recentPaymentMethodListItem) && (
        <ListItemHeader
          label={I18n.t("wallet.payment.methodSelection.latestMethod")}
        />
      )}
      <RadioGroup<string>
        items={recentPaymentMethodListItem}
        onPress={handleOnSelectRecentPaymentMethod}
        selectedItem={selectedWalletId || selectedPaymentMethodId}
        type="radioListItem"
      />
      {!_.isEmpty(userPaymentMethodListItems) && (
        <ListItemHeader
          label={I18n.t("wallet.payment.methodSelection.yourMethods")}
        />
      )}
      <RadioGroup<string>
        items={userPaymentMethodListItems}
        onPress={handleSelectUserWallet}
        selectedItem={selectedWalletId}
        type="radioListItem"
      />
      {!_.isEmpty(allPaymentMethodListItems) && (
        <ListItemHeader
          label={I18n.t("wallet.payment.methodSelection.otherMethods")}
        />
      )}
      <RadioGroup<string>
        items={allPaymentMethodListItems}
        onPress={handleSelectPaymentMethod}
        selectedItem={!selectedWalletId ? selectedPaymentMethodId : undefined}
        type="radioListItem"
      />
    </>
  );
};

const mapPaymentMethodToRadioItem = (
  method: PaymentMethodResponse,
  transactionAmount: number
): RadioItem<string> => {
  const maxAmount = method.ranges[0]?.max ?? 0;
  const disabled = transactionAmount > maxAmount;

  return {
    id: method.id,
    value: method.description,
    disabled,
    startImage: method.asset ? { uri: method.asset } : { icon: "creditCard" }
  };
};

const mapUserWalletToRadioItem = (
  method: WalletInfo
): RadioItem<string> | undefined => {
  const details = method.details as UIWalletInfoDetails;
  const paymentLogo = getPaymentLogoFromWalletDetails(details);
  const startImage = {
    ...(paymentLogo !== undefined
      ? { paymentLogo }
      : { uri: method.paymentMethodAsset })
  };

  if (details.lastFourDigits !== undefined) {
    return {
      id: method.walletId,
      value: `${capitalize(details.brand)} ••${details.lastFourDigits}`,
      startImage
    };
  } else if (details.maskedEmail !== undefined) {
    const details = method.details as UIWalletInfoDetails;
    const description =
      details.pspBusinessName && details.maskedEmail
        ? `${details.pspBusinessName} · ${details.maskedEmail}`
        : undefined;
    return {
      id: method.walletId,
      value: I18n.t("wallet.payment.methodType.fastPayPalPayment"),
      startImage,
      description
    };
  } else if (details.maskedNumber !== undefined) {
    return {
      id: method.walletId,
      value: "BANCOMAT Pay",
      startImage
    };
  }

  return undefined;
};

const CheckoutPaymentMethodsListSkeleton = () => (
  <RadioGroup<string>
    items={Array.from({ length: 10 }, (_, id) => ({
      id: id.toString(),
      disabled: true,
      loadingProps: { state: true, skeletonIcon: true },
      value: ""
    }))}
    onPress={() => null}
    type="radioListItem"
  />
);

export { CheckoutPaymentMethodsList, CheckoutPaymentMethodsListSkeleton };
