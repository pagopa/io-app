import {
  ContentWrapper,
  GradientScrollView,
  IOStyles,
  IOToast
} from "@pagopa/io-app-design-system";
import { RouteProp, useRoute } from "@react-navigation/native";
import React from "react";
import { ScrollView } from "react-native";
import Animated, { Layout } from "react-native-reanimated";
import I18n from "../../../i18n";
import { MainTabParamsList } from "../../../navigation/params/MainTabParamsList";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { cgnDetails } from "../../bonus/cgn/store/actions/details";
import { idPayWalletGet } from "../../idpay/wallet/store/actions";
import { getPaymentsWalletUserMethods } from "../../payments/wallet/store/actions";
import { WalletCardsContainer } from "../components/WalletCardsContainer";
import { WalletEmptyScreenContent } from "../components/WalletEmptyScreenContent";
import { WalletPaymentsRedirectBanner } from "../components/WalletPaymentsRedirectBanner";
import { selectWalletCards } from "../store/selectors";

type WalletHomeScreenRouteProps = RouteProp<MainTabParamsList, "WALLET_HOME">;

const WalletHomeScreen = () => {
  const dispatch = useIODispatch();
  const {
    params: { newMethodAdded }
  } = useRoute<WalletHomeScreenRouteProps>();
  const cards = useIOSelector(selectWalletCards);

  React.useEffect(() => {
    // TODO SIW-960 Move cards request to app startup
    dispatch(getPaymentsWalletUserMethods.request());
    dispatch(idPayWalletGet.request());
    dispatch(cgnDetails.request());
  }, [dispatch]);

  React.useEffect(() => {
    if (newMethodAdded) {
      IOToast.success(I18n.t("features.wallet.home.toast.newMethod"));
    }
  }, [newMethodAdded]);

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
        onPress: () => null
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
