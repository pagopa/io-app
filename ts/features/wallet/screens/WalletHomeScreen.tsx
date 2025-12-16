import { IOToast } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback, useEffect, useRef, useState } from "react";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { IOScrollView } from "../../../components/ui/IOScrollView";
import { useHeaderFirstLevel } from "../../../hooks/useHeaderFirstLevel";
import { useTabItemPressWhenScreenActive } from "../../../hooks/useTabItemPressWhenScreenActive";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../navigation/params/AppParamsList";
import { MainTabParamsList } from "../../../navigation/params/MainTabParamsList";
import ROUTES from "../../../navigation/routes";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import {
  trackItwSurveyRequest,
  trackOpenWalletScreen,
  trackWalletAdd
} from "../../itwallet/analytics";
import { useItwEidFeedbackBottomSheet } from "../../itwallet/common/hooks/useItwEidFeedbackBottomSheet.tsx";
import { itwSetPidReissuingSurveyHidden } from "../../itwallet/common/store/actions/preferences.ts";
import { ITW_ROUTES } from "../../itwallet/navigation/routes";
import { WalletCardsContainer } from "../components/WalletCardsContainer";
import { WalletCategoryFilterTabs } from "../components/WalletCategoryFilterTabs";
import { walletUpdate } from "../store/actions";
import { walletToggleLoadingState } from "../store/actions/placeholders";
import { isWalletScreenRefreshingSelector } from "../store/selectors";

export type WalletHomeNavigationParams = Readonly<{
  // Triggers the "New element added" toast display once the user returns to this screen
  newMethodAdded?: boolean;
  // Triggers the "Required EID feedback" bottom sheet display once the user returns to this screen
  requiredEidFeedback?: boolean;
}>;

type ScreenProps = IOStackNavigationRouteProps<
  MainTabParamsList,
  "WALLET_HOME"
>;

const WalletHomeScreen = ({ route }: ScreenProps) => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  const isRefreshingContent = useIOSelector(isWalletScreenRefreshingSelector);

  const isNewElementAdded = useRef(route.params?.newMethodAdded || false);
  const isRequiredEidFeedback = useRef(
    route.params?.requiredEidFeedback || false
  );
  const scrollViewContentRef = useAnimatedRef<Animated.ScrollView>();
  const itwFeedbackBottomSheet = useItwEidFeedbackBottomSheet({
    onPrimaryAction: () => {
      dispatch(itwSetPidReissuingSurveyHidden(true));
    }
  });

  // We need to use a local state to separate the UI state from the redux state
  // This prevents to display the refresh indicator when the refresh is triggered by other components
  // For example, the payments section
  const [isRefreshing, setIsRefreshing] = useState(false);

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
          accessibilityLabel: I18n.t("features.wallet.home.screen.legacy.cta"),
          icon: "add",
          onPress: handleAddToWalletButtonPress
        }
      ],
      variant: "primary"
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
      if (isRequiredEidFeedback.current) {
        trackItwSurveyRequest({
          survey_id: "confirm_eid_flow_exit",
          survey_page: route.name
        });
        itwFeedbackBottomSheet.present();
        // eslint-disable-next-line functional/immutable-data
        isRequiredEidFeedback.current = false;
      }
    }, [
      isNewElementAdded,
      isRequiredEidFeedback,
      itwFeedbackBottomSheet,
      route.name
    ])
  );

  const handleRefreshWallet = useCallback(() => {
    setIsRefreshing(true);
    dispatch(walletUpdate());
  }, [dispatch]);

  return (
    <>
      <IOScrollView
        animatedRef={scrollViewContentRef}
        centerContent={true}
        excludeSafeAreaMargins={true}
        refreshControlProps={{
          tintColor: undefined,
          refreshing: isRefreshing,
          onRefresh: handleRefreshWallet
        }}
      >
        <WalletCategoryFilterTabs />
        <WalletCardsContainer />
      </IOScrollView>
      {itwFeedbackBottomSheet.bottomSheet}
    </>
  );
};

export { WalletHomeScreen };
