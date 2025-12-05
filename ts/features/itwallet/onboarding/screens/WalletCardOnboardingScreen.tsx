import {
  Badge,
  BannerErrorState,
  IOVisualCostants,
  ListItemHeader,
  ModuleCredential,
  VStack
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import I18n from "i18next";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/contextualHelp.ts";
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
import { itwIsL3EnabledSelector } from "../../common/store/selectors/preferences";
import { isItwEnabledSelector } from "../../common/store/selectors/remoteConfig";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import { selectItwEnv } from "../../common/store/selectors/environment";
import {
  availableCredentials,
  newCredentials,
  upcomingCredentials
} from "../../common/utils/itwCredentialUtils";
import {
  itwIsCredentialsCatalogueLoading,
  itwIsCredentialsCatalogueUnavailable
} from "../../credentialsCatalogue/store/selectors/index.ts";
import { ItwOnboardingModuleCredentialsList } from "../components/ItwOnboardingModuleCredentialsList.tsx";
import { itwFetchCredentialsCatalogue } from "../../credentialsCatalogue/store/actions/index.ts";

/**
 * Local feature flag that enables catalogue loading/error handling.
 * Since credentials are still hardcoded and the catalogue barely used, we can keep it disabled.
 */
const CATALOGUE_ENABLED = false;

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
  const dispatch = useIODispatch();

  const env = useIOSelector(selectItwEnv);
  const isL3Enabled = useIOSelector(itwIsL3EnabledSelector);
  const isCatalogueLoading = useIOSelector(itwIsCredentialsCatalogueLoading);
  const isCatalogueUnavailable = useIOSelector(
    itwIsCredentialsCatalogueUnavailable
  );

  // Show upcoming credentials only if L3 is enabled and env is "pre"
  const shouldShowUpcoming = isL3Enabled && env === "pre";

  const credentialsToDisplay = useMemo(() => {
    if (shouldShowUpcoming) {
      return [
        ...availableCredentials,
        ...newCredentials,
        ...upcomingCredentials
      ];
    } else if (isL3Enabled) {
      return [...availableCredentials, ...newCredentials];
    } else {
      return [...availableCredentials];
    }
  }, [isL3Enabled, shouldShowUpcoming]);

  const renderContent = () => {
    if (CATALOGUE_ENABLED && isCatalogueLoading) {
      return Array.from({ length: 5 }).map((_, i) => (
        <ModuleCredential key={`loading-item-${i}`} isLoading />
      ));
    }
    if (CATALOGUE_ENABLED && isCatalogueUnavailable) {
      return (
        <BannerErrorState
          label={I18n.t(
            "features.itWallet.credentialsCatalogue.failure.content"
          )}
          actionText={I18n.t(
            "features.itWallet.credentialsCatalogue.failure.action"
          )}
          onPress={() => dispatch(itwFetchCredentialsCatalogue.request())}
        />
      );
    }
    return (
      <ItwOnboardingModuleCredentialsList
        credentialTypesToDisplay={credentialsToDisplay}
      />
    );
  };

  return (
    <View>
      <ListItemHeader
        label={I18n.t("features.wallet.onboarding.sections.itw")}
      />
      <VStack space={8}>{renderContent()}</VStack>
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
