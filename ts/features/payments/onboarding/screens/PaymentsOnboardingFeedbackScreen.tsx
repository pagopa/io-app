import { IOPictograms } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useRef, useEffect } from "react";
import { View } from "react-native";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { usePagoPaPayment } from "../../checkout/hooks/usePagoPaPayment";
import { PaymentsMethodDetailsRoutes } from "../../details/navigation/routes";
import { getPaymentsWalletUserMethods } from "../../wallet/store/actions";
import * as analytics from "../analytics";
import { usePaymentOnboardingAuthErrorBottomSheet } from "../components/PaymentsOnboardingAuthErrorBottomSheet";
import { PaymentsOnboardingParamsList } from "../navigation/params";
import { paymentsResetRptIdToResume } from "../store/actions";
import {
  selectPaymentOnboardingMethods,
  selectPaymentOnboardingRptIdToResume,
  selectPaymentOnboardingSelectedMethod
} from "../store/selectors";
import {
  WalletOnboardingOutcome,
  WalletOnboardingOutcomeEnum
} from "../types/OnboardingOutcomeEnum";
import { usePaymentFailureSupportModal } from "../../checkout/hooks/usePaymentFailureSupportModal";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";

export type PaymentsOnboardingFeedbackScreenParams = {
  outcome: WalletOnboardingOutcome;
  walletId?: string;
};

type PaymentsOnboardingFeedbackScreenRouteProps = RouteProp<
  PaymentsOnboardingParamsList,
  "PAYMENT_ONBOARDING_RESULT_FEEDBACK"
>;

export const pictogramByOutcome: Record<WalletOnboardingOutcome, IOPictograms> =
  {
    [WalletOnboardingOutcomeEnum.SUCCESS]: "success",
    [WalletOnboardingOutcomeEnum.GENERIC_ERROR]: "umbrellaNew",
    [WalletOnboardingOutcomeEnum.AUTH_ERROR]: "accessDenied",
    [WalletOnboardingOutcomeEnum.TIMEOUT]: "time",
    [WalletOnboardingOutcomeEnum.CANCELED_BY_USER]: "trash",
    [WalletOnboardingOutcomeEnum.INVALID_SESSION]: "umbrellaNew",
    [WalletOnboardingOutcomeEnum.ALREADY_ONBOARDED]: "success",
    [WalletOnboardingOutcomeEnum.BPAY_NOT_FOUND]: "attention",
    [WalletOnboardingOutcomeEnum.PSP_ERROR_ONBOARDING]: "attention",
    [WalletOnboardingOutcomeEnum.BE_KO]: "umbrellaNew"
  };

const PaymentsOnboardingFeedbackScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const route = useRoute<PaymentsOnboardingFeedbackScreenRouteProps>();
  const dispatch = useIODispatch();
  const { outcome, walletId } = route.params;
  const paymentMethodsPot = useIOSelector(selectPaymentOnboardingMethods);
  const selectedPaymentMethodId = useIOSelector(
    selectPaymentOnboardingSelectedMethod
  );
  const availablePaymentMethods = pot.toUndefined(paymentMethodsPot);

  const rptIdToResume = useIOSelector(selectPaymentOnboardingRptIdToResume);
  const { startPaymentFlow } = usePagoPaPayment();
  const { bottomSheet, present } = usePaymentOnboardingAuthErrorBottomSheet();
  const supportModal = usePaymentFailureSupportModal({
    outcome,
    isOnboarding: true
  });
  const paymentMethodSelectedRef = useRef<string | undefined>();

  const outcomeEnumKey = Object.keys(WalletOnboardingOutcomeEnum)[
    Object.values(WalletOnboardingOutcomeEnum).indexOf(outcome)
  ] as keyof typeof WalletOnboardingOutcomeEnum;

  useOnFirstRender(() => {
    const payment_method_selected = availablePaymentMethods?.find(
      paymentMethod => paymentMethod.id === selectedPaymentMethodId
    )?.name;
    // eslint-disable-next-line functional/immutable-data
    paymentMethodSelectedRef.current = payment_method_selected;
    analytics.trackAddOnboardingPaymentMethod(outcome, payment_method_selected);
  });

  useEffect(
    () => () => {
      dispatch(paymentsResetRptIdToResume());
    },
    [dispatch]
  );

  // Disables the hardware back button on Android devices
  useAvoidHardwareBackButton();

  // Disables the swipe back gesture on iOS to the parent stack navigator
  useEffect(() => {
    navigation.getParent()?.setOptions({ gestureEnabled: false });
    // Re-enable swipe after going back
    return () => {
      navigation.getParent()?.setOptions({ gestureEnabled: true });
    };
  }, [navigation, outcome]);

  const handleContinueButton = () => {
    navigation.popToTop();
    if (outcome === WalletOnboardingOutcomeEnum.SUCCESS && walletId) {
      if (rptIdToResume) {
        // Resume payment flow
        // This implementation will be removed as soon as the backend will migrate totally to the NPG. (https://pagopa.atlassian.net/browse/IOBP-632)
        startPaymentFlow(rptIdToResume);
        return;
      }
      dispatch(getPaymentsWalletUserMethods.request());
      navigation.reset({
        index: 1,
        routes: [
          {
            name: ROUTES.MAIN,
            params: {
              screen: ROUTES.WALLET_HOME,
              params: {
                newMethodAdded: true
              }
            }
          },
          {
            name: PaymentsMethodDetailsRoutes.PAYMENT_METHOD_DETAILS_NAVIGATOR,
            params: {
              screen: PaymentsMethodDetailsRoutes.PAYMENT_METHOD_DETAILS_SCREEN,
              params: {
                walletId
              }
            }
          }
        ]
      });
    }
  };

  const handleContactSupport = () => {
    analytics.trackPaymentOnboardingErrorHelp({
      error: outcome,
      payment_method_selected: paymentMethodSelectedRef.current
    });
    supportModal.present();
  };

  const renderSecondaryAction = () => {
    switch (outcome) {
      case WalletOnboardingOutcomeEnum.AUTH_ERROR:
        return {
          label: I18n.t(`wallet.onboarding.outcome.AUTH_ERROR.secondaryAction`),
          accessibilityLabel: I18n.t(
            `wallet.onboarding.outcome.AUTH_ERROR.secondaryAction`
          ),
          onPress: present,
          testID: "wallet-onboarding-secondary-action-button"
        };
      case WalletOnboardingOutcomeEnum.BE_KO:
        return {
          label: I18n.t(`wallet.onboarding.outcome.BE_KO.secondaryAction`),
          accessibilityLabel: I18n.t(
            `wallet.onboarding.outcome.BE_KO.secondaryAction`
          ),
          onPress: handleContactSupport,
          testID: "wallet-onboarding-secondary-action-button"
        };
    }
    return undefined;
  };

  const actionButtonLabel = pipe(
    rptIdToResume,
    O.fromNullable,
    O.fold(
      () => I18n.t(`wallet.onboarding.outcome.${outcomeEnumKey}.primaryAction`),
      () => I18n.t(`wallet.onboarding.outcome.SUCCESS.secondaryAction`)
    )
  );

  return (
    <View style={IOStyles.flex}>
      <OperationResultScreenContent
        title={I18n.t(`wallet.onboarding.outcome.${outcomeEnumKey}.title`)}
        subtitle={I18n.t(
          `wallet.onboarding.outcome.${outcomeEnumKey}.subtitle`
        )}
        pictogram={pictogramByOutcome[outcome]}
        action={{
          label: actionButtonLabel,
          accessibilityLabel: actionButtonLabel,
          onPress: handleContinueButton,
          testID: "wallet-onboarding-continue-button"
        }}
        secondaryAction={renderSecondaryAction()}
      />
      {bottomSheet}
      {supportModal.bottomSheet}
    </View>
  );
};

export { PaymentsOnboardingFeedbackScreen };
