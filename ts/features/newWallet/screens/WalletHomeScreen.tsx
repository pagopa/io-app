import {
  ContentWrapper,
  GradientScrollView,
  IOStyles,
  IOToast
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { ScrollView } from "react-native";
import Animated, { Layout } from "react-native-reanimated";
import I18n from "../../../i18n";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../navigation/params/AppParamsList";
import { MainTabParamsList } from "../../../navigation/params/MainTabParamsList";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { cgnDetails } from "../../bonus/cgn/store/actions/details";
import { idPayWalletGet } from "../../idpay/wallet/store/actions";
import { getPaymentsWalletUserMethods } from "../../payments/wallet/store/actions";
import { WalletCardsContainer } from "../components/WalletCardsContainer";
import { WalletEmptyScreenContent } from "../components/WalletEmptyScreenContent";
import { WalletPaymentsRedirectBanner } from "../components/WalletPaymentsRedirectBanner";
import { WalletRoutes } from "../navigation/routes";
import { selectWalletCards } from "../store/selectors";
import { cgnDetails } from "../../bonus/cgn/store/actions/details";
import { getPaymentsWalletUserMethods } from "../../payments/wallet/store/actions";
import { WalletCategoryFilterTabs } from "../components/WalletCategoryFilterTabs";

type Props = IOStackNavigationRouteProps<MainTabParamsList, "WALLET_HOME">;

const WalletHomeScreen = ({ route }: Props) => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const cards = useIOSelector(selectWalletCards);
  const isNewElementAdded = React.useRef(route.params?.newMethodAdded || false);

  const handleAddToWalletButtonPress = () => {
    navigation.navigate(WalletRoutes.WALLET_NAVIGATOR, {
      screen: WalletRoutes.WALLET_CARD_ONBOARDING
    });
  };

  React.useEffect(() => {
    // TODO SIW-960 Move cards request to app startup
    dispatch(getPaymentsWalletUserMethods.request());
    dispatch(idPayWalletGet.request());
    dispatch(cgnDetails.request());
  }, [dispatch]);

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

  if (cards.length === 0) {
    return (
      <ScrollView contentContainerStyle={IOStyles.flex}>
        <ContentWrapper>
          <WalletPaymentsRedirectBanner />
        </ContentWrapper>
        <Animated.View style={IOStyles.flex} layout={Layout.duration(200)}>
          <WalletEmptyScreenContent />
        </Animated.View>
      </ScrollView>
    );
  }

  return (
    <GradientScrollView
      primaryActionProps={{
        testID: "walletAddCardButtonTestID",
        label: I18n.t("features.wallet.home.cta"),
        accessibilityLabel: I18n.t("features.wallet.home.cta"),
        icon: "addSmall",
        iconPosition: "end",
        onPress: handleAddToWalletButtonPress
      }}
      excludeSafeAreaMargins={true}
    >
      <WalletCategoryFilterTabs />
      <WalletPaymentsRedirectBanner />
      <Animated.View style={IOStyles.flex} layout={Layout.duration(200)}>
        <WalletCardsContainer />
      </Animated.View>
    </GradientScrollView>
  );
};

export { WalletHomeScreen };
