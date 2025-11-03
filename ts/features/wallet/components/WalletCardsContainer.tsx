import {
  IOColors,
  ListItemHeader,
  useIOTheme,
  VStack
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { memo, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { useDebugInfo } from "../../../hooks/useDebugInfo";
import { useIOSelector } from "../../../store/hooks";
import { ItwEnvironmentAlert } from "../../itwallet/common/components/ItwEnvironmentAlert";
import { ItwWalletNotAvailableBanner } from "../../itwallet/common/components/ItwWalletNotAvailableBanner";
import { ItwDiscoveryBannerStandalone } from "../../itwallet/common/components/discoveryBanner/ItwDiscoveryBannerStandalone";
import { itwShouldRenderNewItWalletSelector } from "../../itwallet/common/store/selectors";
import { WALLET_L3_BG_COLOR } from "../../itwallet/common/utils/constants";
import { ItwWalletCardsContainer } from "../../itwallet/wallet/components/ItwWalletCardsContainer";
import { useItwWalletInstanceRevocationAlert } from "../../itwallet/walletInstance/hook/useItwWalletInstanceRevocationAlert";
import {
  isWalletEmptySelector,
  selectIsWalletLoading,
  selectWalletCategories,
  selectWalletOtherCards,
  shouldRenderItwCardsContainerSelector,
  shouldRenderWalletEmptyStateSelector
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
      <View testID="walletCardsContainerTestID" style={{ flex: 1 }}>
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
      style={{ flex: 1, paddingTop: 16 }}
      layout={LinearTransition.duration(200)}
    >
      <WalletBannersContainer />
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
  const theme = useIOTheme();
  const hasItwNewInterface = useIOSelector(itwShouldRenderNewItWalletSelector);

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

  const content = useMemo(() => {
    // If there are no cards, don't render the container
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
  }, [cards, sectionHeader]);

  if (hasItwNewInterface) {
    // With the ITW UI, we need to add a "cover" on the blue background
    return (
      <View
        style={[
          styles.removeHorizontalMargin,
          styles.extendedBottom,
          {
            backgroundColor: IOColors[theme["appBackground-primary"]]
          }
        ]}
      >
        <View
          style={[
            styles.removeHorizontalMargin,
            styles.clipContainer,
            {
              backgroundColor: IOColors[theme["appBackground-primary"]]
            }
          ]}
        >
          <View style={[styles.removeHorizontalMargin, styles.clip]} />
        </View>
        {content}
      </View>
    );
  }

  return content;
});

const styles = StyleSheet.create({
  removeHorizontalMargin: {
    marginHorizontal: -24,
    paddingHorizontal: 24
  },
  extendedBottom: {
    paddingBottom: 300,
    marginBottom: -300
  },
  clipContainer: {
    marginTop: -14, // Takes 14 pixel from the above component
    height: 18,
    marginBottom: 2
  },
  clip: {
    height: 16,
    backgroundColor: WALLET_L3_BG_COLOR,
    borderBottomStartRadius: 16,
    borderBottomEndRadius: 16,
    borderCurve: "continuous"
  }
});

export {
  ItwWalletCardsContainer,
  OtherWalletCardsContainer,
  WalletCardsContainer
};
