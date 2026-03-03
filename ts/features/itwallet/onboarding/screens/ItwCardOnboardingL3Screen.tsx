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
import { FunctionComponent, useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { clamp } from "lodash";
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
import {
  availableCredentials,
  newCredentials,
  upcomingCredentials
} from "../../common/utils/itwCredentialUtils.ts";
import { itwCredentialsByPresenceSelector } from "../../credentials/store/selectors/index.ts";
import { itwFetchCredentialsCatalogue } from "../../credentialsCatalogue/store/actions/index.ts";
import {
  itwIsCredentialsCatalogueLoading,
  itwIsCredentialsCatalogueUnavailable
} from "../../credentialsCatalogue/store/selectors/index.ts";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import { ItwParamsList } from "../../navigation/ItwParamsList.ts";
import { ITW_ROUTES } from "../../navigation/routes.ts";
import { ItwOnboardingModuleCredentialsList } from "../components/ItwOnboardingModuleCredentialsList.tsx";
import { itwIsL3EnabledSelector } from "../../common/store/selectors/preferences.ts";

const CATALOGUE_ENABLED = false;
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
  const navigation = useIONavigation();
  const isWalletEnabled = useIOSelector(itwLifecycleIsValidSelector);
  const [page, setPage] = useState<number>(
    params && !isNaN(Number(params?.page))
      ? clamp(Number(params.page), MAX_INDEX)
      : 0
  );

  useFocusEffect(trackShowCredentialsList);

  const itwAction = useMemo(() => {
    if (isWalletEnabled) {
      return {
        label: I18n.t("features.wallet.onboarding.cta.addRestricted"),
        onPress: () => {
          setPage(0);
          navigation.replace(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.L2_ONBOARDING
          });
        }
      };
    }

    return undefined;
  }, [isWalletEnabled, navigation]);

  if (page === null) {
    return (
      <IOScrollViewWithLargeHeader
        title={{ label: I18n.t("features.wallet.onboarding.title") }}
        contextualHelp={emptyContextualHelp}
        faqCategories={["wallet", "wallet_methods"]}
        headerActionsProp={{ showHelp: true }}
      />
    );
  }

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: I18n.t("features.wallet.onboarding.title")
      }}
      contextualHelp={emptyContextualHelp}
      faqCategories={["wallet", "wallet_methods"]}
      headerActionsProp={{ showHelp: true }}
    >
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
      <View style={styles.wrapper}>
        {page === 0 && <ItwL3CredentialOnboardingSection action={itwAction} />}
        {page === 1 && <OtherCardsOnboardingSection showTitle />}
      </View>
    </IOScrollViewWithLargeHeader>
  );
};

type ItwCredentialOnboardingSectionProps = {
  action?: {
    label: string;
    onPress: () => void;
  };
};

const ItwL3CredentialOnboardingSection: FunctionComponent<
  ItwCredentialOnboardingSectionProps
> = ({ action }) => {
  const dispatch = useIODispatch();
  const theme = useIOTheme();
  const env = useIOSelector(selectItwEnv);
  const isCatalogueLoading = useIOSelector(itwIsCredentialsCatalogueLoading);
  const isCatalogueUnavailable = useIOSelector(
    itwIsCredentialsCatalogueUnavailable
  );

  // Show upcoming credentials only if env is "pre"
  const shouldShowUpcoming = env === "pre";

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

  const list = (types: Array<string>) => (
    <ItwOnboardingModuleCredentialsList credentialTypesToDisplay={types} />
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
    return (
      <>
        <VStack space={8}>{list(notObtained)}</VStack>
        {obtained.length > 0 && (
          <VStack space={8}>
            <View style={styles.header}>
              <H6 role="heading" color={theme["textBody-tertiary"]}>
                {I18n.t("features.wallet.onboarding.l3-sections.added")}
              </H6>
            </View>
            {list(obtained)}
          </VStack>
        )}
      </>
    );
  };

  return (
    <View>
      <View style={styles.header}>
        <H6 role="heading" color={theme["textBody-tertiary"]}>
          {I18n.t("features.wallet.onboarding.sections.itw")}
        </H6>
        <PoweredByItWalletText />
      </View>
      <VStack space={24}>
        {renderContent()}
        {action ? (
          <>
            <Divider />
            <IOButton
              testID={"restricted-action-testID"}
              variant="link"
              label={action.label}
              onPress={action.onPress}
              accessibilityLabel={action.label}
              numberOfLines={2}
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
      {props.showTitle && (
        <ListItemHeader
          label={I18n.t("features.wallet.onboarding.sections.other")}
        />
      )}
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

export { ItwCardOnboardingL3Screen };
