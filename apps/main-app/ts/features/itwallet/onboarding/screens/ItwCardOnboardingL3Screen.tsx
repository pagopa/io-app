import {
  Alert,
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
import { openWebUrl } from "../../../../utils/url.ts";
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
  itwIsActivationDisabledSelector,
  itwIsL3EnabledSelector
} from "../../common/store/selectors/preferences.ts";
import {
  isL2Credential,
  isUpcomingCredential
} from "../../common/utils/itwCredentialUtils.ts";
import { makeItwCredentialsByPresenceSelector } from "../../credentials/store/selectors";
import { itwAvailableCredentialsListSelector } from "../../credentialsCatalogue/store/selectors";
import {
  itwLifecycleIsITWalletValidSelector,
  itwLifecycleIsValidSelector
} from "../../lifecycle/store/selectors";
import { ItwParamsList } from "../../navigation/ItwParamsList.ts";
import { ITW_ROUTES } from "../../navigation/routes.ts";
import { AsyncCredentialsCatalogue } from "../components/AsyncCredentialsCatalogueWrapper.tsx";
import { ItwOnboardingModuleCredentialsList } from "../components/ItwOnboardingModuleCredentialsList.tsx";

const MAX_INDEX = 1;

const NFC_NOT_SUPPORTED_FAQ_URL =
  "https://assistenza.ioapp.it/hc/it/articles/35541811236113-Cosa-serve-per-usare-IT-Wallet";

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
      contextualHelp={emptyContextualHelp}
      faqCategories={["wallet", "wallet_methods"]}
      headerActionsProp={{ showHelp: true }}
      title={{
        label: I18n.t("features.wallet.onboarding.title")
      }}
    >
      <View style={styles.tabs}>
        <TabNavigation
          key={`tab-${page}`}
          onItemPress={setPage}
          selectedIndex={page}
          tabAlignment="start"
        >
          <TabItem
            accessibilityLabel={I18n.t(
              "features.wallet.onboarding.l3-sections.itw"
            )}
            label={I18n.t("features.wallet.onboarding.l3-sections.itw")}
          />
          <TabItem
            accessibilityLabel={I18n.t(
              "features.wallet.onboarding.l3-sections.other"
            )}
            label={I18n.t("features.wallet.onboarding.l3-sections.other")}
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

  const isItWalletActivationDisabled = useIOSelector(
    itwIsActivationDisabledSelector
  );
  const catalogueCredentials = useIOSelector(
    itwAvailableCredentialsListSelector
  );

  // Show upcoming credentials only if env is "pre"
  const shouldShowUpcoming = env === "pre";
  const shouldShowRestrictedAction =
    isWalletEnabled && !isITWalletEnabled && !isItWalletActivationDisabled;

  const credentialsToDisplay = useMemo(() => {
    if (isItWalletActivationDisabled) {
      return catalogueCredentials.filter(c => isL2Credential(c.type));
    }
    if (shouldShowUpcoming) {
      return catalogueCredentials;
    }
    return catalogueCredentials.filter(c => !isUpcomingCredential(c.type));
  }, [catalogueCredentials, shouldShowUpcoming, isItWalletActivationDisabled]);

  const { obtained, notObtained } = useIOSelector(
    makeItwCredentialsByPresenceSelector(credentialsToDisplay)
  );

  return (
    <View>
      <View style={styles.header}>
        <H6 color={theme["textBody-tertiary"]} role="heading">
          {I18n.t("features.wallet.onboarding.sections.itw")}
        </H6>
        {!isItWalletActivationDisabled && <PoweredByItWalletText />}
      </View>
      <VStack space={24}>
        {/* Available credentials for issuance */}
        <AsyncCredentialsCatalogue>
          <ItwOnboardingModuleCredentialsList
            credentialsToDisplay={notObtained}
            isL2Credential={isItWalletActivationDisabled}
          />
        </AsyncCredentialsCatalogue>

        {isItWalletActivationDisabled && (
          <Alert
            action={I18n.t("features.wallet.onboarding.no-nfc-banner.cta")}
            content={I18n.t("features.wallet.onboarding.no-nfc-banner.content")}
            onPress={() => openWebUrl(NFC_NOT_SUPPORTED_FAQ_URL)}
            variant="info"
          />
        )}

        {/* Obtained credentials  */}
        {obtained.length > 0 && (
          <VStack space={8}>
            <View style={styles.header}>
              <H6 color={theme["textBody-tertiary"]} role="heading">
                {I18n.t("features.wallet.onboarding.l3-sections.added")}
              </H6>
            </View>
            <ItwOnboardingModuleCredentialsList
              credentialsToDisplay={obtained}
            />
          </VStack>
        )}

        {/* Documenti su IO fallback action */}
        {shouldShowRestrictedAction ? (
          <>
            <Divider />
            <IOButton
              accessibilityLabel={I18n.t(
                "features.wallet.onboarding.cta.addRestricted"
              )}
              label={I18n.t("features.wallet.onboarding.cta.addRestricted")}
              numberOfLines={2}
              onPress={() =>
                navigation.replace(ITW_ROUTES.MAIN, {
                  screen: ITW_ROUTES.L2_ONBOARDING
                })
              }
              testID={"restricted-action-testID"}
              variant="link"
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

  const cgnBaseProps = useMemo(() => {
    const activeBadge: Badge = {
      variant: "success",
      text: I18n.t("features.wallet.onboarding.badge.active")
    };

    return {
      testID: "cgnModuleTestID",
      label: I18n.t("features.wallet.onboarding.options.cgn"),
      onPress: !isCgnActive ? startCgnActivation : undefined,
      badge: isCgnActive ? activeBadge : undefined
    };
  }, [startCgnActivation, isCgnActive]);

  const cgnModule = useMemo(
    () =>
      isCgnLoading ? (
        <ModuleCredential isLoading={true} testID="cgnModuleLoadingTestID" />
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
    paddingTop: 8,
    paddingBottom: 16
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
