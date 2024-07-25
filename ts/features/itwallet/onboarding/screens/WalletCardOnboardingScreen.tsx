import {
  Badge,
  ContentWrapper,
  ListItemHeader,
  ModuleCredential,
  VSpacer
} from "@pagopa/io-app-design-system";
import { constFalse, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
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
import { isItWalletTestEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { cgnActivationStart } from "../../../bonus/cgn/store/actions/activation";
import { isCgnInformationAvailableSelector } from "../../../bonus/cgn/store/reducers/details";
import { loadAvailableBonuses } from "../../../bonus/common/store/actions/availableBonusesTypes";
import { PaymentsOnboardingRoutes } from "../../../payments/onboarding/navigation/routes";
import { isTrialActiveSelector } from "../../../trialSystem/store/reducers";
import { getCredentialNameFromType } from "../../common/utils/itwCredentialUtils";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { ITW_TRIAL_ID } from "../../common/utils/itwTrialUtils";
import { itwCredentialsTypesSelector } from "../../credentials/store/selectors";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import {
  selectCredentialTypeOption,
  selectIsLoading
} from "../../machine/credential/selectors";
import { ItwCredentialIssuanceMachineContext } from "../../machine/provider";

const activeBadge: Badge = {
  variant: "success",
  text: I18n.t("features.wallet.onboarding.badge.active")
};

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
  const itwCredentialsTypes = useIOSelector(itwCredentialsTypesSelector);

  const isItwSectionVisible = React.useMemo(
    // IT Wallet cedential catalog should be visible if
    () =>
      isItWalletEnabled && // Local FF is enabled
      isItwTrialEnabled && // User is part of the trial
      isItwValid && // An eID has ben obtained and wallet is valid
      isItwEnabled, // Remote FF is enabled
    [isItWalletEnabled, isItwTrialEnabled, isItwValid, isItwEnabled]
  );

  const isCredentialLoading =
    ItwCredentialIssuanceMachineContext.useSelector(selectIsLoading);
  const selectedCredentialOption =
    ItwCredentialIssuanceMachineContext.useSelector(selectCredentialTypeOption);

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
            <ListItemHeader
              label={I18n.t("features.wallet.onboarding.sections.itw")}
            />
            <ModuleCredential
              testID="itwDrivingLicenseModuleTestID"
              icon="car"
              label={getCredentialNameFromType(CredentialType.DRIVING_LICENSE)}
              onPress={
                itwCredentialsTypes.includes(CredentialType.DRIVING_LICENSE)
                  ? undefined
                  : beginCredentialIssuance(CredentialType.DRIVING_LICENSE)
              }
              isFetching={
                isCredentialLoading &&
                pipe(
                  selectedCredentialOption,
                  O.map(type => type === CredentialType.DRIVING_LICENSE),
                  O.getOrElse(constFalse)
                )
              }
              badge={
                itwCredentialsTypes.includes(CredentialType.DRIVING_LICENSE)
                  ? activeBadge
                  : undefined
              }
            />

            <VSpacer size={16} />
            <ListItemHeader
              label={I18n.t("features.wallet.onboarding.sections.other")}
            />
          </>
        ) : null}
        <ModuleCredential
          testID="cgnModuleTestID"
          image={cgnLogo}
          label={I18n.t("features.wallet.onboarding.options.cgn")}
          onPress={!isCgnAlreadyActive ? startCgnActiviation : undefined}
          badge={isCgnAlreadyActive ? activeBadge : undefined}
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
