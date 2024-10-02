import {
  ButtonSolid,
  ContentWrapper,
  IOStyles,
  ListItemHeader,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "../../../i18n";
import { useIOSelector } from "../../../store/hooks";
import { isItwEnabledSelector } from "../../../store/reducers/backendStatus";
import { ItwDiscoveryBanner } from "../../itwallet/common/components/ItwDiscoveryBanner";
import { itwLifecycleIsValidSelector } from "../../itwallet/lifecycle/store/selectors";
import { isItwTrialActiveSelector } from "../../trialSystem/store/reducers";
import {
  selectIsWalletCardsLoading,
  selectSortedWalletCards,
  selectWalletItwCards,
  selectWalletOtherCards
} from "../store/selectors";
import { ItwWalletReadyBanner } from "../../itwallet/common/components/ItwWalletReadyBanner";
import {
  ItwEidInfoBottomSheetContent,
  ItwEidInfoBottomSheetTitle
} from "../../itwallet/common/components/ItwEidInfoBottomSheetContent";
import { useIOBottomSheetAutoresizableModal } from "../../../utils/hooks/bottomSheet";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { ITW_ROUTES } from "../../itwallet/navigation/routes";
import { WalletCardSkeleton } from "./WalletCardSkeleton";
import {
  WalletCardsCategoryContainer,
  WalletCardsCategoryContainerProps
} from "./WalletCardsCategoryContainer";
import { WalletEmptyScreenContent } from "./WalletEmptyScreenContent";

const EID_INFO_BOTTOM_PADDING = 168;

const WalletCardsContainer = () => {
  const isLoading = useIOSelector(selectIsWalletCardsLoading);
  const cards = useIOSelector(selectSortedWalletCards);
  const stackCards = cards.length > 4;

  if (isLoading && cards.length === 0) {
    return (
      <WalletCardSkeleton
        testID="walletCardSkeletonTestID"
        cardProps={{}}
        isStacked={false}
      />
    );
  }

  if (cards.length === 0) {
    // In this case we can display the empty state: we do not have cards to display and
    // the wallet is not in a loading state anymore
    return <WalletEmptyScreenContent />;
  }

  return (
    <Animated.View
      style={IOStyles.flex}
      layout={LinearTransition.duration(200)}
    >
      <View testID="walletCardsContainerTestID">
        <ItwCardsContainer isStacked={stackCards} />
        <OtherCardsContainer isStacked={stackCards} />
      </View>
    </Animated.View>
  );
};

const ItwCardsContainer = ({
  isStacked
}: Pick<WalletCardsCategoryContainerProps, "isStacked">) => {
  const cards = useIOSelector(selectWalletItwCards);
  const isItwTrialEnabled = useIOSelector(isItwTrialActiveSelector);
  const isItwValid = useIOSelector(itwLifecycleIsValidSelector);
  const isItwEnabled = useIOSelector(isItwEnabledSelector);
  const navigation = useIONavigation();

  const eidInfoBottomSheet = useIOBottomSheetAutoresizableModal(
    {
      title: <ItwEidInfoBottomSheetTitle />,
      component: <ItwEidInfoBottomSheetContent />,
      footer: (
        <ContentWrapper>
          <ButtonSolid
            label="Disattiva Documenti su IO"
            fullWidth
            color="danger"
            onPress={() =>
              navigation.navigate(ITW_ROUTES.MAIN, {
                screen: ITW_ROUTES.WALLET_REVOCATION_SCREEN
              })
            }
          />
          <VSpacer size={16} />
        </ContentWrapper>
      )
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
      iconColor: "blueIO-500",
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
        isStacked={isStacked}
        header={getHeader()}
        topElement={
          <>
            <ItwDiscoveryBanner ignoreMargins={true} closable={false} />
            <ItwWalletReadyBanner />
          </>
        }
      />
      {isItwValid && eidInfoBottomSheet.bottomSheet}
    </>
  );
};

const OtherCardsContainer = ({
  isStacked
}: Pick<WalletCardsCategoryContainerProps, "isStacked">) => {
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
      isStacked={isStacked}
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

export { WalletCardsContainer };
