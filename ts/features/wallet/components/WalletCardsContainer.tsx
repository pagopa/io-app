import { IOStyles, ListItemHeader } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo } from "react";
import { View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { useDebugInfo } from "../../../hooks/useDebugInfo";
import I18n from "../../../i18n";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../store/hooks";
import { useIOBottomSheetAutoresizableModal } from "../../../utils/hooks/bottomSheet";
import {
  ItwEidInfoBottomSheetContent,
  ItwEidInfoBottomSheetTitle
} from "../../itwallet/common/components/ItwEidInfoBottomSheetContent";
import { ItwEidLifecycleAlert } from "../../itwallet/common/components/ItwEidLifecycleAlert";
import { ItwFeedbackBanner } from "../../itwallet/common/components/ItwFeedbackBanner";
import { ItwWalletReadyBanner } from "../../itwallet/common/components/ItwWalletReadyBanner";
import { ItwDiscoveryBannerStandalone } from "../../itwallet/common/components/discoveryBanner/ItwDiscoveryBannerStandalone";
import { itwCredentialsEidStatusSelector } from "../../itwallet/credentials/store/selectors";
import { itwLifecycleIsValidSelector } from "../../itwallet/lifecycle/store/selectors";
import { useItwWalletInstanceRevocationAlert } from "../../itwallet/walletInstance/hook/useItwWalletInstanceRevocationAlert";
import {
  isWalletEmptySelector,
  selectIsWalletLoading,
  selectWalletCardsByCategory,
  selectWalletCategories,
  selectWalletOtherCards,
  shouldRenderItwCardsContainerSelector,
  shouldRenderWalletEmptyStateSelector
} from "../store/selectors";
import { ItwWalletNotAvailableBanner } from "../../itwallet/common/components/ItwWalletNotAvailableBanner";
import { withWalletCategoryFilter } from "../utils";
import { WalletCardSkeleton } from "./WalletCardSkeleton";
import { WalletCardsCategoryContainer } from "./WalletCardsCategoryContainer";
import { WalletCardsCategoryRetryErrorBanner } from "./WalletCardsCategoryRetryErrorBanner";
import { WalletEmptyScreenContent } from "./WalletEmptyScreenContent";
import { useItwReviewRequest } from "../../itwallet/common/hooks/useItwReviewRequest";

const EID_INFO_BOTTOM_PADDING = 128;

/**
 * A component which renders the wallet cards container
 * It handles the loading state, which is displayed when the wallet is empty and the cards are still loading,
 * and the empty state
 */
const WalletCardsContainer = () => {
  const isLoading = useIOSelector(selectIsWalletLoading);
  const isWalletEmpty = useIOSelector(isWalletEmptySelector);
  const shouldRenderEmptyState = useIOSelector(
    shouldRenderWalletEmptyStateSelector
  );
  const shouldRenderItwCardsContainer = useIOSelector(
    shouldRenderItwCardsContainerSelector
  );

  useItwWalletInstanceRevocationAlert();

  // Loading state is only displayed if there is the initial loading and there are no cards or
  // placeholders in the wallet
  const shouldRenderLoadingState = isLoading && isWalletEmpty;

  // Content to render in the wallet screen, based on the current state
  const walletContent = useMemo(() => {
    if (shouldRenderLoadingState) {
      return <WalletCardsContainerSkeleton />;
    }
    if (shouldRenderEmptyState) {
      return <WalletEmptyScreenContent />;
    }
    return (
      <View testID="walletCardsContainerTestID" style={IOStyles.flex}>
        {shouldRenderItwCardsContainer && <ItwWalletCardsContainer />}
        <OtherWalletCardsContainer />
      </View>
    );
  }, [
    shouldRenderEmptyState,
    shouldRenderLoadingState,
    shouldRenderItwCardsContainer
  ]);

  return (
    <Animated.View
      style={IOStyles.flex}
      layout={LinearTransition.duration(200)}
    >
      <ItwWalletNotAvailableBanner />
      <ItwDiscoveryBannerStandalone />
      {walletContent}
    </Animated.View>
  );
};

/**
 * Skeleton for the wallet cards container
 */
const WalletCardsContainerSkeleton = () => (
  <>
    <WalletCardSkeleton testID="walletCardSkeletonTestID_1" cardProps={{}} />
    <WalletCardSkeleton testID="walletCardSkeletonTestID_2" cardProps={{}} />
    <WalletCardSkeleton testID="walletCardSkeletonTestID_3" cardProps={{}} />
  </>
);

/**
 * Card container for the ITW credentials
 */
const ItwWalletCardsContainer = withWalletCategoryFilter("itw", () => {
  const navigation = useIONavigation();
  const cards = useIOSelector(state =>
    selectWalletCardsByCategory(state, "itw")
  );
  const isItwValid = useIOSelector(itwLifecycleIsValidSelector);
  const eidStatus = useIOSelector(itwCredentialsEidStatusSelector);

  const isEidExpired = eidStatus === "jwtExpired";
  useItwReviewRequest();

  useDebugInfo({
    itw: {
      isItwValid,
      eidStatus,
      cards
    }
  });

  const eidInfoBottomSheet = useIOBottomSheetAutoresizableModal(
    {
      title: <ItwEidInfoBottomSheetTitle isExpired={isEidExpired} />,
      // Navigation does not seem to work when the bottom sheet's component is not inline
      component: <ItwEidInfoBottomSheetContent navigation={navigation} />
    },
    EID_INFO_BOTTOM_PADDING
  );

  useFocusEffect(
    useCallback(
      // Automatically dismiss the bottom sheet when focus is lost
      () => eidInfoBottomSheet.dismiss,
      [eidInfoBottomSheet.dismiss]
    )
  );

  const sectionHeader = useMemo((): ListItemHeader | undefined => {
    if (!isItwValid) {
      return undefined;
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
  }, [isItwValid, isEidExpired, eidInfoBottomSheet.present]);

  return (
    <>
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
            />
          </>
        }
        bottomElement={<ItwFeedbackBanner />}
      />
      {isItwValid && eidInfoBottomSheet.bottomSheet}
    </>
  );
});

/**
 * Card container for the other cards (payments, bonus, etc.)
 */
const OtherWalletCardsContainer = withWalletCategoryFilter("other", () => {
  const cards = useIOSelector(selectWalletOtherCards);
  const categories = useIOSelector(selectWalletCategories);

  useDebugInfo({
    other: {
      cards
    }
  });

  const sectionHeader = useMemo((): ListItemHeader | undefined => {
    // The section header must be displayed only if there are more categories
    if (categories.size <= 1) {
      return undefined;
    }
    return {
      testID: "walletCardsCategoryOtherHeaderTestID",
      label: I18n.t("features.wallet.cards.categories.other")
    };
  }, [categories.size]);

  // If there are no cards, don't render the container
  if (cards.length === 0) {
    return <WalletCardsCategoryRetryErrorBanner />;
  }

  return (
    <WalletCardsCategoryContainer
      key={`cards_category_other`}
      testID={`otherWalletCardsContainerTestID`}
      cards={cards}
      header={sectionHeader}
      bottomElement={<WalletCardsCategoryRetryErrorBanner />}
    />
  );
});

export {
  ItwWalletCardsContainer,
  OtherWalletCardsContainer,
  WalletCardsContainer
};
