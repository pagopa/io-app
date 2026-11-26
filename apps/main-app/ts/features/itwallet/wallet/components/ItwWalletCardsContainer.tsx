import { ListItemHeader } from "@io-app/design-system";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { shallowEqual } from "react-redux";

import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { GuidedTour } from "../../../tour/components/GuidedTour.tsx";
import { WalletCardsCategoryContainer } from "../../../wallet/components/WalletCardsCategoryContainer";
import { selectWalletCardsByCategory } from "../../../wallet/store/selectors";
import { withWalletCategoryFilter } from "../../../wallet/utils";
import { DocSuIOEngagementBanner } from "../../common/components/DocSuIOEngagementBanner.tsx";
import {
  ItwEidInfoBottomSheetContent,
  ItwEidInfoBottomSheetTitle
} from "../../common/components/ItwEidInfoBottomSheetContent";
import { ItwEidLifecycleAlert } from "../../common/components/ItwEidLifecycleAlert";
import { ItwWalletReadyBanner } from "../../common/components/ItwWalletReadyBanner";
import { useItwStatusIconColor } from "../../common/hooks/useItwStatusIconColor.ts";
import {
  itwShouldRenderNewItWalletSelector,
  shouldRenderDocSuIOEngagementBannerSelector
} from "../../common/store/selectors";
import {
  itwShouldHideEidLifecycleAlert,
  itwShouldRenderNonDismissibleUpgradeBannerSelector,
  itwShouldRenderUpgradeBannerSelector,
  itwShouldRenderUpgradeCredentialsBannerSelector
} from "../../common/store/selectors/upgrade";
import { ItwEidStatus } from "../../common/utils/itwTypesUtils.ts";
import {
  itwCredentialsEidExpirationSelector,
  itwCredentialsEidStatusSelector
} from "../../credentials/store/selectors";
import { ItwDiscoveryBanner } from "../../discovery/components/ItwDiscoveryBanner.tsx";
import { ItwNonDismissibleUpgradeBanner } from "../../discovery/components/ItwNonDismissibleUpgradeBanner.tsx";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";
import { ITW_ROUTES } from "../../navigation/routes";
import { useItwGuidedTour } from "../../tour/hooks/useItwGuidedTour.ts";
import {
  ITW_TOUR_GROUP_ID,
  ITW_TOUR_STEP_CREDENTIALS
} from "../../tour/utils/constants.ts";
import { ItwUpgradeCredentialsBanner } from "./ItwUpgradeCredentialsBanner";
import { ItwWalletIdCard } from "./ItwWalletIdCard.tsx";

const LIFECYCLE_STATUS: Array<ItwEidStatus> = [
  "jwtExpiring",
  "jwtExpired",
  "invalid"
];

export const ItwWalletCardsContainer = withWalletCategoryFilter("itw", () => {
  const navigation = useIONavigation();
  const { name: currentScreenName } = useRoute();
  const isNewItwRenderable = useIOSelector(itwShouldRenderNewItWalletSelector);
  const shouldHideEidAlert = useIOSelector(itwShouldHideEidLifecycleAlert);
  const shouldRenderUpgradeBanner = useIOSelector(
    itwShouldRenderUpgradeBannerSelector
  );
  const shouldRenderNonDismissibleUpgradeBanner = useIOSelector(
    itwShouldRenderNonDismissibleUpgradeBannerSelector
  );
  const shouldRenderDocSuIOEngagementBanner = useIOSelector(
    shouldRenderDocSuIOEngagementBannerSelector
  );
  const isItWalletValid = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const shouldRenderItwWalletReadyBanner =
    !shouldRenderDocSuIOEngagementBanner && !shouldRenderUpgradeBanner;
  const shouldRenderUpgradeCredentialsBanner = useIOSelector(
    itwShouldRenderUpgradeCredentialsBannerSelector
  );

  // Cards of other categories rebuild this array even when ITW cards are unchanged
  const cards = useIOSelector(
    state => selectWalletCardsByCategory(state, "itw"),
    shallowEqual
  );
  const hasCards = cards.length > 0;
  const eidStatus = useIOSelector(itwCredentialsEidStatusSelector);
  const eidExpiration = useIOSelector(itwCredentialsEidExpirationSelector);
  const isEidExpired = eidStatus === "jwtExpired";
  const iconColor = useItwStatusIconColor(isEidExpired);

  useItwGuidedTour();

  useDebugInfo({
    itw: {
      eidStatus,
      eidExpiration,
      cards
    }
  });

  const eidInfoBottomSheet = useIOBottomSheetModal({
    title: <ItwEidInfoBottomSheetTitle isExpired={isEidExpired} />,
    component: (
      <ItwEidInfoBottomSheetContent
        currentScreenName={currentScreenName}
        navigation={navigation}
      />
    )
  });

  useFocusEffect(
    useCallback(
      // Automatically dismiss the bottom sheet when focus is lost
      () => eidInfoBottomSheet.dismiss,
      [eidInfoBottomSheet.dismiss]
    )
  );

  const sectionHeader = useMemo((): React.ReactElement => {
    if (isNewItwRenderable) {
      return (
        <>
          <ListItemHeader
            endElement={{
              type: "buttonLink",
              componentProps: {
                accessibilityLabel: I18n.t(
                  "features.itWallet.wallet.addCredentialButton.accessibilityLabel"
                ),
                label: I18n.t(
                  "features.itWallet.wallet.addCredentialButton.label"
                ),
                onPress: () =>
                  navigation.navigate(ITW_ROUTES.MAIN, {
                    screen: ITW_ROUTES.L3_ONBOARDING
                  }),
                testID: "walletCardsCategoryItwAddButtonTestID"
              }
            }}
            label={I18n.t("features.wallet.cards.categories.itw")}
            testID={"walletCardsCategoryItwIdCardHeaderTestID"}
          />
          {/* The wallet ready banner sits above the PID card to promote the catalog */}
          {shouldRenderItwWalletReadyBanner && <ItwWalletReadyBanner />}
          {/* IT-Wallet renders the PID card below the header */}
          <View style={styles.cardsWrapper} testID="itwWalletIdCardTestID">
            <ItwWalletIdCard isStacked={hasCards} />
          </View>
        </>
      );
    }

    const eidInfoProps = !isItWalletValid
      ? {
          endElement: {
            type: "buttonLink" as const,
            componentProps: {
              accessibilityLabel: I18n.t(
                "features.itWallet.presentation.bottomSheets.eidInfo.triggerLabel"
              ),
              label: I18n.t(
                "features.itWallet.presentation.bottomSheets.eidInfo.triggerLabel"
              ),
              onPress: eidInfoBottomSheet.present,
              testID: "walletCardsCategoryItwActiveBadgeTestID"
            }
          },
          iconColor,
          iconName: "legalValue" as const
        }
      : {};

    return (
      <ListItemHeader
        {...eidInfoProps}
        label={I18n.t("features.wallet.cards.categories.itw")}
        testID={"walletCardsCategoryItwHeaderTestID"}
      />
    );
  }, [
    hasCards,
    eidInfoBottomSheet.present,
    iconColor,
    isItWalletValid,
    isNewItwRenderable,
    navigation,
    shouldRenderItwWalletReadyBanner
  ]);

  const eidLifecycleAlert = shouldHideEidAlert ? null : (
    <ItwEidLifecycleAlert
      currentScreenName={currentScreenName}
      lifecycleStatus={LIFECYCLE_STATUS}
      navigation={navigation}
    />
  );

  return (
    // Not flattened on Android: TalkBack would otherwise sort the section
    // children together with the rest of the wallet, announcing the header
    // after the cards
    <View collapsable={false} testID="itwWalletCardsSectionTestID">
      {shouldRenderUpgradeCredentialsBanner && <ItwUpgradeCredentialsBanner />}
      {/* With IT-Wallet the lifecycle alert must be displayed above the header. */}
      {isNewItwRenderable ? (
        <>
          {eidLifecycleAlert}
          {sectionHeader}
        </>
      ) : (
        <>
          {sectionHeader}
          {eidLifecycleAlert}
        </>
      )}

      <View style={[styles.cardsWrapper, { gap: 16 }]}>
        {shouldRenderUpgradeBanner && (
          <ItwDiscoveryBanner flow="wallet" style={styles.bannerWrapper} />
        )}
        {shouldRenderNonDismissibleUpgradeBanner && (
          <ItwNonDismissibleUpgradeBanner style={styles.bannerWrapper} />
        )}

        {hasCards && (
          <GuidedTour
            description={I18n.t(
              "features.itWallet.tour.credentials.description"
            )}
            groupId={ITW_TOUR_GROUP_ID}
            index={ITW_TOUR_STEP_CREDENTIALS}
            title={I18n.t("features.itWallet.tour.credentials.title")}
          >
            <WalletCardsCategoryContainer
              cards={cards}
              key={`cards_category_itw`}
              testID={`itwWalletCardsContainerTestID`}
            />
          </GuidedTour>
        )}

        {shouldRenderDocSuIOEngagementBanner && <DocSuIOEngagementBanner />}

        {!isNewItwRenderable && shouldRenderItwWalletReadyBanner && (
          <ItwWalletReadyBanner />
        )}
      </View>
      {eidInfoBottomSheet.bottomSheet}
    </View>
  );
});

const styles = StyleSheet.create({
  cardsWrapper: {
    marginHorizontal: -8
  },
  bannerWrapper: {
    marginHorizontal: 8
  }
});
