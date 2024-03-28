import {
  ButtonExtendedOutline,
  ContentWrapper,
  VSpacer
} from "@pagopa/io-app-design-system";
import React from "react";
import { RNavScreenWithLargeHeader } from "../../../components/ui/RNavScreenWithLargeHeader";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { isIdPayEnabledSelector } from "../../../store/reducers/backendStatus";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { cgnActivationStart } from "../../bonus/cgn/store/actions/activation";
import { WalletOnboardingRoutes } from "../../payments/onboarding/navigation/navigator";

const WalletCardOnboardingScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const isIdPayEnabled = useIOSelector(isIdPayEnabledSelector);

  const navigateToCgnActivation = () => {
    dispatch(cgnActivationStart());
  };

  const navigateToInitiativesList = () => {
    // TODO add navigation to ID Pay initiatives
  };

  const navigateToPaymentMethodOnboarding = () => {
    navigation.navigate(WalletOnboardingRoutes.WALLET_ONBOARDING_MAIN, {
      screen: WalletOnboardingRoutes.WALLET_ONBOARDING_SELECT_PAYMENT_METHOD
    });
  };

  return (
    <RNavScreenWithLargeHeader
      title={{
        label: "Cosa vuoi aggiungere al Portafoglio?"
      }}
      contextualHelp={emptyContextualHelp}
      faqCategories={["wallet", "wallet_methods"]}
      headerActionsProp={{ showHelp: true }}
    >
      <ContentWrapper>
        <VSpacer size={24} />
        <ButtonExtendedOutline
          label="Carta Giovani Nazionale"
          onPress={navigateToCgnActivation}
          icon="chevronRight"
        />
        <VSpacer size={8} />
        {isIdPayEnabled && (
          <>
            <ButtonExtendedOutline
              label="Iniziative Welfare"
              onPress={navigateToInitiativesList}
              icon="chevronRight"
            />
            <VSpacer size={8} />
          </>
        )}
        <ButtonExtendedOutline
          label="Metodi di pagamento"
          onPress={navigateToPaymentMethodOnboarding}
          icon="chevronRight"
        />
      </ContentWrapper>
    </RNavScreenWithLargeHeader>
  );
};

export { WalletCardOnboardingScreen };
