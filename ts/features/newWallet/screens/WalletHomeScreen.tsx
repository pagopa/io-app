import { IOStyles, IOToast, VSpacer } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import React, { PropsWithChildren, useLayoutEffect } from "react";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import HeaderFirstLevel from "../../../components/ui/HeaderFirstLevel";
import { IOScrollView } from "../../../components/ui/IOScrollView";
import { useHeaderFirstLevelActionPropHelp } from "../../../hooks/useHeaderFirstLevelActionPropHelp";
import { useTabItemPressWhenScreenActive } from "../../../hooks/useTabItemPressWhenScreenActive";
import I18n from "../../../i18n";
import { useHeaderFirstLevelActionPropSettings } from "../../../navigation/components/HeaderFirstLevelHandler";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../navigation/params/AppParamsList";
import { MainTabParamsList } from "../../../navigation/params/MainTabParamsList";
import ROUTES from "../../../navigation/routes";
import { useIODispatch, useIOSelector, useIOStore } from "../../../store/hooks";
import { isSettingsVisibleAndHideProfileSelector } from "../../../store/reducers/backendStatus";
import { cgnDetails } from "../../bonus/cgn/store/actions/details";
import { idPayWalletGet } from "../../idpay/wallet/store/actions";
import {
  trackAllCredentialProfileProperties,
  trackOpenWalletScreen,
  trackWalletAdd
} from "../../itwallet/analytics";
import { ITW_ROUTES } from "../../itwallet/navigation/routes";
import { getPaymentsWalletUserMethods } from "../../payments/wallet/store/actions";
import { WalletCardsContainer } from "../components/WalletCardsContainer";
import { WalletPaymentsRedirectBanner } from "../components/WalletPaymentsRedirectBanner";
import { walletToggleLoadingState } from "../store/actions/placeholders";
import { selectWalletCards } from "../store/selectors";

type Props = IOStackNavigationRouteProps<MainTabParamsList, "WALLET_HOME">;

const WalletHomeScreen = ({ route }: Props) => {
  const store = useIOStore();
  useFocusEffect(() => {
    trackOpenWalletScreen();
    void trackAllCredentialProfileProperties(store.getState());
  });

  const dispatch = useIODispatch();
  const isNewElementAdded = React.useRef(route.params?.newMethodAdded || false);

  useFocusEffect(
    React.useCallback(() => {
      trackOpenWalletScreen();
      dispatch(walletToggleLoadingState(true));
      dispatch(getPaymentsWalletUserMethods.request());
      dispatch(idPayWalletGet.request());
      dispatch(cgnDetails.request());
    }, [dispatch])
  );

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
      <VSpacer size={16} />
      <WalletPaymentsRedirectBanner />
      <WalletCardsContainer />
    </WalletScrollView>
  );
};

const WalletScrollView = ({ children }: PropsWithChildren<any>) => {
  const navigation = useIONavigation();
  const cards = useIOSelector(selectWalletCards);

  const handleAddToWalletButtonPress = () => {
    trackWalletAdd();
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ONBOARDING
    });
  };

  /* CODE RELATED TO THE HEADER */
  const scrollViewContentRef = useAnimatedRef<Animated.ScrollView>();

  /* Scroll to top when the active tab is tapped */
  useTabItemPressWhenScreenActive(
    () => scrollViewContentRef.current?.scrollTo({ y: 0, animated: true }),
    false
  );

  const isSettingsVisibleAndHideProfile = useIOSelector(
    isSettingsVisibleAndHideProfileSelector
  );

  const helpAction = useHeaderFirstLevelActionPropHelp(ROUTES.WALLET_HOME);
  const settingsAction = useHeaderFirstLevelActionPropSettings();

  useLayoutEffect(() => {
    const headerFirstLevelProps: HeaderFirstLevel = {
      title: I18n.t("wallet.wallet"),
      firstAction: helpAction,
      testID: "wallet-home-header-title",
      animatedRef: scrollViewContentRef,
      ...(isSettingsVisibleAndHideProfile
        ? {
            type: "twoActions",
            secondAction: settingsAction
          }
        : { type: "singleAction" })
    };

    navigation.setOptions({
      header: () => <HeaderFirstLevel {...headerFirstLevelProps} />
    });
  }, [
    helpAction,
    isSettingsVisibleAndHideProfile,
    navigation,
    scrollViewContentRef,
    settingsAction
  ]);

  if (cards.length === 0) {
    return (
      <Animated.ScrollView
        ref={scrollViewContentRef}
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
      animatedRef={scrollViewContentRef}
      excludeSafeAreaMargins={true}
      actions={{
        type: "SingleButton",
        primary: {
          testID: "walletAddCardButtonTestID",
          label: I18n.t("features.wallet.home.cta"),
          accessibilityLabel: I18n.t("features.wallet.home.cta"),
          icon: "addSmall",
          iconPosition: "end",
          onPress: handleAddToWalletButtonPress
        }
      }}
    >
      {children}
    </IOScrollView>
  );
};

export { WalletHomeScreen };
