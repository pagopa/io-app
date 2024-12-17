import { IOToast } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { default as React, useCallback, useMemo, useRef } from "react";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import {
  IOScrollView,
  IOScrollViewActions
} from "../../../components/ui/IOScrollView";
import { useHeaderFirstLevel } from "../../../hooks/useHeaderFirstLevel";
import { useTabItemPressWhenScreenActive } from "../../../hooks/useTabItemPressWhenScreenActive";
import I18n from "../../../i18n";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../navigation/params/AppParamsList";
import { MainTabParamsList } from "../../../navigation/params/MainTabParamsList";
import ROUTES from "../../../navigation/routes";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import {
  trackOpenWalletScreen,
  trackWalletAdd
} from "../../itwallet/analytics";
import { ITW_ROUTES } from "../../itwallet/navigation/routes";
import { WalletCardsContainer } from "../components/WalletCardsContainer";
import { WalletCategoryFilterTabs } from "../components/WalletCategoryFilterTabs";
import { walletUpdate } from "../store/actions";
import { walletToggleLoadingState } from "../store/actions/placeholders";
import {
  isWalletEmptySelector,
  isWalletScreenRefreshingSelector
} from "../store/selectors";

export type WalletHomeNavigationParams = Readonly<{
  // Triggers the "New element added" toast display once the user returns to this screen
  newMethodAdded?: boolean;
}>;

type ScreenProps = IOStackNavigationRouteProps<
  MainTabParamsList,
  "WALLET_HOME"
>;

const WalletHomeScreen = ({ route }: ScreenProps) => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();

  const isWalletEmpty = useIOSelector(isWalletEmptySelector);
  const isRefreshing = useIOSelector(isWalletScreenRefreshingSelector);

  const isNewElementAdded = useRef(route.params?.newMethodAdded || false);
  const scrollViewContentRef = useAnimatedRef<Animated.ScrollView>();

  useHeaderFirstLevel({
    currentRoute: ROUTES.WALLET_HOME,
    headerProps: {
      testID: "wallet-home-header-title",
      title: I18n.t("wallet.wallet"),
      animatedRef: scrollViewContentRef
    }
  });

  /**
   * Return to the top of the screen when the tab item is pressed
   */
  useTabItemPressWhenScreenActive(
    useCallback(() => {
      scrollViewContentRef.current?.scrollTo({ y: 0, animated: true });
    }, [scrollViewContentRef]),
    false
  );

  /**
   * Fetch the wallet data and enable the loading state on first render
   * ! Note: to add new content to refresh, add an action dispatch to the `walletUpdate` action handler saga
   */
  useOnFirstRender(() => {
    dispatch(walletToggleLoadingState(true));
    dispatch(walletUpdate());
  });

  /**
   * Handles the "New element added" toast display once the user returns to this screen
   */
  useFocusEffect(
    useCallback(() => {
      trackOpenWalletScreen();
      if (isNewElementAdded.current) {
        IOToast.success(I18n.t("features.wallet.home.toast.newMethod"));
        // eslint-disable-next-line functional/immutable-data
        isNewElementAdded.current = false;
      }
    }, [isNewElementAdded])
  );

  const handleAddToWalletButtonPress = useCallback(() => {
    trackWalletAdd();
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ONBOARDING
    });
  }, [navigation]);

  /**
   * Returns the CTA props based on the screen state
   */
  const screenActions = useMemo((): IOScrollViewActions | undefined => {
    if (isWalletEmpty) {
      // We need to displayed the CTA only if the wallet is not empty
      return undefined;
    }

    return {
      type: "SingleButton",
      primary: {
        testID: "walletAddCardButtonTestID",
        label: I18n.t("features.wallet.home.cta"),
        icon: "addSmall",
        iconPosition: "end",
        onPress: handleAddToWalletButtonPress
      }
    };
  }, [isWalletEmpty, handleAddToWalletButtonPress]);

  return (
    <IOScrollView
      animatedRef={scrollViewContentRef}
      centerContent={true}
      excludeSafeAreaMargins={true}
      refreshControlProps={{
        refreshing: isRefreshing,
        onRefresh: () => dispatch(walletUpdate())
      }}
      actions={screenActions}
    >
      <WalletCategoryFilterTabs />
      <WalletCardsContainer />
    </IOScrollView>
  );
};

export { WalletHomeScreen };
