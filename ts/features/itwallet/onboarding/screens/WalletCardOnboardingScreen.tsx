import {
  ContentWrapper,
  ListItemHeader,
  ModuleCredential,
  VSpacer
} from "@pagopa/io-app-design-system";
import React from "react";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../i18n";
import cgnLogo from "../../../../../img/bonus/cgn/cgn_logo.png";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { isIdPayEnabledSelector } from "../../../../store/reducers/backendStatus";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { cgnActivationStart } from "../../../bonus/cgn/store/actions/activation";
import { isCgnInformationAvailableSelector } from "../../../bonus/cgn/store/reducers/details";
import { loadAvailableBonuses } from "../../../bonus/common/store/actions/availableBonusesTypes";
import { PaymentsOnboardingRoutes } from "../../../payments/onboarding/navigation/routes";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { ItwCredentialIssuanceMachineContext } from "../../machine/provider";

const WalletCardOnboardingScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();

  const isIdPayEnabled = useIOSelector(isIdPayEnabledSelector);
  const isCgnAlreadyActive = useIOSelector(isCgnInformationAvailableSelector);

  const startCgnActiviation = () => {
    dispatch(loadAvailableBonuses.request());
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

  const beginCredentialIssuance = (type: CredentialType) => () => {
    machineRef.send({ type: "select-credential", credentialType: type });
  };

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: I18n.t("features.wallet.onboarding.title")
      }}
      contextualHelp={emptyContextualHelp}
      faqCategories={["wallet", "wallet_methods"]}
      headerActionsProp={{ showHelp: true }}
    >
      <ContentWrapper>
        <ListItemHeader label="IT Wallet" />
        <ModuleCredential
          icon="fingerprint"
          label={"Identità Digitale"}
          onPress={beginCredentialIssuance(CredentialType.PID)}
        />
        <VSpacer size={8} />
        <ModuleCredential
          icon="categTravel"
          label={"Patente di guida"}
          onPress={beginCredentialIssuance(CredentialType.DRIVING_LICENSE)}
        />

        <VSpacer size={8} />
        <ModuleCredential
          icon="archiveFilled"
          label={"Carta Europea della Disabilità"}
          onPress={beginCredentialIssuance(
            CredentialType.EUROPEAN_DISABILITY_CARD
          )}
        />
        <VSpacer size={8} />
        <ModuleCredential
          icon="healthCard"
          label={"Tessera Sanitaria"}
          onPress={beginCredentialIssuance(
            CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD
          )}
        />
        <VSpacer size={24} />
        <ListItemHeader label="Altro" />
        <ModuleCredential
          image={cgnLogo}
          label={I18n.t("features.wallet.onboarding.options.cgn")}
          onPress={!isCgnAlreadyActive ? startCgnActiviation : undefined}
          badge={
            isCgnAlreadyActive
              ? { variant: "success", text: "già presente" }
              : undefined
          }
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
    </IOScrollViewWithLargeHeader>
  );
};

export { WalletCardOnboardingScreen };
