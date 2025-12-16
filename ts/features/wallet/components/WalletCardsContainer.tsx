import { ListItemHeader, VStack } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { memo, useMemo } from "react";
import { View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { useDebugInfo } from "../../../hooks/useDebugInfo";
import { useIOSelector } from "../../../store/hooks";
import { ItwEnvironmentAlert } from "../../itwallet/common/components/ItwEnvironmentAlert";
import { ItwUpgradeBanner } from "../../itwallet/common/components/ItwUpgradeBanner";
import { ItwWalletNotAvailableBanner } from "../../itwallet/common/components/ItwWalletNotAvailableBanner";
import { ItwDiscoveryBannerStandalone } from "../../itwallet/common/components/discoveryBanner/ItwDiscoveryBannerStandalone";
import { ItwWalletCardsContainer } from "../../itwallet/wallet/components/ItwWalletCardsContainer";
import { useItwWalletInstanceRevocationAlert } from "../../itwallet/walletInstance/hook/useItwWalletInstanceRevocationAlert";
import {
  selectWalletCategories,
  selectWalletOtherCards,
  shouldRenderItwCardsContainerSelector,
  shouldRenderWalletEmptyStateSelector,
  shouldRenderWalletLoadingStateSelector
} from "../store/selectors";
import { withWalletCategoryFilter } from "../utils";
import { WalletCardSkeleton } from "./WalletCardSkeleton";
import { WalletCardsCategoryContainer } from "./WalletCardsCategoryContainer";
import { WalletCardsCategoryRetryErrorBanner } from "./WalletCardsCategoryRetryErrorBanner";
import { WalletEmptyScreenContent } from "./WalletEmptyScreenContent";

/**
 * A component which renders the wallet cards container
 * It handles the loading state, which is displayed when the wallet is empty and the cards are still loading,
 * and the empty state
 */
const WalletCardsContainer = () => {
  const shouldRenderLoadingState = useIOSelector(
    shouldRenderWalletLoadingStateSelector
  );
  const shouldRenderEmptyState = useIOSelector(
    shouldRenderWalletEmptyStateSelector
  );
  const shouldRenderItwCardsContainer = useIOSelector(
    shouldRenderItwCardsContainerSelector
  );

  useItwWalletInstanceRevocationAlert();

  // Content to render in the wallet screen, based on the current state
  const walletContent = useMemo(() => {
    if (shouldRenderLoadingState) {
      return <WalletCardsContainerSkeleton />;
    }
    if (shouldRenderEmptyState) {
      return <WalletEmptyScreenContent />;
    }
    return (
      <View testID="walletCardsContainerTestID" style={{ flex: 1 }}>
        <WalletBannersContainer />
        {shouldRenderItwCardsContainer && <ItwWalletCardsContainer />}
        <OtherWalletCardsContainer />
      </View>
    );
  }, [
    shouldRenderLoadingState,
    shouldRenderEmptyState,
    shouldRenderItwCardsContainer
  ]);

  return (
    <Animated.View
      style={{ flex: 1, paddingTop: 16 }}
      layout={LinearTransition.duration(200)}
    >
      {walletContent}
    </Animated.View>
  );
};

/**
 * Renders the banners that are displayed at the top of the wallet screen
 */
const WalletBannersContainer = memo(() => (
  <VStack space={16}>
    <ItwEnvironmentAlert />
    <ItwUpgradeBanner />
    <ItwWalletNotAvailableBanner />
    <ItwDiscoveryBannerStandalone />
    {/* Dummy view wich adds a spacer in case one of the above banners is rendered */}
    <View />
  </VStack>
));

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

  const sectionHeader = useMemo((): React.ReactElement | undefined => {
    // The section header must be displayed only if there are more categories
    if (categories.size <= 1) {
      return undefined;
    }
    return (
      <ListItemHeader
        testID={"walletCardsCategoryOtherHeaderTestID"}
        label={I18n.t("features.wallet.cards.categories.other")}
      />
    );
  }, [categories.size]);

  if (cards.length === 0) {
    return <WalletCardsCategoryRetryErrorBanner />;
  }

  return (
    <WalletCardsCategoryContainer
      key="cards_category_other"
      testID="otherWalletCardsContainerTestID"
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
