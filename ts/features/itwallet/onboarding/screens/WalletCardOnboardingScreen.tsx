import {
  Badge,
  BannerErrorState,
  Divider,
  H6,
  IOButton,
  IOVisualCostants,
  ListItemHeader,
  ModuleCredential,
  TabItem,
  TabNavigation,
  useIOTheme,
  VStack
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";
import { StyleSheet, View } from "react-native";
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
import { PoweredByItWalletText } from "../../common/components/PoweredByItWalletText.tsx";
import { selectItwEnv } from "../../common/store/selectors/environment";
import { itwIsL3EnabledSelector } from "../../common/store/selectors/preferences";
import { isItwEnabledSelector } from "../../common/store/selectors/remoteConfig";
import {
  availableCredentials,
  newCredentials,
  restrictedCredentials,
  upcomingCredentials
} from "../../common/utils/itwCredentialUtils";
import { itwCredentialsSplittedSelector } from "../../credentials/store/selectors/index.ts";
import { itwFetchCredentialsCatalogue } from "../../credentialsCatalogue/store/actions/index.ts";
import {
  itwIsCredentialsCatalogueLoading,
  itwIsCredentialsCatalogueUnavailable
} from "../../credentialsCatalogue/store/selectors/index.ts";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import { ItwOnboardingModuleCredentialsList } from "../components/ItwOnboardingModuleCredentialsList.tsx";
import { itwRestrictedModeOpenSelector } from "../../common/store/selectors/banners.ts";

/**
 * Local feature flag that enables catalogue loading/error handling.
 * Since credentials are still hardcoded and the catalogue barely used, we can keep it disabled.
 */
const CATALOGUE_ENABLED = false;

type Page = 0 | 1 | 2; // 0=ITW, 1=Other, 2=Restricted

const activeBadge: Badge = {
  variant: "success",
  text: I18n.t("features.wallet.onboarding.badge.active")
};

const WalletCardOnboardingScreen = () => {
  const isItwValid = useIOSelector(itwLifecycleIsValidSelector);
  const isItwEnabled = useIOSelector(isItwEnabledSelector);
  const isFiscalCodeWhitelisted = useIOSelector(itwIsL3EnabledSelector);
  const isRestrictedModeEnabled = useIOSelector(itwRestrictedModeOpenSelector);
  const [page, setPage] = useState<Page>(isRestrictedModeEnabled ? 2 : 0);

  useFocusEffect(trackShowCredentialsList);

  const isItwSectionVisible = useMemo(
    // IT Wallet credential catalog should be visible if
    () =>
      !isRestrictedModeEnabled && // Restricted mode is not enabled
      ((isItwValid && isItwEnabled) || // An eID has been obtained, wallet is valid, and remote FF is enabled
        isFiscalCodeWhitelisted), // OR the user is whitelisted for L3 credentials
    [isItwValid, isItwEnabled, isFiscalCodeWhitelisted, isRestrictedModeEnabled]
  );

  const isRestrictedView = useMemo(() => page === 2, [page]);

  useEffect(() => {
    if (isRestrictedModeEnabled && page === 0) {
      setPage(2);
    }
  }, [isRestrictedModeEnabled, page]);

  const { title, description } = useMemo(() => {
    if (isRestrictedView) {
      return {
        title: I18n.t("features.wallet.home.screen.restrictedMode.title"),
        description: I18n.t(
          "features.wallet.home.screen.restrictedMode.description"
        )
      };
    }
    return {
      title: I18n.t("features.wallet.onboarding.title"),
      description: undefined
    };
  }, [isRestrictedView]);

  const itwAction = useMemo(() => {
    if (isRestrictedView) {
      return {
        label: I18n.t("features.wallet.onboarding.addBonus"),
        onPress: () => setPage(1),
        numberOfLines: 3
      };
    }

    if (isItwSectionVisible && page === 0) {
      return {
        label: I18n.t("features.wallet.onboarding.addRestricted"),
        onPress: () => setPage(2)
      };
    }

    return undefined;
  }, [isRestrictedView, isItwSectionVisible, page]);

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: title
      }}
      description={description}
      contextualHelp={emptyContextualHelp}
      faqCategories={["wallet", "wallet_methods"]}
      headerActionsProp={{ showHelp: true }}
    >
      {!isRestrictedView && (
        <TabNavigation
          tabAlignment="start"
          selectedIndex={page}
          onItemPress={nextTab => {
            if (nextTab === 0) {
              if (isRestrictedModeEnabled) {
                setPage(2);
                return;
              }
              setPage(0);
              return;
            }
            setPage(1);
          }}
        >
          <TabItem
            label={I18n.t("features.wallet.onboarding.sections.itw")}
            accessibilityLabel={I18n.t(
              "features.wallet.onboarding.sections.itw"
            )}
          />
          <TabItem
            label={I18n.t("features.wallet.onboarding.sections.other")}
            accessibilityLabel={I18n.t(
              "features.wallet.onboarding.sections.other"
            )}
          />
        </TabNavigation>
      )}
      <View style={styles.wrapper}>
        {!isRestrictedView && <ItwDiscoveryBannerOnboarding />}

        {isRestrictedView || (isItwSectionVisible && page === 0) ? (
          <ItwCredentialOnboardingSection action={itwAction} page={page} />
        ) : null}

        {page === 1 && (
          <OtherCardsOnboardingSection showTitle={isItwSectionVisible} />
        )}
      </View>
    </IOScrollViewWithLargeHeader>
  );
};

type ItwCredentialOnboardingSectionProps = {
  page?: number;
  action?: {
    label: string;
    onPress: () => void;
    numberOfLines?: number;
  };
};

const ItwCredentialOnboardingSection: FunctionComponent<
  ItwCredentialOnboardingSectionProps
> = ({ page, action }) => {
  const dispatch = useIODispatch();
  const theme = useIOTheme();

  const env = useIOSelector(selectItwEnv);
  const isL3Enabled = useIOSelector(itwIsL3EnabledSelector);
  const isCatalogueLoading = useIOSelector(itwIsCredentialsCatalogueLoading);
  const isCatalogueUnavailable = useIOSelector(
    itwIsCredentialsCatalogueUnavailable
  );

  // Show upcoming credentials only if L3 is enabled and env is "pre"
  const shouldShowUpcoming = isL3Enabled && env === "pre";

  const credentialsToDisplay = useMemo(() => {
    if (page === 2) {
      return [...restrictedCredentials];
    }

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
  }, [page, isL3Enabled, shouldShowUpcoming]);

  const { obtained, notObtained } = useIOSelector(state =>
    itwCredentialsSplittedSelector(state, credentialsToDisplay)
  );

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

    const list = (types: Array<string>) => (
      <ItwOnboardingModuleCredentialsList
        restrictedMode={page === 2}
        credentialTypesToDisplay={types}
      />
    );

    if (page === 2) {
      return list(notObtained);
    }

    return (
      <VStack space={32}>
        <VStack space={8}>{list(notObtained)}</VStack>

        {obtained.length > 0 && (
          <VStack space={8}>
            <View style={styles.header}>
              <H6 role="heading" color={theme["textBody-tertiary"]}>
                {I18n.t("features.wallet.onboarding.sections.added")}
              </H6>
            </View>
            {list(obtained)}
          </VStack>
        )}
      </VStack>
    );
  };

  return (
    <View>
      {page === 0 && (
        <View style={styles.header}>
          <H6 role="heading" color={theme["textBody-tertiary"]}>
            {I18n.t("features.wallet.onboarding.sections.itw")}
          </H6>
          <PoweredByItWalletText />
        </View>
      )}
      <VStack space={24}>
        <VStack space={8}>{renderContent()}</VStack>

        {action ? (
          <>
            <Divider />
            <IOButton
              variant="link"
              label={action.label}
              onPress={action.onPress}
              numberOfLines={action.numberOfLines}
            />
          </>
        ) : null}
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
  },
  header: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 12
  }
});

export { WalletCardOnboardingScreen };
