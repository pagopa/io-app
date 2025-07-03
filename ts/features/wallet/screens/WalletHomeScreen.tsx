import { IOColors, IOToast, useIOTheme } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import { IOScrollView } from "../../../components/ui/IOScrollView";
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
import { walletUpdate } from "../store/actions";
import { walletToggleLoadingState } from "../store/actions/placeholders";
import { isWalletScreenRefreshingSelector } from "../store/selectors";
import { itwShouldRenderNewITWalletSelector } from "../../itwallet/common/store/selectors";
import { WALLET_L3_BG_COLOR } from "../../itwallet/common/utils/constants";
import { WalletCategoryFilterTabs } from "../components/WalletCategoryFilterTabs";

export type WalletHomeNavigationParams = Readonly<{
  // Triggers the "New element added" toast display once the user returns to this screen
  newMethodAdded?: boolean;
}>;

type ScreenProps = IOStackNavigationRouteProps<
  MainTabParamsList,
  "WALLET_HOME"
>;

const screenHeight = Dimensions.get("screen").height;

const WalletHomeScreen = ({ route }: ScreenProps) => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  const theme = useIOTheme();
  const isRefreshingContent = useIOSelector(isWalletScreenRefreshingSelector);
  const isNewItwRenderable = useIOSelector(itwShouldRenderNewITWalletSelector);

  const isNewElementAdded = useRef(route.params?.newMethodAdded || false);
  const scrollViewContentRef = useAnimatedRef<Animated.ScrollView>();

  // We need to use a local state to separate the UI state from the redux state
  // This prevents to display the refresh indicator when the refresh is triggered by other components
  // For example, the payments section
  const [isRefreshing, setIsRefreshing] = useState(false);

  const shouldRenderCustomBG = Platform.OS === "ios" && isNewItwRenderable;

  useEffect(() => {
    // Mutate the local state only when the refresh ends
    if (!isRefreshingContent) {
      setIsRefreshing(false);
    }
  }, [isRefreshingContent]);

  const handleAddToWalletButtonPress = useCallback(() => {
    trackWalletAdd();
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ONBOARDING
    });
  }, [navigation]);

  useHeaderFirstLevel({
    currentRoute: ROUTES.WALLET_HOME,
    headerProps: {
      testID: "wallet-home-header-title",
      title: I18n.t("wallet.wallet"),
      animatedRef: scrollViewContentRef,
      actions: [
        {
          accessibilityLabel: I18n.t("features.wallet.home.cta"),
          icon: "add",
          onPress: handleAddToWalletButtonPress
        }
      ],
      variant: isNewItwRenderable ? "contrast" : "primary"
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

  const handleRefreshWallet = useCallback(() => {
    setIsRefreshing(true);
    dispatch(walletUpdate());
  }, [dispatch]);

  return (
    <>
      {shouldRenderCustomBG && (
        // This View is displayed when a refresh control is triggered
        // and is responsible for coloring the underlying content with
        // the same blue used in the new Wallet L3.
        <View style={[StyleSheet.absoluteFillObject, styles.itwBlueBg]} />
      )}
      <IOScrollView
        animatedRef={scrollViewContentRef}
        centerContent={true}
        excludeSafeAreaMargins={true}
        refreshControlProps={{
          tintColor: shouldRenderCustomBG ? IOColors.white : undefined,
          refreshing: isRefreshing,
          onRefresh: handleRefreshWallet
        }}
        contentContainerStyle={{
          ...(shouldRenderCustomBG
            ? {
                backgroundColor: IOColors[theme["appBackground-primary"]]
              }
            : {})
        }}
      >
        {!isNewItwRenderable && <WalletCategoryFilterTabs />}
        <WalletCardsContainer />
        {shouldRenderCustomBG && (
          // This View is displayed when the `ScrollView` reaches the bottom
          // and is responsible for coloring the underlying content with
          // the same color used in the `contentContainerStyle`.
          <View
            style={[
              styles.scrollViewFillEndContent,
              {
                backgroundColor: IOColors[theme["appBackground-primary"]]
              }
            ]}
          />
        )}
      </IOScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  itwBlueBg: {
    height: screenHeight,
    backgroundColor: WALLET_L3_BG_COLOR
  },
  scrollViewFillEndContent: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -screenHeight,
    height: screenHeight
  }
});

export { WalletHomeScreen };
