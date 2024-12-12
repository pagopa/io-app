import { IOStyles, IOToast } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { IOScrollView } from "../../../components/ui/IOScrollView";
import { useTabItemPressWhenScreenActive } from "../../../hooks/useTabItemPressWhenScreenActive";
import I18n from "../../../i18n";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../navigation/params/AppParamsList";
import { MainTabParamsList } from "../../../navigation/params/MainTabParamsList";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { cgnDetails } from "../../bonus/cgn/store/actions/details";
import { idPayWalletGet } from "../../idpay/wallet/store/actions";
import {
  trackOpenWalletScreen,
  trackWalletAdd
} from "../../itwallet/analytics";
import { ITW_ROUTES } from "../../itwallet/navigation/routes";
import { getPaymentsWalletUserMethods } from "../../payments/wallet/store/actions";
import { WalletCardsContainer } from "../components/WalletCardsContainer";
import { WalletCategoryFilterTabs } from "../components/WalletCategoryFilterTabs";
import { walletToggleLoadingState } from "../store/actions/placeholders";
import { isWalletEmptySelector } from "../store/selectors";

export type WalletHomeNavigationParams = Readonly<{
  newMethodAdded: boolean;
  keyFrom?: string;
}>;

type Props = IOStackNavigationRouteProps<MainTabParamsList, "WALLET_HOME">;

const WalletHomeScreen = ({ route }: Props) => {
  const dispatch = useIODispatch();
  const isNewElementAdded = React.useRef(route.params?.newMethodAdded || false);

  useFocusEffect(() => {
    trackOpenWalletScreen();
  });

  useOnFirstRender(() => {
    fetchWalletSectionData();
  });

  const fetchWalletSectionData = () => {
    dispatch(walletToggleLoadingState(true));
    dispatch(getPaymentsWalletUserMethods.request());
    dispatch(idPayWalletGet.request());
    dispatch(cgnDetails.request());
  };

  // Handles the "New element added" toast display once the user returns to this screen
  useFocusEffect(
    React.useCallback(() => {
      if (isNewElementAdded.current) {
        IOToast.success(I18n.t("features.wallet.home.toast.newMethod"));
        // eslint-disable-next-line functional/immutable-data
        isNewElementAdded.current = false;
      }
    }, [isNewElementAdded])
  );

  return (
    <WalletScrollView>
      <WalletCategoryFilterTabs />
      <WalletCardsContainer />
    </WalletScrollView>
  );
};

/**
 * A wrapper which renders a scrollview with an optional CTA based on the wallet state:
 * - If the wallet is empty, it renders the empty state
 * - If the wallet is not empty, it renders the scrollview with the "add to wallet" button
 */
const WalletScrollView = ({ children }: React.PropsWithChildren) => {
  const animatedScrollViewRef = useAnimatedRef<Animated.ScrollView>();
  const navigation = useIONavigation();
  const isWalletEmpty = useIOSelector(isWalletEmptySelector);

  const handleAddToWalletButtonPress = () => {
    trackWalletAdd();
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ONBOARDING
    });
  };

  useTabItemPressWhenScreenActive(
    React.useCallback(() => {
      animatedScrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }, [animatedScrollViewRef]),
    false
  );

  if (isWalletEmpty) {
    return (
      <Animated.ScrollView
        ref={animatedScrollViewRef}
        contentContainerStyle={[
          IOStyles.flex,
          IOStyles.horizontalContentPadding
        ]}
      >
        {children}
      </Animated.ScrollView>
    );
  }

  return (
    <IOScrollView
      animatedRef={animatedScrollViewRef}
      actions={{
        type: "SingleButton",
        primary: {
          testID: "walletAddCardButtonTestID",
          label: I18n.t("features.wallet.home.cta"),
          icon: "addSmall",
          iconPosition: "end",
          onPress: handleAddToWalletButtonPress
        }
      }}
      excludeSafeAreaMargins={true}
    >
      {children}
    </IOScrollView>
  );
};

export { WalletHomeScreen };
