import {
  ContentWrapper,
  ModuleCredential,
  VSpacer
} from "@pagopa/io-app-design-system";
import React from "react";
import cgnLogo from "../../../../img/bonus/cgn/cgn_logo.png";
import { RNavScreenWithLargeHeader } from "../../../components/ui/RNavScreenWithLargeHeader";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { isIdPayEnabledSelector } from "../../../store/reducers/backendStatus";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { cgnActivationStart } from "../../bonus/cgn/store/actions/activation";
import { PaymentsOnboardingRoutes } from "../../payments/onboarding/navigation/routes";
import I18n from "../../../i18n";

const WalletCardOnboardingScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const isIdPayEnabled = useIOSelector(isIdPayEnabledSelector);

  const navigateToCgnActivation = () => {
    dispatch(cgnActivationStart());
  };

  const navigateToInitiativesList = () => {
    // TODO add navigation to welfare initiatives list
  };

  const navigateToPaymentMethodOnboarding = () => {
    navigation.navigate(PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_NAVIGATOR, {
      screen: PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_SELECT_METHOD
    });
  };

  return (
    <RNavScreenWithLargeHeader
      title={{
        label: I18n.t("features.wallet.onboarding.title")
      }}
      contextualHelp={emptyContextualHelp}
      faqCategories={["wallet", "wallet_methods"]}
      headerActionsProp={{ showHelp: true }}
    >
      <ContentWrapper>
        <VSpacer size={24} />
        <ModuleCredential
          image={cgnLogo}
          label={I18n.t("features.wallet.onboarding.options.cgn")}
          onPress={navigateToCgnActivation}
        />
        <VSpacer size={8} />
        {isIdPayEnabled && (
          <>
            <ModuleCredential
              icon="bonus"
              label={I18n.t("features.wallet.onboarding.options.welfare")}
              onPress={navigateToInitiativesList}
            />
            <VSpacer size={8} />
          </>
        )}
        <ModuleCredential
          icon="creditCard"
          label={I18n.t("features.wallet.onboarding.options.payments")}
          onPress={navigateToPaymentMethodOnboarding}
        />
      </ContentWrapper>
    </RNavScreenWithLargeHeader>
  );
};

export { WalletCardOnboardingScreen };
