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
import { useFocusEffect } from "@react-navigation/native";
import { sequenceS, sequenceT } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { capitalize } from "lodash";
import React, { useEffect, useMemo } from "react";
import { View } from "react-native";
import { Transfer } from "../../../../../definitions/pagopa/ecommerce/Transfer";
import { WalletInfo } from "../../../../../definitions/pagopa/ecommerce/WalletInfo";
import { PaymentMethodResponse } from "../../../../../definitions/pagopa/walletv3/PaymentMethodResponse";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { ComponentProps } from "../../../../types/react";
import { findFirstCaseInsensitive } from "../../../../utils/object";
import { UIWalletInfoDetails } from "../../common/types/UIWalletInfoDetails";
import { WalletPaymentMissingMethodsError } from "../components/WalletPaymentMissingMethodsError";
import { useOnTransactionActivationEffect } from "../hooks/useOnTransactionActivationEffect";
import { PaymentsCheckoutRoutes } from "../navigation/routes";
import {
  paymentsCalculatePaymentFeesAction,
  paymentsCreateTransactionAction,
  paymentsGetPaymentUserMethodsAction,
  paymentsResetPaymentPspList
} from "../store/actions/networking";
import {
  selectPaymentMethodAction,
  walletPaymentSetCurrentStep
} from "../store/actions/orchestration";
import {
  walletPaymentAllMethodsSelector,
  walletPaymentAmountSelector,
  walletPaymentDetailsSelector,
  walletPaymentPickedPaymentMethodSelector,
  walletPaymentPspListSelector,
  walletPaymentSavedMethodByIdSelector,
  walletPaymentTransactionSelector,
  walletPaymentUserWalletsSelector
} from "../store/selectors";
import { WalletPaymentOutcomeEnum } from "../types/PaymentOutcomeEnum";
import { WalletPaymentStepEnum } from "../types";

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
  const navigation = useIONavigation();

  const paymentDetailsPot = useIOSelector(walletPaymentDetailsSelector);
  const getSavedtMethodById = useIOSelector(
    walletPaymentSavedMethodByIdSelector
  );
  const paymentAmountPot = useIOSelector(walletPaymentAmountSelector);
  const paymentMethodsPot = useIOSelector(walletPaymentAllMethodsSelector);
  const userWalletsPots = useIOSelector(walletPaymentUserWalletsSelector);
  const transactionPot = useIOSelector(walletPaymentTransactionSelector);
  const selectedWalletOption = useIOSelector(
    walletPaymentPickedPaymentMethodSelector
  );
  const pspListPot = useIOSelector(walletPaymentPspListSelector);
  // const getGenericMethodById = useIOSelector(walletPaymentGenericMethodByIdSelector);

  const [waitingTransactionActivation, setWaitingTransactionActivation] =
    React.useState(false);

  // When a new transaction is created it comes with ACTIVATION_REQUESTED status, we can continue the payment flow
  // only when the transaction status becomes ACTIVATED.
  useOnTransactionActivationEffect(
    React.useCallback(() => {
      pipe(
        sequenceT(O.Monad)(
          pot.toOption(paymentAmountPot),
          pot.toOption(transactionPot),
          selectedWalletOption
        ),
        O.map(([paymentAmountInCents, transaction, selectedWallet]) => {
          // We can safely get this data from the first payment object
          // This logic should be revisited once the cart feature will be implemented
          const primaryPayment = transaction.payments[0];

          const paymentToken = primaryPayment?.paymentToken;
          const primaryTransfer = primaryPayment?.transferList?.[0];
          const isAllCCP = primaryPayment?.isAllCCP;
          const primaryCreditorInstitution = primaryTransfer?.paFiscalCode;

          const transferList = transaction.payments.reduce(
            (a, p) => [...a, ...(p.transferList ?? [])],
            [] as ReadonlyArray<Transfer>
          );

          dispatch(
            paymentsCalculatePaymentFeesAction.request({
              paymentToken,
              paymentMethodId: selectedWallet.paymentMethodId,
              walletId: selectedWallet.walletId,
              paymentAmount: paymentAmountInCents,
              isAllCCP,
              primaryCreditorInstitution,
              transferList
            })
          );
        })
      );
      setWaitingTransactionActivation(false);
    }, [dispatch, paymentAmountPot, selectedWalletOption, transactionPot])
  );

  React.useEffect(() => {
    pipe(
      pspListPot,
      pot.toOption,
      O.map(pspList => {
        if (pspList.length > 1) {
          dispatch(walletPaymentSetCurrentStep(WalletPaymentStepEnum.PICK_PSP));
        } else if (pspList.length >= 1) {
          dispatch(
            walletPaymentSetCurrentStep(
              WalletPaymentStepEnum.CONFIRM_TRANSACTION
            )
          );
        }
      })
    );
  }, [pspListPot, dispatch]);

  const alertRef = React.useRef<View>(null);

  const isLoading =
    pot.isLoading(paymentMethodsPot) || pot.isLoading(userWalletsPots);
  const isLoadingTransaction =
    pot.isLoading(transactionPot) ||
    waitingTransactionActivation ||
    pot.isLoading(pspListPot);

  const isError =
    pot.isError(transactionPot) ||
    pot.isError(paymentMethodsPot) ||
    pot.isError(userWalletsPots) ||
    pot.isError(pspListPot);

  const [shouldShowWarningBanner, setShouldShowWarningBanner] =
    React.useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] =
    React.useState<SelectedMethodState>(undefined);

  useFocusEffect(
    React.useCallback(() => {
      // currently we do not allow onboarding new methods in payment flow
      // dispatch(walletPaymentGetAllMethods.request());
      dispatch(paymentsGetPaymentUserMethodsAction.request());
      dispatch(paymentsResetPaymentPspList());
    }, [dispatch])
  );

  React.useEffect(() => {
    if (isError) {
      navigation.replace(PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_NAVIGATOR, {
        screen: PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_OUTCOME,
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
          dispatch(selectPaymentMethodAction(method));
          dispatch(
            paymentsCreateTransactionAction.request({
              paymentNotices: [
                { rptId: paymentDetails.rptId, amount: paymentDetails.amount }
              ]
            })
          );
          setWaitingTransactionActivation(true);
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

  if (pot.isSome(userWalletsPots) && userWalletsPots.value.length === 0) {
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

  if (details.lastFourDigits !== undefined) {
    return {
      id: method.walletId,
      value: `${capitalize(details.brand)} ••${details.lastFourDigits}`,
      startImage: {
        uri: method.paymentMethodAsset
      }
    };
  } else if (details.maskedEmail !== undefined) {
    return {
      id: method.walletId,
      value: "PayPal",
      startImage: {
        uri: method.paymentMethodAsset
      }
    };
  } else if (details.maskedNumber !== undefined) {
    return {
      id: method.walletId,
      value: "BANCOMAT Pay",
      startImage: {
        uri: method.paymentMethodAsset
      }
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
