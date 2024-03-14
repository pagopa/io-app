import React from "react";
import Animated, { Layout } from "react-native-reanimated";
import { IOStyles } from "@pagopa/io-app-design-system";
import { WalletEmptyScreenContent } from "../components/WalletEmptyScreenContent";
import { WalletPaymentsRedirectBanner } from "../components/WalletPaymentsRedirectBanner";

const WalletHomeScreen = () => (
  <>
    <WalletPaymentsRedirectBanner />
    <Animated.View style={IOStyles.flex} layout={Layout.duration(200)}>
      <WalletEmptyScreenContent />
    </Animated.View>
  </>
);

export { WalletHomeScreen };
