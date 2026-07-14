import { ListItemHeader, VStack } from "@io-app/design-system";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { GuidedTour } from "../../../tour/components/GuidedTour.tsx";
import { WalletCardsCategoryContainer } from "../../../wallet/components/WalletCardsCategoryContainer";
import { selectWalletCardsByCategory } from "../../../wallet/store/selectors";
import { withWalletCategoryFilter } from "../../../wallet/utils";
import {
  ItwEidInfoBottomSheetContent,
  ItwEidInfoBottomSheetTitle
} from "../../common/components/ItwEidInfoBottomSheetContent";
import { ItwEidLifecycleAlert } from "../../common/components/ItwEidLifecycleAlert";
import { ItwL2EngagementBanner } from "../../common/components/ItwL2EngagementBanner.tsx";
import { ItwWalletReadyBanner } from "../../common/components/ItwWalletReadyBanner";
import { useItwPendingReviewRequest } from "../../common/hooks/useItwPendingReviewRequest";
import { useItwStatusIconColor } from "../../common/hooks/useItwStatusIconColor.ts";
import {
  itwShouldHideEidLifecycleAlert,
  itwShouldRenderL2EngagementBannerSelector,
  itwShouldRenderNewItWalletSelector,
  itwShouldRenderUpgradeBannerSelector
} from "../../common/store/selectors";
import { ItwJwtCredentialStatus } from "../../common/utils/itwTypesUtils.ts";
import {
  itwCredentialsEidExpirationSelector,
  itwCredentialsEidStatusSelector
} from "../../credentials/store/selectors";
import { ItwDiscoveryBanner } from "../../discovery/components/ItwDiscoveryBanner.tsx";
import { useItwGuidedTour } from "../../tour/hooks/useItwGuidedTour.ts";
import {
  ITW_TOUR_GROUP_ID,
  ITW_TOUR_STEP_CREDENTIALS
} from "../../tour/utils/constants.ts";
import { ItwWalletIdCard } from "./ItwWalletIdCard.tsx";

const LIFECYCLE_STATUS: Array<ItwJwtCredentialStatus> = [
  "jwtExpiring",
  "jwtExpired"
];

export const ItwWalletCardsContainer = withWalletCategoryFilter("itw", () => {
  const navigation = useIONavigation();
  const { name: currentScreenName } = useRoute();
  const isNewItwRenderable = useIOSelector(itwShouldRenderNewItWalletSelector);
  const shouldHideEidAlert = useIOSelector(itwShouldHideEidLifecycleAlert);
  const shouldRenderUpgradeBanner = useIOSelector(
    itwShouldRenderUpgradeBannerSelector
  );
  const shouldRenderL2EngagementBanner = useIOSelector(
    itwShouldRenderL2EngagementBannerSelector
  );

  const cards = useIOSelector(state =>
    selectWalletCardsByCategory(state, "itw")
  );
  const eidStatus = useIOSelector(itwCredentialsEidStatusSelector);
  const eidExpiration = useIOSelector(itwCredentialsEidExpirationSelector);
  const isEidExpired = eidStatus === "jwtExpired";
  const iconColor = useItwStatusIconColor(isEidExpired);

  useItwPendingReviewRequest();

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
            label={I18n.t("features.wallet.cards.categories.itw")}
            testID={"walletCardsCategoryItwIdCardHeaderTestID"}
          />
          {/* IT-Wallet renders the PID card below the header */}
          <View style={styles.cardsWrapper}>
            <ItwWalletIdCard isStacked={cards.length > 0} />
          </View>
        </>
      );
    }
    return (
      <ListItemHeader
        endElement={{
          type: "buttonLink",
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
        }}
        iconColor={iconColor}
        iconName={"legalValue"}
        label={I18n.t("features.wallet.cards.categories.itw")}
        testID={"walletCardsCategoryItwHeaderTestID"}
      />
    );
  }, [iconColor, isNewItwRenderable, cards, eidInfoBottomSheet.present]);

  return (
    <View>
      <VStack space={16}>
        {shouldRenderL2EngagementBanner && <ItwL2EngagementBanner />}
        {!shouldHideEidAlert && (
          <ItwEidLifecycleAlert
            currentScreenName={currentScreenName}
            lifecycleStatus={LIFECYCLE_STATUS}
            navigation={navigation}
          />
        )}
      </VStack>

      {sectionHeader}

      <View style={[styles.cardsWrapper, { gap: 16 }]}>
        {shouldRenderUpgradeBanner && (
          <ItwDiscoveryBanner flow="wallet" style={{ marginHorizontal: 8 }} />
        )}
        <ItwWalletReadyBanner />

        {cards.length > 0 && (
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
      </View>
      {eidInfoBottomSheet.bottomSheet}
    </View>
  );
});

const styles = StyleSheet.create({
  cardsWrapper: {
    marginHorizontal: -8
  },
  bannersWrapper: {
    marginHorizontal: 8
  }
});
