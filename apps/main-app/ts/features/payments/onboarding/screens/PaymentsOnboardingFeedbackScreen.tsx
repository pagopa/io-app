import { IOPictograms } from "@io-app/design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import I18n from "i18next";
import { useEffect, useRef } from "react";
import { View } from "react-native";

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
import { trackHelpCenterCtaTapped } from "../../../../utils/analytics";
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
  IOAnimatedPictograms | IOPictograms
> = {
  [WalletOnboardingOutcomeEnum.SUCCESS]: "success",
  [WalletOnboardingOutcomeEnum.GENERIC_ERROR]: "umbrella",
  [WalletOnboardingOutcomeEnum.AUTH_ERROR]: "accessDenied",
  [WalletOnboardingOutcomeEnum.TIMEOUT]: "time",
  [WalletOnboardingOutcomeEnum.CANCELED_BY_USER]: "trash",
  [WalletOnboardingOutcomeEnum.INVALID_SESSION]: "umbrella",
  [WalletOnboardingOutcomeEnum.ALREADY_ONBOARDED]: "success",
  [WalletOnboardingOutcomeEnum.BPAY_NOT_FOUND]: "attention",
  [WalletOnboardingOutcomeEnum.PSP_ERROR_ONBOARDING]: "attention",
  [WalletOnboardingOutcomeEnum.BE_KO]: "umbrella"
};

type OutcomeCopy = {
  primaryAction: string;
  subtitle: string | undefined;
  title: string;
};

/**
 * Title, optional subtitle and primary action label shown for an onboarding
 * outcome.
 */
const getOutcomeCopy = (outcome: WalletOnboardingOutcome): OutcomeCopy => {
  switch (outcome) {
    case WalletOnboardingOutcomeEnum.ALREADY_ONBOARDED:
      return {
        title: I18n.t("wallet.onboarding.outcome.ALREADY_ONBOARDED.title"),
        subtitle: undefined,
        primaryAction: I18n.t(
          "wallet.onboarding.outcome.ALREADY_ONBOARDED.primaryAction"
        )
      };
    case WalletOnboardingOutcomeEnum.AUTH_ERROR:
      return {
        title: I18n.t("wallet.onboarding.outcome.AUTH_ERROR.title"),
        subtitle: I18n.t("wallet.onboarding.outcome.AUTH_ERROR.subtitle"),
        primaryAction: I18n.t(
          "wallet.onboarding.outcome.AUTH_ERROR.primaryAction"
        )
      };
    case WalletOnboardingOutcomeEnum.BE_KO:
      return {
        title: I18n.t("wallet.onboarding.outcome.BE_KO.title"),
        subtitle: I18n.t("wallet.onboarding.outcome.BE_KO.subtitle"),
        primaryAction: I18n.t("wallet.onboarding.outcome.BE_KO.primaryAction")
      };
    case WalletOnboardingOutcomeEnum.BPAY_NOT_FOUND:
      return {
        title: I18n.t("wallet.onboarding.outcome.BPAY_NOT_FOUND.title"),
        subtitle: I18n.t("wallet.onboarding.outcome.BPAY_NOT_FOUND.subtitle"),
        primaryAction: I18n.t(
          "wallet.onboarding.outcome.BPAY_NOT_FOUND.primaryAction"
        )
      };
    case WalletOnboardingOutcomeEnum.CANCELED_BY_USER:
      return {
        title: I18n.t("wallet.onboarding.outcome.CANCELED_BY_USER.title"),
        subtitle: undefined,
        primaryAction: I18n.t(
          "wallet.onboarding.outcome.CANCELED_BY_USER.primaryAction"
        )
      };
    case WalletOnboardingOutcomeEnum.GENERIC_ERROR:
      return {
        title: I18n.t("wallet.onboarding.outcome.GENERIC_ERROR.title"),
        subtitle: I18n.t("wallet.onboarding.outcome.GENERIC_ERROR.subtitle"),
        primaryAction: I18n.t(
          "wallet.onboarding.outcome.GENERIC_ERROR.primaryAction"
        )
      };
    case WalletOnboardingOutcomeEnum.INVALID_SESSION:
      return {
        title: I18n.t("wallet.onboarding.outcome.INVALID_SESSION.title"),
        subtitle: I18n.t("wallet.onboarding.outcome.INVALID_SESSION.subtitle"),
        primaryAction: I18n.t(
          "wallet.onboarding.outcome.INVALID_SESSION.primaryAction"
        )
      };
    case WalletOnboardingOutcomeEnum.PSP_ERROR_ONBOARDING:
      return {
        title: I18n.t("wallet.onboarding.outcome.PSP_ERROR_ONBOARDING.title"),
        subtitle: I18n.t(
          "wallet.onboarding.outcome.PSP_ERROR_ONBOARDING.subtitle"
        ),
        primaryAction: I18n.t(
          "wallet.onboarding.outcome.PSP_ERROR_ONBOARDING.primaryAction"
        )
      };
    case WalletOnboardingOutcomeEnum.SUCCESS:
      return {
        title: I18n.t("wallet.onboarding.outcome.SUCCESS.title"),
        subtitle: undefined,
        primaryAction: I18n.t("wallet.onboarding.outcome.SUCCESS.primaryAction")
      };
    case WalletOnboardingOutcomeEnum.TIMEOUT:
      return {
        title: I18n.t("wallet.onboarding.outcome.TIMEOUT.title"),
        subtitle: I18n.t("wallet.onboarding.outcome.TIMEOUT.subtitle"),
        primaryAction: I18n.t("wallet.onboarding.outcome.TIMEOUT.primaryAction")
      };
  }
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

  const outcomeCopy = getOutcomeCopy(outcome);

  useOnFirstRender(() => {
    const payment_method_selected = availablePaymentMethods?.find(
      paymentMethod => paymentMethod.id === selectedPaymentMethodId
    )?.name;
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

  const hasAnimation = (value: IOAnimatedPictograms | IOPictograms): boolean =>
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
        action={{
          label: outcomeCopy.primaryAction,
          accessibilityLabel: outcomeCopy.primaryAction,
          onPress: handleContinueButton,
          testID: "wallet-onboarding-continue-button"
        }}
        secondaryAction={renderSecondaryAction()}
        subtitle={outcomeCopy.subtitle}
        title={outcomeCopy.title}
      />
      {supportModal.bottomSheet}
    </View>
  );
};

export { PaymentsOnboardingFeedbackScreen };
