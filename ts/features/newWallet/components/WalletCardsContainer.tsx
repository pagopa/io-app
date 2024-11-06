import {
  IOStyles,
  ListItemHeader,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import I18n from "../../../i18n";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../store/hooks";
import { isItwEnabledSelector } from "../../../store/reducers/backendStatus/remoteConfig";
import { useIOBottomSheetAutoresizableModal } from "../../../utils/hooks/bottomSheet";
import { ItwDiscoveryBanner } from "../../itwallet/common/components/ItwDiscoveryBanner";
import {
  ItwEidInfoBottomSheetContent,
  ItwEidInfoBottomSheetTitle
} from "../../itwallet/common/components/ItwEidInfoBottomSheetContent";
import { ItwEidLifecycleAlert } from "../../itwallet/common/components/ItwEidLifecycleAlert";
import { ItwUpcomingWalletBanner } from "../../itwallet/common/components/ItwUpcomingWalletBanner";
import { ItwWalletFeebdackBanner } from "../../itwallet/common/components/ItwWalletFeedbackBanner";
import { ItwWalletReadyBanner } from "../../itwallet/common/components/ItwWalletReadyBanner";
import { itwCredentialsEidStatusSelector } from "../../itwallet/credentials/store/selectors";
import { itwLifecycleIsValidSelector } from "../../itwallet/lifecycle/store/selectors";
import { isItwTrialActiveSelector } from "../../trialSystem/store/reducers";
import {
  selectIsWalletCardsLoading,
  selectSortedWalletCards,
  selectWalletCategoryFilter,
  selectWalletItwCards,
  selectWalletOtherCards
} from "../store/selectors";
import { WalletCardCategoryFilter } from "../types";
import { WalletCardSkeleton } from "./WalletCardSkeleton";
import { WalletCardsCategoryContainer } from "./WalletCardsCategoryContainer";
import { WalletCardsCategoryRetryErrorBanner } from "./WalletCardsCategoryRetryErrorBanner";
import { WalletEmptyScreenContent } from "./WalletEmptyScreenContent";

const EID_INFO_BOTTOM_PADDING = 128;

const WalletCardsContainer = () => {
  const isLoading = useIOSelector(selectIsWalletCardsLoading);
  const cards = useIOSelector(selectSortedWalletCards);
  const selectedCategory = useIOSelector(selectWalletCategoryFilter);

  if (isLoading && cards.length === 0) {
    return (
      <>
        <WalletCardSkeleton testID="walletCardSkeletonTestID" cardProps={{}} />
        <VSpacer size={16} />
        <WalletCardsCategoryRetryErrorBanner />
      </>
    );
  }

  if (cards.length === 0) {
    // In this case we can display the empty state: we do not have cards to display and
    // the wallet is not in a loading state anymore
    return (
      <View style={IOStyles.flex}>
        <ItwBanners />
        <WalletEmptyScreenContent />
      </View>
    );
  }

  const shouldRender = (filter: WalletCardCategoryFilter) =>
    selectedCategory ? selectedCategory === filter : true;

  return (
    <Animated.View
      style={IOStyles.flex}
      layout={LinearTransition.duration(200)}
    >
      <View testID="walletCardsContainerTestID">
        <ItwBanners />
        {shouldRender("itw") && <ItwCardsContainer />}
        {shouldRender("other") && <OtherCardsContainer />}
      </View>
    </Animated.View>
  );
};

const ItwCardsContainer = () => {
  const navigation = useIONavigation();
  const cards = useIOSelector(selectWalletItwCards);
  const isItwTrialEnabled = useIOSelector(isItwTrialActiveSelector);
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
    React.useCallback(
      // Automatically dismiss the bottom sheet when focus is lost
      () => eidInfoBottomSheet.dismiss,
      [eidInfoBottomSheet.dismiss]
    )
  );

  if (!isItwTrialEnabled || !isItwEnabled) {
    return null;
  }

  const getHeader = (): ListItemHeader | undefined => {
    if (!isItwValid) {
      return undefined;
    }
    return {
      iconName: "legalValue",
      iconColor: isEidExpired ? "grey-300" : "blueIO-500",
      label: I18n.t("features.wallet.cards.categories.itw"),
      endElement: {
        type: "buttonLink",
        componentProps: {
          label: I18n.t(
            "features.itWallet.presentation.bottomSheets.eidInfo.triggerLabel"
          ),
          onPress: eidInfoBottomSheet.present,
          testID: "walletCardsCategoryItwActiveBadgeTestID"
        }
      }
    };
  };

  return (
    <>
      <WalletCardsCategoryContainer
        key={`cards_category_itw`}
        testID={`walletCardsCategoryTestID_itw`}
        cards={cards}
        header={getHeader()}
        topElement={
          <>
            <ItwWalletReadyBanner />
            <ItwEidLifecycleAlert
              lifecycleStatus={["jwtExpiring", "jwtExpired"]}
            />
          </>
        }
        bottomElement={<ItwWalletFeebdackBanner />}
      />
      {isItwValid && eidInfoBottomSheet.bottomSheet}
    </>
  );
};

const OtherCardsContainer = () => {
  const cards = useIOSelector(selectWalletOtherCards);
  const isItwTrialEnabled = useIOSelector(isItwTrialActiveSelector);
  const isItwEnabled = useIOSelector(isItwEnabledSelector);
  const isItwValid = useIOSelector(itwLifecycleIsValidSelector);

  if (cards.length === 0) {
    return null;
  }

  const displayHeader = isItwTrialEnabled && isItwEnabled && isItwValid;

  return (
    <WalletCardsCategoryContainer
      key={`cards_category_other`}
      testID={`walletCardsCategoryTestID_other`}
      cards={cards}
      header={
        displayHeader
          ? {
              label: I18n.t("features.wallet.cards.categories.other")
            }
          : undefined
      }
    />
  );
};

/**
 * Wrapper components for ITW banners.
 */
const ItwBanners = () => (
  <>
    <ItwUpcomingWalletBanner bottomSpacing={24} />
    <ItwDiscoveryBanner ignoreMargins={true} closable={false} />
  </>
);

export { WalletCardsContainer };
