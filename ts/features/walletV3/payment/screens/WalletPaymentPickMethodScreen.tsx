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
import { sequenceS, sequenceT } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { capitalize } from "lodash";
import React, { useEffect, useMemo } from "react";
import { View } from "react-native";
import { PaymentMethodResponse } from "../../../../../definitions/pagopa/walletv3/PaymentMethodResponse";
import { WalletInfo } from "../../../../../definitions/pagopa/walletv3/WalletInfo";
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
import { UIWalletInfoDetails } from "../../details/types/UIWalletInfoDetails";
import { WalletPaymentMissingMethodsError } from "../components/WalletPaymentMissingMethodsError";
import { useWalletPaymentGoBackHandler } from "../hooks/useWalletPaymentGoBackHandler";
import { WalletPaymentRoutes } from "../navigation/routes";
import {
  walletPaymentCreateTransaction,
  walletPaymentGetUserWallets
} from "../store/actions/networking";
import { walletPaymentPickPaymentMethod } from "../store/actions/orchestration";
import {
  walletPaymentAllMethodsSelector,
  walletPaymentAmountSelector,
  walletPaymentDetailsSelector,
  walletPaymentSavedMethodByIdSelector,
  walletPaymentTransactionSelector,
  walletPaymentUserWalletsSelector
} from "../store/selectors";
import { WalletPaymentOutcomeEnum } from "../types/PaymentOutcomeEnum";

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
  const handleGoBack = useWalletPaymentGoBackHandler();

  useHeaderSecondLevel({
    title: "",
    backAccessibilityLabel: I18n.t("global.buttons.back"),
    goBack: handleGoBack,
    contextualHelp: emptyContextualHelp,
    faqCategories: ["payment"],
    supportRequest: true
  });

  const paymentDetailsPot = useIOSelector(walletPaymentDetailsSelector);
  const transactionPot = useIOSelector(walletPaymentTransactionSelector);
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
  const isLoadingTransaction = pot.isLoading(transactionPot);

  const isError =
    pot.isError(transactionPot) ||
    pot.isError(paymentMethodsPot) ||
    pot.isError(userWalletsPots);

  const [shouldShowWarningBanner, setShouldShowWarningBanner] =
    React.useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] =
    React.useState<SelectedMethodState>(undefined);

  useFocusEffect(
    React.useCallback(() => {
      // dispatch(walletPaymentGetAllMethods.request()); // currently we do not allow onboarding new methods in payment flow
      dispatch(walletPaymentGetUserWallets.request());
    }, [dispatch])
  );

  React.useEffect(() => {
    if (isError) {
      navigation.navigate(WalletPaymentRoutes.WALLET_PAYMENT_MAIN, {
        screen: WalletPaymentRoutes.WALLET_PAYMENT_OUTCOME,
        params: {
          outcome: WalletPaymentOutcomeEnum.GENERIC_ERROR
        }
      });
    }
  }, [isError, navigation]);

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

  const navigateToPspSelectionScreen = () => {
    navigation.navigate(WalletPaymentRoutes.WALLET_PAYMENT_MAIN, {
      screen: WalletPaymentRoutes.WALLET_PAYMENT_PICK_PSP
    });
  };

  const handleContinue = () => {
    // todo:: should handle the case where the user
    // selects a non saved method
    if (selectedMethod?.kind === "saved") {
      pipe(
        sequenceT(O.Monad)(
          getSavedtMethodById(selectedMethod.walletId),
          pot.toOption(paymentDetailsPot)
        ),
        O.map(([method, paymentDetails]) => {
          dispatch(walletPaymentPickPaymentMethod(method));
          dispatch(
            walletPaymentCreateTransaction.request({
              paymentNotices: [
                { rptId: paymentDetails.rptId, amount: paymentDetails.amount }
              ],
              onSucces: navigateToPspSelectionScreen
            })
          );
        })
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
    return <WalletPaymentMissingMethodsError />;
  }

  return (
    <GradientScrollView
      primaryActionProps={
        canContinue
          ? {
              label: I18n.t("global.buttons.continue"),
              accessibilityLabel: I18n.t("global.buttons.continue"),
              onPress: handleContinue,
              disabled: isLoading || isLoadingTransaction,
              loading: isLoading || isLoadingTransaction
            }
          : undefined
      }
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
  const details = method.details as UIWalletInfoDetails;

  if (details.maskedPan !== undefined) {
    return {
      id: method.walletId,
      value: `${capitalize(details.brand)} ••${details.maskedPan}`,
      startImage: getIconWithFallback(details.brand)
    };
  } else if (details.maskedEmail !== undefined) {
    return {
      id: method.walletId,
      value: "PayPal",
      startImage: getIconWithFallback("paypal")
    };
  } else if (details.maskedNumber !== undefined) {
    return {
      id: method.walletId,
      value: "BANCOMAT Pay",
      startImage: getIconWithFallback("bancomatpay")
    };
  }

  return undefined;
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
