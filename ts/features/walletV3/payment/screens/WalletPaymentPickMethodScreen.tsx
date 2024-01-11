import {
  Alert,
  GradientScrollView,
  H2,
  IOPaymentLogos,
  ListItemHeader,
  ListItemRadio,
  RadioGroup,
  RadioItem,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { capitalize } from "lodash";
import React, { useEffect, useMemo } from "react";
import { View } from "react-native";
import { PaymentMethodResponse } from "../../../../../definitions/pagopa/walletv3/PaymentMethodResponse";
import { WalletInfo } from "../../../../../definitions/pagopa/walletv3/WalletInfo";
import { WalletInfoDetails1 } from "../../../../../definitions/pagopa/walletv3/WalletInfoDetails";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { ComponentProps } from "../../../../types/react";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { findFirstCaseInsensitive } from "../../../../utils/object";
import { WalletPaymentRoutes } from "../navigation/routes";
import {
  walletPaymentGetAllMethods,
  walletPaymentGetUserWallets
} from "../store/actions/networking";
import { walletPaymentPickPaymentMethod } from "../store/actions/orchestration";
import {
  walletPaymentAllMethodsSelector,
  walletPaymentAmountSelector,
  walletPaymentSavedMethodByIdSelector,
  walletPaymentUserWalletsSelector
} from "../store/selectors";

type SavedMethodState = {
  kind: "saved";
  walletId: string;
  methodId?: undefined;
};

type NotSavedMethodState = {
  kind: "generic";
  methodId: string;
  walletId?: undefined;
};

type SelectedMethodState = SavedMethodState | NotSavedMethodState | undefined;

const WalletPaymentPickMethodScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const getSavedtMethodById = useIOSelector(
    walletPaymentSavedMethodByIdSelector
  );
  const paymentAmountPot = useIOSelector(walletPaymentAmountSelector);
  const paymentMethodsPot = useIOSelector(walletPaymentAllMethodsSelector);
  const userWalletsPots = useIOSelector(walletPaymentUserWalletsSelector);
  // const getGenericMethodById = useIOSelector(walletPaymentGenericMethodByIdSelector);

  const alertRef = React.useRef<View>(null);

  const isLoading =
    pot.isLoading(paymentMethodsPot) || pot.isLoading(userWalletsPots);

  const [shouldShowWarningBanner, setShouldShowWarningBanner] =
    React.useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] =
    React.useState<SelectedMethodState>(undefined);

  useHeaderSecondLevel({
    title: "",
    backAccessibilityLabel: I18n.t("global.buttons.back"),
    goBack: navigation.goBack,
    contextualHelp: emptyContextualHelp,
    faqCategories: ["payment"],
    supportRequest: true
  });

  useFocusEffect(
    React.useCallback(() => {
      dispatch(walletPaymentGetAllMethods.request());
      dispatch(walletPaymentGetUserWallets.request());
    }, [dispatch])
  );

  const paymentAmount = pot.getOrElse(paymentAmountPot, undefined);
  const canContinue = selectedMethod !== undefined;

  const savedMethodsListItems = useMemo(
    () =>
      pipe(
        userWalletsPots,
        pot.toOption,
        O.map(methods => methods.map(mapSavedToRadioItem)),
        O.map(A.map(O.fromNullable)),
        O.map(A.compact),
        O.getOrElse(() => [] as Array<RadioItem<string>>)
      ),
    [userWalletsPots]
  );

  const genericMethodsListItems = useMemo(
    () =>
      pipe(
        paymentMethodsPot,
        pot.toOption,
        O.map(methods =>
          methods.map(item => mapGenericToRadioItem(item, paymentAmount))
        ),
        O.getOrElse(() => [] as Array<RadioItem<string>>)
      ),
    [paymentMethodsPot, paymentAmount]
  );

  const handleSelectSavedMethod = (walletId: string) => {
    setSelectedMethod({
      kind: "saved",
      walletId
    });
  };

  /* Will be decommented once generic methods are implemented
  const handleSelectNotSavedMethod = (methodId: string) => {
     setSelectedMethod({
       kind: "generic",
       methodId
     });
   }; 
   */

  const handleContinue = () => {
    // todo:: should handle the case where the user
    // selects a non saved method
    if (selectedMethod?.kind === "saved") {
      pipe(
        getSavedtMethodById(selectedMethod.walletId),
        O.map(walletPaymentPickPaymentMethod),
        O.map(dispatch),
        O.map(() =>
          navigation.navigate(WalletPaymentRoutes.WALLET_PAYMENT_MAIN, {
            screen: WalletPaymentRoutes.WALLET_PAYMENT_PICK_PSP
          })
        )
      );
    }
  };

  useEffect(() => {
    if (!isLoading) {
      const hasDisabledMethods =
        [...genericMethodsListItems, ...savedMethodsListItems].find(
          item => item.disabled
        ) !== undefined;
      setShouldShowWarningBanner(hasDisabledMethods);
    }
  }, [isLoading, genericMethodsListItems, savedMethodsListItems]);

  if (!isLoading && savedMethodsListItems.length === 0) {
    return <></>;
  }

  return (
    <GradientScrollView
      primaryActionProps={{
        label: I18n.t("global.buttons.continue"),
        accessibilityLabel: I18n.t("global.buttons.continue"),
        onPress: handleContinue,
        disabled: isLoading || !canContinue,
        loading: isLoading
      }}
    >
      <H2>{I18n.t("wallet.payment.methodSelection.header")}</H2>
      <VSpacer size={16} />
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
        selectedItem={selectedMethod?.walletId}
        items={isLoading ? loadingRadios : savedMethodsListItems}
        onPress={handleSelectSavedMethod}
      />
      {
        // since there will be a transitory phase where this list is not
        // returned, this is commented until the generic methods are implemented
        // genericMethodsListItems.length > 0 && (
        //   <>
        //     <ListItemHeader
        //       label={I18n.t("wallet.payment.methodSelection.otherMethods")}
        //     />
        //     <RadioGroup<string>
        //       type="radioListItem"
        //       selectedItem={selectedMethod?.methodId}
        //       items={isLoading ? loadingRadios : genericMethodsListItems}
        //       onPress={handleSelectNotSavedMethod}
        //     />
        //   </>
        // )
      }
    </GradientScrollView>
  );
};

const getIconWithFallback = (
  brand?: string
): ComponentProps<typeof ListItemRadio>["startImage"] => {
  const logos = IOPaymentLogos;
  return pipe(
    brand,
    O.fromNullable,
    O.chain(findFirstCaseInsensitive(logos)),
    O.map(([brand]) => brand),
    O.fold(
      () => ({ icon: "creditCard" }),
      // @ts-expect-error ts whines because this function can return
      // two different -- both correct -- types (see return type)
      brand => ({ paymentLogo: brand as IOPaymentLogos })
    )
  );
};

const mapGenericToRadioItem = (
  method: PaymentMethodResponse,
  transactionAmount?: number
): RadioItem<string> => ({
  id: method.id,
  value: method.description,
  disabled: isMethodDisabledForAmount(method, transactionAmount),
  startImage: getIconWithFallback(method.asset)
});

const mapSavedToRadioItem = (
  method: WalletInfo
): RadioItem<string> | undefined => {
  switch (method.details?.type) {
    case "CARDS":
      const cardDetails = method.details as WalletInfoDetails1;
      return {
        id: method.walletId,
        value: `${capitalize(cardDetails.brand)} ••${cardDetails.maskedPan}`,
        startImage: getIconWithFallback(cardDetails.brand)
      };
    case "PAYPAL":
      return {
        id: method.walletId,
        value: "PayPal",
        startImage: getIconWithFallback("paypal")
      };
    case "BANCOMATPAY":
      return {
        id: method.walletId,
        value: "BANCOMAT Pay",
        startImage: getIconWithFallback("bancomatpay")
      };
    default:
      return undefined;
  }
};

const isMethodDisabledForAmount = (
  method: PaymentMethodResponse,
  transactionAmount?: number
): boolean =>
  pipe(
    sequenceS(O.Monad)({
      min: O.fromNullable(method.ranges[0].min),
      max: O.fromNullable(method.ranges[0].max),
      amount: O.fromNullable(transactionAmount)
    }),
    O.fold(
      () => false,
      ({ min, max, amount }) => min > amount || max < amount
    )
  );

const loadingRadios: Array<RadioItem<string>> = Array.from(
  { length: 10 },
  (_, id) => ({
    id: id.toString(),
    disabled: true,
    loadingProps: { state: true },
    value: ""
  })
);

export { WalletPaymentPickMethodScreen };
