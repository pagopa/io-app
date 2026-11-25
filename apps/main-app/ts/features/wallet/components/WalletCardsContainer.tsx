import { ListItemHeader } from "@io-app/design-system";
import I18n from "i18next";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { shallowEqual } from "react-redux";

import { useDebugInfo } from "../../../hooks/useDebugInfo";
import { useIOSelector } from "../../../store/hooks";
import { DocSuIODiscoveryBannerStandalone } from "../../itwallet/common/components/discoveryBanner/DocSuIODiscoveryBannerStandalone";
import { DocSuIOEngagementBanner } from "../../itwallet/common/components/DocSuIOEngagementBanner";
import ItwActivationSuccessFeedbackBanner from "../../itwallet/common/components/ItwActivationSuccessFeedbackBanner";
import { ItwEnvironmentAlert } from "../../itwallet/common/components/ItwEnvironmentAlert";
import { ItwWalletNotAvailableBanner } from "../../itwallet/common/components/ItwWalletNotAvailableBanner";
import {
  itwShouldRenderWalletDiscoveryBannerSelector,
  shouldRenderDocSuIOEngagementBannerForInactiveWalletSelector
} from "../../itwallet/common/store/selectors";
import { itwIsActivationSuccessFeedbackBannerVisibleSelector } from "../../itwallet/common/store/selectors/banners";
import { itwWalletActivationFeedbackBannerDataSelector } from "../../itwallet/common/store/selectors/preferences";
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

// A new builder on every render would make Reanimated reconfigure the
// container animation on every render
const CONTAINER_LAYOUT = LinearTransition.duration(200);

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
  const shouldRenderDocSuIOEngagementBanner = useIOSelector(
    shouldRenderDocSuIOEngagementBannerForInactiveWalletSelector
  );
  const isActivationSuccessFeedbackBannerVisible = useIOSelector(
    itwIsActivationSuccessFeedbackBannerVisibleSelector
  );
  const activationSuccessFeedbackBannerData = useIOSelector(
    itwWalletActivationFeedbackBannerDataSelector
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
        {shouldRenderDocSuIOEngagementBanner && <DocSuIOEngagementBanner />}
        {shouldRenderItwDiscoveryBanner && (
          <ItwDiscoveryBanner style={{ marginVertical: 8 }} />
        )}
        {isActivationSuccessFeedbackBannerVisible &&
          activationSuccessFeedbackBannerData && (
            <ItwActivationSuccessFeedbackBanner
              authMethod={activationSuccessFeedbackBannerData.authMethod}
              docStatus={activationSuccessFeedbackBannerData.docStatus}
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
    shouldRenderDocSuIOEngagementBanner,
    isActivationSuccessFeedbackBannerVisible,
    activationSuccessFeedbackBannerData
  ]);

  return (
    <Animated.View layout={CONTAINER_LAYOUT} style={styles.container}>
      <ItwEnvironmentAlert />
      <ItwWalletNotAvailableBanner />
      <DocSuIODiscoveryBannerStandalone />

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
  const cards = useIOSelector(selectWalletOtherCards, shallowEqual);

  useDebugInfo({
    other: {
      cards
    }
  });

  if (cards.length === 0) {
    return <WalletCardsCategoryRetryErrorBanner />;
  }

  return (
    // Not flattened on Android: TalkBack would otherwise sort the section
    // children together with the rest of the wallet, announcing the header
    // after the cards
    <View collapsable={false} testID="otherWalletCardsSectionTestID">
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
