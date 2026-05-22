import { ListItemHeader, VStack } from "@pagopa/io-app-design-system";
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
import { ItwWalletReadyBanner } from "../../common/components/ItwWalletReadyBanner";
import { useItwPendingReviewRequest } from "../../common/hooks/useItwPendingReviewRequest";
import { useItwStatusIconColor } from "../../common/hooks/useItwStatusIconColor.ts";
import {
  itwShouldHideEidLifecycleAlert,
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
        navigation={navigation}
        currentScreenName={currentScreenName}
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
        <ListItemHeader
          testID={"walletCardsCategoryItwIdCardHeaderTestID"}
          label={I18n.t("features.wallet.cards.categories.itw")}
        />
      );
    }
    return (
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
    );
  }, [iconColor, isNewItwRenderable, eidInfoBottomSheet.present]);

  return (
    <View>
      {sectionHeader}
      <VStack space={8}>
        {shouldRenderUpgradeBanner && (
          <ItwDiscoveryBanner flow="wallet" style={{ marginVertical: 8 }} />
        )}
        <ItwWalletReadyBanner />
        {!shouldHideEidAlert && (
          <ItwEidLifecycleAlert
            lifecycleStatus={LIFECYCLE_STATUS}
            navigation={navigation}
            currentScreenName={currentScreenName}
          />
        )}
      </VStack>

      <View style={styles.cardsWrapper}>
        {isNewItwRenderable && <ItwWalletIdCard isStacked={cards.length > 0} />}
        {cards.length > 0 && (
          <GuidedTour
            groupId={ITW_TOUR_GROUP_ID}
            index={ITW_TOUR_STEP_CREDENTIALS}
            title={I18n.t("features.itWallet.tour.credentials.title")}
            description={I18n.t(
              "features.itWallet.tour.credentials.description"
            )}
          >
            <WalletCardsCategoryContainer
              key={`cards_category_itw`}
              testID={`itwWalletCardsContainerTestID`}
              cards={cards}
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
  }
});
