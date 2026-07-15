import { ListItemHeader } from "@io-app/design-system";
import I18n from "i18next";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";

import { useDebugInfo } from "../../../hooks/useDebugInfo";
import { useIOSelector } from "../../../store/hooks";
import { ItwDiscoveryBannerStandalone } from "../../itwallet/common/components/discoveryBanner/ItwDiscoveryBannerStandalone";
import ItwActivationSuccessFeedbackBanner from "../../itwallet/common/components/ItwActivationSuccessFeedbackBanner";
import { ItwL2EngagementBanner } from "../../itwallet/common/components/ItwL2EngagementBanner";
import { ItwWalletNotAvailableBanner } from "../../itwallet/common/components/ItwWalletNotAvailableBanner";
import {
  itwShouldRenderL2EngagementBannerForInactiveWalletSelector,
  itwShouldRenderWalletDiscoveryBannerSelector
} from "../../itwallet/common/store/selectors";
import { itwWalletActivationFeedbackBannerSelector } from "../../itwallet/common/store/selectors/preferences";
import { ItwDiscoveryBanner } from "../../itwallet/discovery/components/ItwDiscoveryBanner";
import { ItwWalletCardsContainer } from "../../itwallet/wallet/components/ItwWalletCardsContainer";
import { useItwWalletInstanceRevocationAlert } from "../../itwallet/walletInstance/hook/useItwWalletInstanceRevocationAlert";
import {
  selectWalletOtherCards,
  shouldRenderItwCardsContainerSelector,
  shouldRenderWalletEmptyStateSelector,
  shouldRenderWalletLoadingStateSelector
} from "../store/selectors";
import { withWalletCategoryFilter } from "../utils";
import { WalletCardsCategoryContainer } from "./WalletCardsCategoryContainer";
import { WalletCardsCategoryRetryErrorBanner } from "./WalletCardsCategoryRetryErrorBanner";
import { WalletCardSkeleton } from "./WalletCardSkeleton";
import { WalletEmptyScreenContent } from "./WalletEmptyScreenContent";

/**
 * A component which renders the wallet cards container It handles the loading
 * state, which is displayed when the wallet is empty and the cards are still
 * loading, and the empty state
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
  const shouldRenderItwDiscoveryBanner = useIOSelector(
    itwShouldRenderWalletDiscoveryBannerSelector
  );
  const shouldRenderL2EngagementBanner = useIOSelector(
    itwShouldRenderL2EngagementBannerForInactiveWalletSelector
  );
  const walletActivationFeedbackBannerData = useIOSelector(
    itwWalletActivationFeedbackBannerSelector
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
      <>
        {shouldRenderL2EngagementBanner && <ItwL2EngagementBanner />}
        {shouldRenderItwDiscoveryBanner && (
          <ItwDiscoveryBanner style={{ marginVertical: 8 }} />
        )}
        {walletActivationFeedbackBannerData && (
          <ItwActivationSuccessFeedbackBanner
            authMethod={walletActivationFeedbackBannerData.authMethod}
            docStatus={walletActivationFeedbackBannerData.docStatus}
            style={{ marginVertical: 8 }}
          />
        )}
        <View style={styles.walletContent} testID="walletCardsContainerTestID">
          {shouldRenderItwCardsContainer && <ItwWalletCardsContainer />}
          <OtherWalletCardsContainer />
        </View>
      </>
    );
  }, [
    shouldRenderLoadingState,
    shouldRenderEmptyState,
    shouldRenderItwCardsContainer,
    shouldRenderItwDiscoveryBanner,
    shouldRenderL2EngagementBanner,
    walletActivationFeedbackBannerData
  ]);

  return (
    <Animated.View
      layout={LinearTransition.duration(200)}
      style={styles.container}
    >
      {/* <ItwEnvironmentAlert /> */}
      <ItwWalletNotAvailableBanner />
      <ItwDiscoveryBannerStandalone />

      {walletContent}
    </Animated.View>
  );
};

/** Skeleton for the wallet cards container */
const WalletCardsContainerSkeleton = () => (
  <>
    <WalletCardSkeleton cardProps={{}} testID="walletCardSkeletonTestID_1" />
    <WalletCardSkeleton cardProps={{}} testID="walletCardSkeletonTestID_2" />
    <WalletCardSkeleton cardProps={{}} testID="walletCardSkeletonTestID_3" />
  </>
);

/** Card container for the other cards (payments, bonus, etc.) */
const OtherWalletCardsContainer = withWalletCategoryFilter("other", () => {
  const cards = useIOSelector(selectWalletOtherCards);

  useDebugInfo({
    other: {
      cards
    }
  });

  if (cards.length === 0) {
    return <WalletCardsCategoryRetryErrorBanner />;
  }

  return (
    <View>
      <ListItemHeader
        label={I18n.t("features.wallet.cards.categories.other")}
        testID={"walletCardsCategoryOtherHeaderTestID"}
      />
      <View style={styles.cardsWrapper}>
        <WalletCardsCategoryContainer
          cards={cards}
          key="cards_category_other"
          testID="otherWalletCardsContainerTestID"
        />
      </View>
      <WalletCardsCategoryRetryErrorBanner />
    </View>
  );
});

export {
  ItwWalletCardsContainer,
  OtherWalletCardsContainer,
  WalletCardsContainer
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 8
  },
  walletContent: {
    flex: 1,
    gap: 16
  },
  cardsWrapper: {
    marginHorizontal: -8
  }
});
