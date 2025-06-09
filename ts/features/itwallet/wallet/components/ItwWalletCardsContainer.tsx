import {
  Icon,
  IOButton,
  ListItemHeader,
  Optional,
  VStack
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { WalletCardsCategoryContainer } from "../../../wallet/components/WalletCardsCategoryContainer";
import { selectWalletCardsByCategory } from "../../../wallet/store/selectors";
import { withWalletCategoryFilter } from "../../../wallet/utils";
import {
  ItwEidInfoBottomSheetContent,
  ItwEidInfoBottomSheetTitle
} from "../../common/components/ItwEidInfoBottomSheetContent";
import { ItwEidLifecycleAlert } from "../../common/components/ItwEidLifecycleAlert";
import { ItwFeedbackBanner } from "../../common/components/ItwFeedbackBanner";
import { ItwWalletReadyBanner } from "../../common/components/ItwWalletReadyBanner";
import { itwCredentialsEidStatusSelector } from "../../credentials/store/selectors";
import { useItwPendingReviewRequest } from "../../common/hooks/useItwPendingReviewRequest";
import { itwShouldRenderNewITWallet } from "../../common/store/selectors";
import { ItwBadge } from "../../common/components/ItwBadge";
import { ItwEidDetail } from "../../common/components/ItwEidDetail";
import { ItwOfflineWalletBanner } from "../../common/components/ItwOfflineWalletBanner.tsx";

export const ItwWalletCardsContainer = withWalletCategoryFilter("itw", () => {
  const isNewItwRenderable = useIOSelector(itwShouldRenderNewITWallet);
  const navigation = useIONavigation();
  const cards = useIOSelector(state =>
    selectWalletCardsByCategory(state, "itw")
  );
  const eidStatus = useIOSelector(itwCredentialsEidStatusSelector);

  const isEidExpired = eidStatus === "jwtExpired";

  useItwPendingReviewRequest();

  useDebugInfo({
    itw: {
      eidStatus,
      cards
    }
  });

  const eidInfoBottomSheet = useIOBottomSheetModal({
    title: isNewItwRenderable ? (
      // TODO: Replace with IT-Wallet logo
      <Icon name="navWallet" color="blueIO-500" size={32} />
    ) : (
      <ItwEidInfoBottomSheetTitle isExpired={isEidExpired} />
    ),
    // Navigation does not seem to work when the bottom sheet's component is not inline
    component: isNewItwRenderable ? (
      <ItwEidDetail navigation={navigation} />
    ) : (
      <ItwEidInfoBottomSheetContent navigation={navigation} />
    )
  });

  useFocusEffect(
    useCallback(
      // Automatically dismiss the bottom sheet when focus is lost
      () => eidInfoBottomSheet.dismiss,
      [eidInfoBottomSheet.dismiss]
    )
  );

  const sectionHeader = useMemo((): Optional<ListItemHeader> => {
    if (isNewItwRenderable) {
      return;
    }
    return {
      testID: "walletCardsCategoryItwHeaderTestID",
      iconName: "legalValue",
      iconColor: isEidExpired ? "grey-300" : "blueIO-500",
      label: I18n.t("features.wallet.cards.categories.itw"),
      endElement: {
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
      }
    };
  }, [isEidExpired, eidInfoBottomSheet.present, isNewItwRenderable]);

  return (
    <>
      {isNewItwRenderable && (
        <View style={styles.itwHeader}>
          <ItwBadge variant="outlined" />
          <IOButton
            color="contrast"
            variant="link"
            label={I18n.t("features.itWallet.wallet.header")}
            onPress={eidInfoBottomSheet.present}
          />
        </View>
      )}
      <VStack space={16}>
        <ItwOfflineWalletBanner />
        <WalletCardsCategoryContainer
          key={`cards_category_itw`}
          testID={`itwWalletCardsContainerTestID`}
          cards={cards}
          header={sectionHeader}
          topElement={
            <>
              <ItwWalletReadyBanner />
              <ItwEidLifecycleAlert
                lifecycleStatus={["jwtExpiring", "jwtExpired"]}
                navigation={navigation}
              />
            </>
          }
          bottomElement={<ItwFeedbackBanner />}
        />
        {eidInfoBottomSheet.bottomSheet}
      </VStack>
    </>
  );
});

const styles = StyleSheet.create({
  itwHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    marginHorizontal: -8
  }
});
