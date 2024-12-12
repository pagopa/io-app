import { IOStyles, IOToast } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { PropsWithChildren, default as React, useCallback } from "react";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { IOScrollView } from "../../../components/ui/IOScrollView";
import { useHeaderFirstLevel } from "../../../hooks/useHeaderFirstLevel";
import { useHeaderFirstLevelProps } from "../../../hooks/useHeaderFirstLevelProps";
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
    useCallback(() => {
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
const WalletScrollView = ({ children }: PropsWithChildren<any>) => {
  const navigation = useIONavigation();
  const isWalletEmpty = useIOSelector(isWalletEmptySelector);

  const handleAddToWalletButtonPress = () => {
    trackWalletAdd();
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ONBOARDING
    });
  };

  /* CODE RELATED TO THE HEADER -- START */

  const currentRoute = ROUTES.WALLET_HOME;
  const scrollViewContentRef = useAnimatedRef<Animated.ScrollView>();
  const { actionHelp, actionSettings } = useHeaderFirstLevelProps(currentRoute);

  useHeaderFirstLevel({
    currentRoute,
    headerProps: {
      testID: "wallet-home-header-title",
      title: I18n.t("wallet.wallet"),
      animatedRef: scrollViewContentRef,
      type: "twoActions",
      firstAction: actionHelp,
      secondAction: actionSettings
    }
  });

  /* CODE RELATED TO THE HEADER -- END */

  useTabItemPressWhenScreenActive(
    useCallback(() => {
      scrollViewContentRef.current?.scrollTo({ y: 0, animated: true });
    }, [scrollViewContentRef]),
    false
  );

  if (isWalletEmpty) {
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
