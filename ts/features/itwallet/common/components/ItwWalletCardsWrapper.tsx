import { StyleSheet, View } from "react-native";
import { PropsWithChildren } from "react";
import { IOVisualCostants } from "@pagopa/io-app-design-system";
import { useIOSelector } from "../../../../store/hooks";
import { itwShouldRenderNewITWallet } from "../store/selectors";
import FocusAwareStatusBar from "../../../../components/ui/FocusAwareStatusBar";
import { WALLET_L3_BG_COLOR } from "../utils/constants";

export const ItwWalletCardsWrapper = ({ children }: PropsWithChildren) => {
  const isNewItwRenderable = useIOSelector(itwShouldRenderNewITWallet);

  if (isNewItwRenderable) {
    return (
      <View style={styles.itwWrapper}>
        <FocusAwareStatusBar
          backgroundColor={styles.itwWrapper.backgroundColor}
          barStyle="light-content"
        />
        {children}
      </View>
    );
  }

  return children;
};

const styles = StyleSheet.create({
  itwWrapper: {
    marginHorizontal: -(IOVisualCostants.appMarginDefault + 1),
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    backgroundColor: WALLET_L3_BG_COLOR,
    borderBottomEndRadius: 16,
    borderBottomStartRadius: 16
  }
});
