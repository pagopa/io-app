import {
  ContentWrapper,
  GradientScrollView,
  IOStyles
} from "@pagopa/io-app-design-system";
import React from "react";
import { ScrollView } from "react-native";
import Animated, { Layout } from "react-native-reanimated";
import I18n from "../../../i18n";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { idPayWalletGet } from "../../idpay/wallet/store/actions";
import { WalletCardsContainer } from "../components/WalletCardsContainer";
import { WalletEmptyScreenContent } from "../components/WalletEmptyScreenContent";
import { WalletPaymentsRedirectBanner } from "../components/WalletPaymentsRedirectBanner";
import { selectWalletCards } from "../store/selectors";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { WalletRoutes } from "../navigation";

const WalletHomeScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const cards = useIOSelector(selectWalletCards);

  const handleAddToWalletButtonPress = () => {
    navigation.navigate(WalletRoutes.WALLET_NAVIGATOR, {
      screen: WalletRoutes.WALLET_CARD_ONBOARDING
    });
  };

  React.useEffect(() => {
    // TODO SIW-960 Move cards request to app startup
    dispatch(idPayWalletGet.request());
  }, [dispatch]);

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
      <WalletPaymentsRedirectBanner />
      <Animated.View style={IOStyles.flex} layout={Layout.duration(200)}>
        <WalletCardsContainer />
      </Animated.View>
    </GradientScrollView>
  );
};

export { WalletHomeScreen };
