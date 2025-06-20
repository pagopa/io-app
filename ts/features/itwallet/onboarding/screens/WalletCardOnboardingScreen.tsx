import {
  Badge,
  IOVisualCostants,
  ListItemHeader,
  ModuleCredential,
  VStack
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { useCallback, useMemo } from "react";
import { constFalse, pipe } from "fp-ts/lib/function";
import { StyleSheet, View } from "react-native";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { cgnActivationStart } from "../../../bonus/cgn/store/actions/activation";
import {
  isCgnDetailsLoading,
  isCgnInformationAvailableSelector
} from "../../../bonus/cgn/store/reducers/details";
import { loadAvailableBonuses } from "../../../bonus/common/store/actions/availableBonusesTypes";
import { PaymentsOnboardingRoutes } from "../../../payments/onboarding/navigation/routes";
import {
  trackShowCredentialsList,
  trackStartAddNewCredential
} from "../../analytics";
import { ItwDiscoveryBannerOnboarding } from "../../common/components/discoveryBanner/ItwDiscoveryBannerOnboarding";
import {
  itwIsL3EnabledSelector,
  itwRequestedCredentialsSelector
} from "../../common/store/selectors/preferences";
import {
  isItwEnabledSelector,
  itwDisabledCredentialsSelector
} from "../../common/store/selectors/remoteConfig";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { itwCredentialsTypesSelector } from "../../credentials/store/selectors";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import {
  selectCredentialTypeOption,
  selectIsLoading
} from "../../machine/credential/selectors";
import { ItwCredentialIssuanceMachineContext } from "../../machine/provider";
import { ItwOnboardingModuleCredential } from "../components/ItwOnboardingModuleCredential";
import { useOfflineToastGuard } from "../../../../hooks/useOfflineToastGuard.ts";
import { ITW_ROUTES } from "../../navigation/routes";
import { selectItwEnv } from "../../common/store/selectors/environment";

// Credentials that can be actively requested and obtained by the user
const availableCredentials = [
  CredentialType.DRIVING_LICENSE,
  CredentialType.EUROPEAN_DISABILITY_CARD,
  CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD
] as const;

// Credentials that will be available in the future
const comingSoonCredentials = [CredentialType.DEGREE_CERTIFICATES];

const activeBadge: Badge = {
  variant: "success",
  text: I18n.t("features.wallet.onboarding.badge.active")
};

const WalletCardOnboardingScreen = () => {
  const isItwValid = useIOSelector(itwLifecycleIsValidSelector);
  const isItwEnabled = useIOSelector(isItwEnabledSelector);

  useFocusEffect(trackShowCredentialsList);

  const isItwSectionVisible = useMemo(
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
      <View style={styles.wrapper}>
        <ItwDiscoveryBannerOnboarding />
        {isItwSectionVisible ? <ItwCredentialOnboardingSection /> : null}
        <OtherCardsOnboardingSection showTitle={isItwSectionVisible} />
      </View>
    </IOScrollViewWithLargeHeader>
  );
};

const ItwCredentialOnboardingSection = () => {
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();
  const navigation = useIONavigation();

  const remotelyDisabledCredentials = useIOSelector(
    itwDisabledCredentialsSelector
  );
  const requestedCredentials = useIOSelector(itwRequestedCredentialsSelector);
  const env = useIOSelector(selectItwEnv);
  const isL3Enabled = useIOSelector(itwIsL3EnabledSelector);
  const itwCredentialsTypes = useIOSelector(itwCredentialsTypesSelector);

  const isCredentialIssuancePending =
    ItwCredentialIssuanceMachineContext.useSelector(selectIsLoading);
  const selectedCredentialOption =
    ItwCredentialIssuanceMachineContext.useSelector(selectCredentialTypeOption);

  // Show coming soon credentials only if L3 is enabled and env is "pre"
  const shouldShowComingSoon = isL3Enabled && env === "pre";
  const displayedCredentials = shouldShowComingSoon
    ? [...availableCredentials, ...comingSoonCredentials]
    : [...availableCredentials];

  const beginCredentialIssuance = useOfflineToastGuard(
    useCallback(
      (type: CredentialType) => {
        if (comingSoonCredentials.includes(type)) {
          navigation.navigate(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.ISSUANCE.CREDENTIAL_COMING_SOON
          });
        } else {
          machineRef.send({
            type: "select-credential",
            credentialType: type,
            skipNavigation: true
          });
        }
      },
      [machineRef, navigation]
    )
  );

  return (
    <View>
      <ListItemHeader
        label={I18n.t("features.wallet.onboarding.sections.itw")}
      />
      <VStack space={8}>
        {displayedCredentials.map(type => (
          <ItwOnboardingModuleCredential
            key={`itw_credential_${type}`}
            type={type}
            isActive={itwCredentialsTypes.includes(type)}
            isDisabled={remotelyDisabledCredentials.includes(type)}
            isRequested={requestedCredentials.includes(type)}
            isComingSoon={comingSoonCredentials.includes(type)}
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
    </View>
  );
};

const OtherCardsOnboardingSection = (props: { showTitle?: boolean }) => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const isCgnLoading = useIOSelector(isCgnDetailsLoading);
  const isCgnActive = useIOSelector(isCgnInformationAvailableSelector);

  const startCgnActiviation = useCallback(() => {
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

  const cgnModule = useMemo(
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
    <View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 16,
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    gap: 16
  }
});

export { WalletCardOnboardingScreen };
