import {
  Badge,
  ContentWrapper,
  ListItemHeader,
  ModuleCredential,
  VStack
} from "@pagopa/io-app-design-system";
import { constFalse, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React, { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  isItwEnabledSelector,
  itwDisabledCredentialsSelector
} from "../../../../store/reducers/backendStatus/remoteConfig";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { cgnActivationStart } from "../../../bonus/cgn/store/actions/activation";
import {
  isCgnDetailsLoading,
  isCgnInformationAvailableSelector
} from "../../../bonus/cgn/store/reducers/details";
import { loadAvailableBonuses } from "../../../bonus/common/store/actions/availableBonusesTypes";
import { PaymentsOnboardingRoutes } from "../../../payments/onboarding/navigation/routes";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { itwCredentialsTypesSelector } from "../../credentials/store/selectors";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import {
  selectCredentialTypeOption,
  selectIsLoading
} from "../../machine/credential/selectors";
import { ItwCredentialIssuanceMachineContext } from "../../machine/provider";
import {
  CREDENTIALS_MAP,
  trackShowCredentialsList,
  trackStartAddNewCredential
} from "../../analytics";
import { ItwOnboardingModuleCredential } from "../components/ItwOnboardingModuleCredential";

// List of available credentials to show to the user
const availableCredentials = [
  CredentialType.DRIVING_LICENSE,
  CredentialType.EUROPEAN_DISABILITY_CARD,
  CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD
] as const;

const activeBadge: Badge = {
  variant: "success",
  text: I18n.t("features.wallet.onboarding.badge.active")
};

const WalletCardOnboardingScreen = () => {
  const isItwValid = useIOSelector(itwLifecycleIsValidSelector);
  const isItwEnabled = useIOSelector(isItwEnabledSelector);

  useFocusEffect(trackShowCredentialsList);

  const isItwSectionVisible = React.useMemo(
    // IT Wallet credential catalog should be visible if
    () =>
      isItwValid && // An eID has ben obtained and wallet is valid
      isItwEnabled, // Remote FF is enabled
    [isItwValid, isItwEnabled]
  );

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
        {isItwSectionVisible ? <ItwCredentialOnboardingSection /> : null}
        <OtherCardsOnboardingSection showTitle={isItwSectionVisible} />
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};

const ItwCredentialOnboardingSection = () => {
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();
  const remotelyDisabledCredentials = useIOSelector(
    itwDisabledCredentialsSelector
  );

  const isCredentialIssuancePending =
    ItwCredentialIssuanceMachineContext.useSelector(selectIsLoading);
  const selectedCredentialOption =
    ItwCredentialIssuanceMachineContext.useSelector(selectCredentialTypeOption);

  const itwCredentialsTypes = useIOSelector(itwCredentialsTypesSelector);

  const beginCredentialIssuance = useCallback(
    (type: string) => {
      trackStartAddNewCredential(CREDENTIALS_MAP[type]);
      machineRef.send({
        type: "select-credential",
        credentialType: type,
        skipNavigation: true
      });
    },
    [machineRef]
  );

  return (
    <>
      <ListItemHeader
        label={I18n.t("features.wallet.onboarding.sections.itw")}
      />
      <VStack space={8}>
        {availableCredentials.map(type => (
          <ItwOnboardingModuleCredential
            key={`itw_credential_${type}`}
            type={type}
            isActive={itwCredentialsTypes.includes(type)}
            isDisabled={remotelyDisabledCredentials.includes(type)}
            isCredentialIssuancePending={isCredentialIssuancePending}
            isSelectedCredential={pipe(
              selectedCredentialOption,
              O.map(t => t === type),
              O.getOrElse(constFalse)
            )}
            onPress={beginCredentialIssuance}
          />
        ))}
      </VStack>
    </>
  );
};

const OtherCardsOnboardingSection = (props: { showTitle?: boolean }) => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const isCgnLoading = useIOSelector(isCgnDetailsLoading);
  const isCgnActive = useIOSelector(isCgnInformationAvailableSelector);

  const startCgnActiviation = React.useCallback(() => {
    trackStartAddNewCredential("CGN");
    dispatch(loadAvailableBonuses.request());
    dispatch(cgnActivationStart());
  }, [dispatch]);

  const navigateToPaymentMethodOnboarding = () => {
    trackStartAddNewCredential("payment_method");
    navigation.navigate(PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_NAVIGATOR, {
      screen: PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_SELECT_METHOD
    });
  };

  const cgnModule = React.useMemo(
    () =>
      isCgnLoading ? (
        <ModuleCredential testID="cgnModuleLoadingTestID" isLoading={true} />
      ) : (
        <ModuleCredential
          testID="cgnModuleTestID"
          image={require("../../../../../img/bonus/cgn/cgn_logo.png")}
          label={I18n.t("features.wallet.onboarding.options.cgn")}
          onPress={!isCgnActive ? startCgnActiviation : undefined}
          badge={isCgnActive ? activeBadge : undefined}
        />
      ),
    [isCgnActive, isCgnLoading, startCgnActiviation]
  );

  return (
    <>
      {props.showTitle && (
        <ListItemHeader
          label={I18n.t("features.wallet.onboarding.sections.other")}
        />
      )}
      <VStack space={8}>
        {cgnModule}
        <ModuleCredential
          testID="paymentsModuleTestID"
          icon="creditCard"
          label={I18n.t("features.wallet.onboarding.options.payments")}
          onPress={navigateToPaymentMethodOnboarding}
        />
      </VStack>
    </>
  );
};

export { WalletCardOnboardingScreen };
