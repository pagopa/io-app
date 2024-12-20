import { IOStyles, ListItemHeader } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo } from "react";
import { View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import I18n from "../../../i18n";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../store/hooks";
import { isItwEnabledSelector } from "../../../store/reducers/backendStatus/remoteConfig";
import { useIOBottomSheetAutoresizableModal } from "../../../utils/hooks/bottomSheet";
import { ItwDiscoveryBannerStandalone } from "../../itwallet/common/components/discoveryBanner/ItwDiscoveryBannerStandalone";
import {
  ItwEidInfoBottomSheetContent,
  ItwEidInfoBottomSheetTitle
} from "../../itwallet/common/components/ItwEidInfoBottomSheetContent";
import { ItwEidLifecycleAlert } from "../../itwallet/common/components/ItwEidLifecycleAlert";
import { ItwFeedbackBanner } from "../../itwallet/common/components/ItwFeedbackBanner";
import { ItwWalletReadyBanner } from "../../itwallet/common/components/ItwWalletReadyBanner";
import { itwCredentialsEidStatusSelector } from "../../itwallet/credentials/store/selectors";
import { itwLifecycleIsValidSelector } from "../../itwallet/lifecycle/store/selectors";
import {
  isWalletEmptySelector,
  selectIsWalletCardsLoading,
  selectWalletCategories,
  selectWalletCategoryFilter,
  selectWalletItwCards,
  selectWalletOtherCards,
  shouldRenderWalletEmptyStateSelector
} from "../store/selectors";
import { WalletCardCategoryFilter } from "../types";
import { useItwWalletInstanceRevocationAlert } from "../../itwallet/walletInstance/hook/useItwWalletInstanceRevocationAlert";
import { WalletCardsCategoryContainer } from "./WalletCardsCategoryContainer";
import { WalletCardsCategoryRetryErrorBanner } from "./WalletCardsCategoryRetryErrorBanner";
import { WalletCardSkeleton } from "./WalletCardSkeleton";
import { WalletEmptyScreenContent } from "./WalletEmptyScreenContent";

const EID_INFO_BOTTOM_PADDING = 128;

/**
 * A component which renders the wallet cards container
 * It handles the loading state, which is displayed when the wallet is empty and the cards are still loading,
 * and the empty state
 */
const WalletCardsContainer = () => {
  const isLoading = useIOSelector(selectIsWalletCardsLoading);
  const isWalletEmpty = useIOSelector(isWalletEmptySelector);
  const selectedCategory = useIOSelector(selectWalletCategoryFilter);
  const shouldRenderEmptyState = useIOSelector(
    shouldRenderWalletEmptyStateSelector
  );

  useItwWalletInstanceRevocationAlert();

  // Loading state is only displayed if there is the initial loading and there are no cards or
  // placeholders in the wallet
  const shouldRenderLoadingState = isLoading && isWalletEmpty;

  // Returns true if no category filter is selected or if the filter matches the given category
  const shouldRenderCategory = useCallback(
    (filter: WalletCardCategoryFilter): boolean =>
      selectedCategory === undefined || selectedCategory === filter,
    [selectedCategory]
  );

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
        {shouldRenderCategory("itw") && <ItwWalletCardsContainer />}
        {shouldRenderCategory("other") && <OtherWalletCardsContainer />}
      </View>
    );
  }, [shouldRenderEmptyState, shouldRenderCategory, shouldRenderLoadingState]);

  return (
    <Animated.View
      style={IOStyles.flex}
      layout={LinearTransition.duration(200)}
    >
      <ItwDiscoveryBannerStandalone />
      {walletContent}
    </Animated.View>
  );
};

const WalletCardsContainerSkeleton = () => (
  <>
    <WalletCardSkeleton testID="walletCardSkeletonTestID_1" cardProps={{}} />
    <WalletCardSkeleton testID="walletCardSkeletonTestID_2" cardProps={{}} />
    <WalletCardSkeleton testID="walletCardSkeletonTestID_3" cardProps={{}} />
  </>
);

const ItwWalletCardsContainer = () => {
  const navigation = useIONavigation();
  const cards = useIOSelector(selectWalletItwCards);
  const isItwValid = useIOSelector(itwLifecycleIsValidSelector);
  const isItwEnabled = useIOSelector(isItwEnabledSelector);
  const eidStatus = useIOSelector(itwCredentialsEidStatusSelector);

  const isEidExpired = eidStatus === "jwtExpired";

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

  if (!isItwEnabled) {
    return null;
  }

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
};

const OtherWalletCardsContainer = () => {
  const cards = useIOSelector(selectWalletOtherCards);
  const categories = useIOSelector(selectWalletCategories);

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
};

export {
  ItwWalletCardsContainer,
  OtherWalletCardsContainer,
  WalletCardsContainer
};
