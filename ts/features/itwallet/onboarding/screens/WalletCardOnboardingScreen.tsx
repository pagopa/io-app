import {
  ContentWrapper,
  ListItemHeader,
  ModuleCredential,
  VSpacer
} from "@pagopa/io-app-design-system";
import React from "react";
import cgnLogo from "../../../../../img/bonus/cgn/cgn_logo.png";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  isIdPayEnabledSelector,
  isItwEnabledSelector
} from "../../../../store/reducers/backendStatus";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { cgnActivationStart } from "../../../bonus/cgn/store/actions/activation";
import { isCgnInformationAvailableSelector } from "../../../bonus/cgn/store/reducers/details";
import { loadAvailableBonuses } from "../../../bonus/common/store/actions/availableBonusesTypes";
import { PaymentsOnboardingRoutes } from "../../../payments/onboarding/navigation/routes";
import { isTrialActiveSelector } from "../../../trialSystem/store/reducers";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { ITW_TRIAL_ID } from "../../common/utils/itwTrialUtils";
import { ItwCredentialIssuanceMachineContext } from "../../machine/provider";
import { ItwTags } from "../../machine/tags";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import { isItWalletTestEnabledSelector } from "../../../../store/reducers/persistedPreferences";

const WalletCardOnboardingScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();

  const isIdPayEnabled = useIOSelector(isIdPayEnabledSelector);
  const isCgnAlreadyActive = useIOSelector(isCgnInformationAvailableSelector);

  const isItWalletEnabled = useIOSelector(isItWalletTestEnabledSelector);
  const isItwTrialEnabled = useIOSelector(isTrialActiveSelector(ITW_TRIAL_ID));
  const isItwValid = useIOSelector(itwLifecycleIsValidSelector);
  const isItwEnabled = useIOSelector(isItwEnabledSelector);

  const isItwSectionVisible = React.useMemo(
    // IT Wallet cedential catalog should be visible if
    () =>
      isItWalletEnabled && // Local FF is enabled
      isItwTrialEnabled && // User is part of the trial
      isItwValid && // An eID has ben obtained and wallet is valid
      isItwEnabled, // Remote FF is enabled
    [isItWalletEnabled, isItwTrialEnabled, isItwValid, isItwEnabled]
  );

  const isCredentialLoading = ItwCredentialIssuanceMachineContext.useSelector(
    snapshot => snapshot.hasTag(ItwTags.Loading)
  );
  const selectedCredential = ItwCredentialIssuanceMachineContext.useSelector(
    snapshot => snapshot.context.credentialType
  );

  const startCgnActiviation = () => {
    if (isCredentialLoading) {
      return;
    }

    dispatch(loadAvailableBonuses.request());
    dispatch(cgnActivationStart());
  };

  const navigateToInitiativesList = () => {
    // TODO add navigation to welfare initiatives list
  };

  const navigateToPaymentMethodOnboarding = () => {
    if (isCredentialLoading) {
      return;
    }

    navigation.navigate(PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_NAVIGATOR, {
      screen: PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_SELECT_METHOD
    });
  };

  const beginCredentialIssuance = (type: CredentialType) => () => {
    if (isCredentialLoading) {
      return;
    }

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
        <VSpacer size={12} />
        {isItwSectionVisible ? (
          <>
            <ListItemHeader label="IT Wallet" />
            <ModuleCredential
              testID="itwDrivingLicenseModuleTestID"
              icon="car"
              label={"Patente di guida"}
              onPress={beginCredentialIssuance(CredentialType.DRIVING_LICENSE)}
              isFetching={
                isCredentialLoading &&
                selectedCredential === CredentialType.DRIVING_LICENSE
              }
            />

            <VSpacer size={8} />
            <ModuleCredential
              testID="itwDisabilityCardModuleTestID"
              icon="accessibility"
              label={"Carta Europea della Disabilità"}
              onPress={beginCredentialIssuance(
                CredentialType.EUROPEAN_DISABILITY_CARD
              )}
              isFetching={
                isCredentialLoading &&
                selectedCredential === CredentialType.EUROPEAN_DISABILITY_CARD
              }
            />
            <VSpacer size={16} />
            <ListItemHeader label="Altro" />
          </>
        ) : null}
        <ModuleCredential
          testID="cgnModuleTestID"
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
              testID="idPayModuleTestID"
              icon="bonus"
              label={I18n.t("features.wallet.onboarding.options.welfare")}
              onPress={navigateToInitiativesList}
            />
            <VSpacer size={8} />
          </>
        )}
        <ModuleCredential
          testID="paymentsModuleTestID"
          icon="creditCard"
          label={I18n.t("features.wallet.onboarding.options.payments")}
          onPress={navigateToPaymentMethodOnboarding}
        />
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};

export { WalletCardOnboardingScreen };
