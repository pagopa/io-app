import { IOPictograms } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useRef } from "react";
import { View } from "react-native";
import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import {
  IOAnimatedPictograms,
  IOAnimatedPictogramsAssets
} from "../../../../components/ui/AnimatedPictogram";
import { updateMixpanelProfileProperties } from "../../../../mixpanelConfig/profileProperties";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { openWebUrl } from "../../../../utils/url";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { usePaymentFailureSupportModal } from "../../checkout/hooks/usePaymentFailureSupportModal";
import { PaymentsMethodDetailsRoutes } from "../../details/navigation/routes";
import { getPaymentsWalletUserMethods } from "../../wallet/store/actions";
import * as analytics from "../analytics";
import { PaymentsOnboardingParamsList } from "../navigation/params";
import {
  selectPaymentOnboardingMethods,
  selectPaymentOnboardingSelectedMethod
} from "../store/selectors";
import {
  WalletOnboardingOutcome,
  WalletOnboardingOutcomeEnum
} from "../types/OnboardingOutcomeEnum";
import { trackHelpCenterCtaTapped } from "../../../../utils/analytics";

export type PaymentsOnboardingFeedbackScreenParams = {
  outcome: WalletOnboardingOutcome;
  walletId?: string;
};

type PaymentsOnboardingFeedbackScreenRouteProps = RouteProp<
  PaymentsOnboardingParamsList,
  "PAYMENT_ONBOARDING_RESULT_FEEDBACK"
>;

const pictogramByOutcome: Record<
  WalletOnboardingOutcome,
  IOPictograms | IOAnimatedPictograms
> = {
  [WalletOnboardingOutcomeEnum.SUCCESS]: "success",
  [WalletOnboardingOutcomeEnum.GENERIC_ERROR]: "umbrella",
  [WalletOnboardingOutcomeEnum.AUTH_ERROR]: "error",
  [WalletOnboardingOutcomeEnum.TIMEOUT]: "time",
  [WalletOnboardingOutcomeEnum.CANCELED_BY_USER]: "trash",
  [WalletOnboardingOutcomeEnum.INVALID_SESSION]: "umbrella",
  [WalletOnboardingOutcomeEnum.ALREADY_ONBOARDED]: "success",
  [WalletOnboardingOutcomeEnum.BPAY_NOT_FOUND]: "attention",
  [WalletOnboardingOutcomeEnum.PSP_ERROR_ONBOARDING]: "attention",
  [WalletOnboardingOutcomeEnum.BE_KO]: "umbrella"
};

const PAYMENT_AUTHORIZATION_DENIED_ERROR = "PAYMENT_AUTHORIZATION_DENIED_ERROR";

const ASSISTANCE_URL =
  "https://assistenza.ioapp.it/hc/it/articles/35337442750225-Non-riesco-ad-aggiungere-un-metodo-di-pagamento";

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

  const supportModal = usePaymentFailureSupportModal({
    outcome,
    isOnboarding: true
  });
  const paymentMethodSelectedRef = useRef<string | undefined>(undefined);
  const store = useIOStore();

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
    if (outcome === WalletOnboardingOutcomeEnum.SUCCESS) {
      void updateMixpanelProfileProperties(store.getState(), {
        property: "SAVED_PAYMENT_METHOD",
        value: (availablePaymentMethods?.length ?? 0) + 1
      });
    }
  });

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

  const { name: routeName } = useRoute();

  const onPress = () => {
    trackHelpCenterCtaTapped(
      PAYMENT_AUTHORIZATION_DENIED_ERROR,
      ASSISTANCE_URL,
      routeName
    );
    openWebUrl(ASSISTANCE_URL);
  };

  const renderSecondaryAction = () => {
    switch (outcome) {
      case WalletOnboardingOutcomeEnum.AUTH_ERROR:
        return {
          label: I18n.t(`wallet.onboarding.outcome.AUTH_ERROR.secondaryAction`),
          accessibilityLabel: I18n.t(
            `wallet.onboarding.outcome.AUTH_ERROR.secondaryAction`
          ),
          icon: "instruction" as const,
          onPress,
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

  const hasAnimation = (value: IOPictograms | IOAnimatedPictograms): boolean =>
    value in IOAnimatedPictogramsAssets;

  const animationProps = hasAnimation(pictogramByOutcome[outcome])
    ? {
        enableAnimatedPictogram: true as const,
        loop: pictogramByOutcome[outcome] === "umbrella",
        pictogram: pictogramByOutcome[outcome] as IOAnimatedPictograms
      }
    : {
        pictogram: pictogramByOutcome[outcome] as IOPictograms,
        enableAnimatedPictogram: false as const,
        loop: undefined
      };

  return (
    <View style={{ flex: 1 }}>
      <OperationResultScreenContent
        {...animationProps}
        title={I18n.t(`wallet.onboarding.outcome.${outcomeEnumKey}.title`)}
        subtitle={I18n.t(
          `wallet.onboarding.outcome.${outcomeEnumKey}.subtitle`
        )}
        action={{
          label: I18n.t(
            `wallet.onboarding.outcome.${outcomeEnumKey}.primaryAction`
          ),
          accessibilityLabel: I18n.t(
            `wallet.onboarding.outcome.${outcomeEnumKey}.primaryAction`
          ),
          onPress: handleContinueButton,
          testID: "wallet-onboarding-continue-button"
        }}
        secondaryAction={renderSecondaryAction()}
      />
      {supportModal.bottomSheet}
    </View>
  );
};

export { PaymentsOnboardingFeedbackScreen };
