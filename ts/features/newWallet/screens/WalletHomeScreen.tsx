import { IOStyles } from "@pagopa/io-app-design-system";
import React from "react";
import { ScrollView } from "react-native";
import Animated, { Layout } from "react-native-reanimated";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { idPayWalletGet } from "../../idpay/wallet/store/actions";
import { WalletCardsContainer } from "../components/WalletCardsContainer";
import { WalletEmptyScreenContent } from "../components/WalletEmptyScreenContent";
import { WalletPaymentsRedirectBanner } from "../components/WalletPaymentsRedirectBanner";
import { selectWalletCards } from "../store/selectors";

const WalletHomeScreen = () => {
  const dispatch = useIODispatch();

  const cards = useIOSelector(selectWalletCards);

  React.useEffect(() => {
    // TODO SIW-960 Move cards request to app startup
    dispatch(idPayWalletGet.request());
  }, [dispatch]);

  return (
    <ScrollView>
      <WalletPaymentsRedirectBanner />
      <Animated.View style={IOStyles.flex} layout={Layout.duration(200)}>
        {cards.length > 0 ? (
          <WalletCardsContainer />
        ) : (
          <WalletEmptyScreenContent />
        )}
      </Animated.View>
    </ScrollView>
  );
};

export { WalletHomeScreen };
