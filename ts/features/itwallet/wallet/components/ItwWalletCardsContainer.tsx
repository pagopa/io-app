import { ListItemHeader, VStack } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
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
  itwShouldRenderNewItWalletSelector,
  itwShouldRenderL2EngagementBannerSelector,
  itwShouldRenderUpgradeBannerSelector
} from "../../common/store/selectors";
import { ItwJwtCredentialStatus } from "../../common/utils/itwTypesUtils.ts";
import {
  itwCredentialsEidExpirationSelector,
  itwCredentialsEidStatusSelector
} from "../../credentials/store/selectors";
import { ItwDiscoveryBanner } from "../../discovery/components/ItwDiscoveryBanner.tsx";
import { ItwWalletIdCard } from "./ItwWalletIdCard";
import { ITW_ROUTES } from "../../navigation/routes.ts";
import { useItwGuidedTour } from "../../tour/hooks/useItwGuidedTour.ts";
import {
  ITW_TOUR_GROUP_ID,
  ITW_TOUR_STEP_CREDENTIALS,
  ITW_TOUR_STEP_ID
} from "../../tour/utils/constants.ts";
import { ItwWalletIdStatus } from "./ItwWalletIdStatus.tsx";

const LIFECYCLE_STATUS: Array<ItwJwtCredentialStatus> = [
  "jwtExpiring",
  "jwtExpired"
];

export const ItwWalletCardsContainer = withWalletCategoryFilter("itw", () => {
  const navigation = useIONavigation();

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
    // Navigation does not seem to work when the bottom sheet's component is not inline
    component: <ItwEidInfoBottomSheetContent navigation={navigation} />
  });

  useFocusEffect(
    useCallback(
      // Automatically dismiss the bottom sheet when focus is lost
      () => eidInfoBottomSheet.dismiss,
      [eidInfoBottomSheet.dismiss]
    )
  );

  const headerCard = useMemo(
    () => (isNewItwRenderable ?
      <View style={styles.idWrapper}>
        <GuidedTour
          groupId={ITW_TOUR_GROUP_ID}
          index={ITW_TOUR_STEP_ID}
          title={I18n.t("features.itWallet.tour.id.title")}
          description={I18n.t("features.itWallet.tour.id.description")}
          cutoutStyle={{ cornerRadius: 16 }}>
            <ItwWalletIdCard />
          </GuidedTour>
        </View>
      : undefined),
    [isNewItwRenderable]
  );

  const legacyHeader = useMemo(
    () =>
      !isNewItwRenderable ? (
        <ListItemHeader
          testID={"walletCardsCategoryItwHeaderTestID"}
          iconName={"legalValue"}
          iconColor={iconColor}
          label={I18n.t("features.wallet.cards.categories.itw")}
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
        />
      ) : undefined,
    [isNewItwRenderable, iconColor, eidInfoBottomSheet.present]
  );

  return (
    <>
    <View style={styles.cardsWrapper}>
      <GuidedTour
        groupId={ITW_TOUR_GROUP_ID}
        index={ITW_TOUR_STEP_CREDENTIALS}
        title={I18n.t("features.itWallet.tour.credentials.title")}
        description={I18n.t("features.itWallet.tour.credentials.description")}
      >
      <WalletCardsCategoryContainer
        key={`cards_category_itw`}
        testID={`itwWalletCardsContainerTestID`}
        cards={cards}
        headerCard={headerCard}
        header={legacyHeader}
        topElement={
          <VStack space={16}>
            {shouldRenderUpgradeBanner && <ItwDiscoveryBanner flow="wallet" />}
            {shouldRenderL2EngagementBanner && <ItwL2EngagementBanner />}
            <ItwWalletReadyBanner />
            {!shouldHideEidAlert && (
              <ItwEidLifecycleAlert
                lifecycleStatus={LIFECYCLE_STATUS}
                navigation={navigation}
              />
            )}
            {/* Dummy view to add space in case there is another component */}
            <View />
          </VStack>
        }
      />

      </GuidedTour>
    </View>
  {eidInfoBottomSheet.bottomSheet}
</>
);
});

const styles = StyleSheet.create({
  idWrapper: {
    marginHorizontal: -8
  },
  cardsWrapper: {
    marginHorizontal: -8
  }
});
