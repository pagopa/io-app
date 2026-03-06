import {
  Badge,
  ContentWrapper,
  Divider,
  H6,
  IOButton,
  IOListItemVisualParams,
  ListItemHeader,
  ModuleCredential,
  TabItem,
  TabNavigation,
  useIOTheme,
  VStack
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { clamp } from "lodash";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../../navigation/params/AppParamsList.ts";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/contextualHelp.ts";
import { cgnActivationStart } from "../../../bonus/cgn/store/actions/activation.ts";
import {
  isCgnDetailsLoading,
  isCgnInformationAvailableSelector
} from "../../../bonus/cgn/store/reducers/details.ts";
import { loadAvailableBonuses } from "../../../bonus/common/store/actions/availableBonusesTypes.ts";
import { PaymentsOnboardingRoutes } from "../../../payments/onboarding/navigation/routes.ts";
import {
  trackShowCredentialsList,
  trackStartAddNewCredential
} from "../../analytics";
import { PoweredByItWalletText } from "../../common/components/PoweredByItWalletText.tsx";
import { selectItwEnv } from "../../common/store/selectors/environment.ts";
import { itwIsL3EnabledSelector } from "../../common/store/selectors/preferences.ts";
import {
  availableCredentials,
  newCredentials,
  upcomingCredentials
} from "../../common/utils/itwCredentialUtils.ts";
import { itwCredentialsByPresenceSelector } from "../../credentials/store/selectors/index.ts";
import {
  itwLifecycleIsITWalletValidSelector,
  itwLifecycleIsValidSelector
} from "../../lifecycle/store/selectors";
import { ItwParamsList } from "../../navigation/ItwParamsList.ts";
import { ITW_ROUTES } from "../../navigation/routes.ts";
import { AsyncCredentialsCatalogue } from "../components/AsyncCredentialsCatalogueWrapper.tsx";
import { ItwOnboardingModuleCredentialsList } from "../components/ItwOnboardingModuleCredentialsList.tsx";

const MAX_INDEX = 1;

const activeBadge: Badge = {
  variant: "success",
  text: I18n.t("features.wallet.onboarding.badge.active")
};

export type ItwCardOnboardingL3NavigationParams = {
  page?: number;
};

type Props = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_CARD_L3_ONBOARDING"
>;

const ItwCardOnboardingL3Screen = ({ route }: Props) => {
  const { params } = route;

  const [page, setPage] = useState<number>(
    clamp(Number(params?.page) || 0, 0, MAX_INDEX)
  );

  useFocusEffect(trackShowCredentialsList);

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: I18n.t("features.wallet.onboarding.title")
      }}
      contextualHelp={emptyContextualHelp}
      faqCategories={["wallet", "wallet_methods"]}
      headerActionsProp={{ showHelp: true }}
    >
      <View style={styles.tabs}>
        <TabNavigation
          key={`tab-${page}`}
          tabAlignment="start"
          selectedIndex={page}
          onItemPress={setPage}
        >
          <TabItem
            label={I18n.t("features.wallet.onboarding.l3-sections.itw")}
            accessibilityLabel={I18n.t(
              "features.wallet.onboarding.l3-sections.itw"
            )}
          />
          <TabItem
            label={I18n.t("features.wallet.onboarding.l3-sections.other")}
            accessibilityLabel={I18n.t(
              "features.wallet.onboarding.l3-sections.other"
            )}
          />
        </TabNavigation>
      </View>
      <ContentWrapper>
        {page === 0 && <ItwCredentialOnboardingSection />}
        {page === 1 && <OtherCardsOnboardingSection />}
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};

const ItwCredentialOnboardingSection = () => {
  const theme = useIOTheme();
  const navigation = useIONavigation();

  const env = useIOSelector(selectItwEnv);
  const isWalletEnabled = useIOSelector(itwLifecycleIsValidSelector);
  const isITWalletEnabled = useIOSelector(itwLifecycleIsITWalletValidSelector);

  // Show upcoming credentials only if env is "pre"
  const shouldShowUpcoming = env === "pre";
  const shouldShowRestrictedAction = isWalletEnabled && !isITWalletEnabled;

  const credentialsToDisplay = useMemo(() => {
    if (shouldShowUpcoming) {
      return [
        ...availableCredentials,
        ...newCredentials,
        ...upcomingCredentials
      ];
    } else {
      return [...availableCredentials, ...newCredentials];
    }
  }, [shouldShowUpcoming]);

  const { obtained, notObtained } = useIOSelector(state =>
    itwCredentialsByPresenceSelector(state, credentialsToDisplay)
  );

  return (
    <View>
      <View style={styles.header}>
        <H6 role="heading" color={theme["textBody-tertiary"]}>
          {I18n.t("features.wallet.onboarding.sections.itw")}
        </H6>
        <PoweredByItWalletText />
      </View>
      <VStack space={24}>
        {/* Available credentials for issuance */}
        <AsyncCredentialsCatalogue>
          <ItwOnboardingModuleCredentialsList
            credentialTypesToDisplay={notObtained}
          />
        </AsyncCredentialsCatalogue>

        {/* Obtained credentials  */}
        {obtained.length > 0 && (
          <VStack space={8}>
            <View style={styles.header}>
              <H6 role="heading" color={theme["textBody-tertiary"]}>
                {I18n.t("features.wallet.onboarding.l3-sections.added")}
              </H6>
            </View>
            <ItwOnboardingModuleCredentialsList
              credentialTypesToDisplay={obtained}
            />
          </VStack>
        )}

        {/* Documenti su IO fallback action */}
        {shouldShowRestrictedAction ? (
          <>
            <Divider />
            <IOButton
              testID={"restricted-action-testID"}
              variant="link"
              label={I18n.t("features.wallet.onboarding.cta.addRestricted")}
              onPress={() =>
                navigation.replace(ITW_ROUTES.MAIN, {
                  screen: ITW_ROUTES.L2_ONBOARDING
                })
              }
              accessibilityLabel={I18n.t(
                "features.wallet.onboarding.cta.addRestricted"
              )}
              numberOfLines={2}
            />
          </>
        ) : null}
      </VStack>
    </View>
  );
};

const OtherCardsOnboardingSection = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const isCgnLoading = useIOSelector(isCgnDetailsLoading);
  const isCgnActive = useIOSelector(isCgnInformationAvailableSelector);
  const isL3Enabled = useIOSelector(itwIsL3EnabledSelector);

  const startCgnActivation = useCallback(() => {
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

  const cgnBaseProps = useMemo(
    () => ({
      testID: "cgnModuleTestID",
      label: I18n.t("features.wallet.onboarding.options.cgn"),
      onPress: !isCgnActive ? startCgnActivation : undefined,
      badge: isCgnActive ? activeBadge : undefined
    }),
    [startCgnActivation, isCgnActive]
  );

  const cgnModule = useMemo(
    () =>
      isCgnLoading ? (
        <ModuleCredential testID="cgnModuleLoadingTestID" isLoading={true} />
      ) : isL3Enabled ? (
        <ModuleCredential {...cgnBaseProps} />
      ) : (
        <ModuleCredential
          {...cgnBaseProps}
          image={require("../../../../../img/bonus/cgn/cgn_logo.png")}
        />
      ),
    [isCgnLoading, cgnBaseProps, isL3Enabled]
  );

  const baseProps = {
    testID: "paymentsModuleTestID",
    label: I18n.t("features.wallet.onboarding.options.payments"),
    onPress: navigateToPaymentMethodOnboarding
  };

  return (
    <View>
      <ListItemHeader
        label={I18n.t("features.wallet.onboarding.sections.other")}
      />
      <VStack space={8}>
        {cgnModule}
        {isL3Enabled ? (
          <ModuleCredential {...baseProps} />
        ) : (
          <ModuleCredential {...baseProps} icon="creditCard" />
        )}
      </VStack>
    </View>
  );
};

const styles = StyleSheet.create({
  tabs: {
    paddingVertical: 16
  },
  header: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: IOListItemVisualParams.paddingVertical,
    paddingHorizontal: IOListItemVisualParams.paddingHorizontal,
    marginHorizontal: -IOListItemVisualParams.paddingHorizontal
  }
});

export { ItwCardOnboardingL3Screen };
