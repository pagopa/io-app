import {
  Alert,
  ListItemHeader,
  RadioGroup,
  RadioItem
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { capitalize } from "lodash";
import React, { useEffect, useMemo } from "react";
import { View } from "react-native";
import { WalletInfo } from "../../../../../definitions/pagopa/ecommerce/WalletInfo";
import { PaymentMethodResponse } from "../../../../../definitions/pagopa/walletv3/PaymentMethodResponse";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { centsToAmount } from "../../../../utils/stringBuilder";
import { UIWalletInfoDetails } from "../../common/types/UIWalletInfoDetails";
import { selectPaymentMethodAction } from "../store/actions/orchestration";
import { walletPaymentAmountSelector } from "../store/selectors";
import {
  walletPaymentAllMethodsSelector,
  walletPaymentSelectedPaymentMethodIdOptionSelector,
  walletPaymentSelectedWalletIdOptionSelector,
  walletPaymentUserWalletsSelector
} from "../store/selectors/paymentMethods";
import { getPaymentLogoFromWalletDetails } from "../../common/utils";

const CheckoutPaymentMethodsList = () => {
  const alertRef = React.useRef<View>(null);
  const dispatch = useIODispatch();

  const [shouldShowWarningBanner, setShouldShowWarningBanner] =
    React.useState<boolean>(false);

  const paymentAmountPot = useIOSelector(walletPaymentAmountSelector);
  const allPaymentMethods = useIOSelector(walletPaymentAllMethodsSelector);
  const userWallets = useIOSelector(walletPaymentUserWalletsSelector);

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

  const userPaymentMethodListItems = useMemo(
    () =>
      pipe(
        userWallets,
        pot.toOption,
        O.map(methods => methods.map(mapUserWalletToRadioItem)),
        O.map(A.map(O.fromNullable)),
        O.map(A.compact),
        O.getOrElse(() => [] as Array<RadioItem<string>>)
      ),
    [userWallets]
  );

  const allPaymentMethodListItems = useMemo(
    () =>
      pipe(
        allPaymentMethods,
        pot.toOption,
        O.map(methods =>
          methods.map(item => mapPaymentMethodToRadioItem(item, paymentAmount))
        ),
        O.getOrElse(() => [] as Array<RadioItem<string>>)
      ),
    [allPaymentMethods, paymentAmount]
  );

  useEffect(() => {
    const hasDisabledMethods =
      [...userPaymentMethodListItems, ...allPaymentMethodListItems].find(
        item => item.disabled
      ) !== undefined;
    setShouldShowWarningBanner(hasDisabledMethods);
  }, [userPaymentMethodListItems, allPaymentMethodListItems]);

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

  const selectedWalletId = O.toUndefined(selectedUserWalletIdOption);
  const selectedPaymentMethodId = O.toUndefined(selectedPaymentMethodIdOption);

  return (
    <>
      {shouldShowWarningBanner && (
        <Alert
          content={I18n.t("wallet.payment.methodSelection.alert.body")}
          variant="warning"
          viewRef={alertRef}
          onPress={() => setShouldShowWarningBanner(false)}
          action={I18n.t("wallet.payment.methodSelection.alert.cta")}
        />
      )}
      <ListItemHeader
        label={I18n.t("wallet.payment.methodSelection.yourMethods")}
      />
      <RadioGroup<string>
        type="radioListItem"
        selectedItem={selectedWalletId}
        items={userPaymentMethodListItems}
        onPress={handleSelectUserWallet}
      />
      <ListItemHeader
        label={I18n.t("wallet.payment.methodSelection.otherMethods")}
      />
      <RadioGroup<string>
        type="radioListItem"
        selectedItem={!selectedWalletId ? selectedPaymentMethodId : undefined}
        items={allPaymentMethodListItems}
        onPress={handleSelectPaymentMethod}
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
    return {
      id: method.walletId,
      value: "PayPal",
      startImage
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
    type="radioListItem"
    items={Array.from({ length: 10 }, (_, id) => ({
      id: id.toString(),
      disabled: true,
      loadingProps: { state: true, skeletonIcon: true },
      value: ""
    }))}
    onPress={() => null}
  />
);

export { CheckoutPaymentMethodsList, CheckoutPaymentMethodsListSkeleton };
