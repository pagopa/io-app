import { IOStyles, ListItemHeader } from "@pagopa/io-app-design-system";
import * as React from "react";
import { View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import I18n from "../../../i18n";
import { useIOSelector } from "../../../store/hooks";
import { ItwDiscoveryBanner } from "../../itwallet/common/components/ItwDiscoveryBanner";
import { ITW_TRIAL_ID } from "../../itwallet/common/utils/itwTrialUtils";
import { itwLifecycleIsValidSelector } from "../../itwallet/lifecycle/store/selectors";
import { trialStatusSelector } from "../../trialSystem/store/reducers";
import {
  selectIsWalletCardsLoading,
  selectSortedWalletCards,
  selectWalletItwCards,
  selectWalletOtherCards
} from "../store/selectors";
import { WalletCardSkeleton } from "./WalletCardSkeleton";
import {
  WalletCardsCategoryContainer,
  WalletCardsCategoryContainerProps
} from "./WalletCardsCategoryContainer";
import { WalletEmptyScreenContent } from "./WalletEmptyScreenContent";

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
  const isItwTrialEnabled = useIOSelector(trialStatusSelector(ITW_TRIAL_ID));
  const isItwValid = useIOSelector(itwLifecycleIsValidSelector);

  if (!isItwTrialEnabled) {
    return null;
  }

  const endElement: ListItemHeader["endElement"] = isItwValid
    ? {
        type: "badge",
        componentProps: {
          text: I18n.t("features.itWallet.wallet.active"),
          variant: "blue"
        }
      }
    : {
        type: "badge",
        componentProps: {
          text: I18n.t("features.itWallet.wallet.inactive"),
          variant: "default"
        }
      };

  return (
    <WalletCardsCategoryContainer
      key={`cards_category_itw`}
      testID={`walletCardsCategoryTestID_itw`}
      cards={cards}
      isStacked={isStacked}
      header={{
        label: I18n.t("features.wallet.cards.categories.itw"),
        endElement
      }}
      footer={<ItwDiscoveryBanner ignoreMargins={true} />}
    />
  );
};

const OtherCardsContainer = ({
  isStacked
}: Pick<WalletCardsCategoryContainerProps, "isStacked">) => {
  const cards = useIOSelector(selectWalletOtherCards);
  const isItwTrialEnabled = useIOSelector(trialStatusSelector(ITW_TRIAL_ID));

  if (cards.length === 0) {
    return null;
  }

  return (
    <WalletCardsCategoryContainer
      key={`cards_category_other`}
      testID={`walletCardsCategoryTestID_other`}
      cards={cards}
      isStacked={isStacked}
      header={
        isItwTrialEnabled && {
          label: I18n.t("features.wallet.cards.categories.other")
        }
      }
    />
  );
};

export { WalletCardsContainer };
