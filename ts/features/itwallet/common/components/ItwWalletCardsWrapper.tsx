import { Platform, StyleSheet, View } from "react-native";
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
    marginHorizontal: -Platform.select({
      // On Android devices, applying only `IOVisualConstants.appMarginDefault`
      // results in a thin white stripe on the left side of the box.
      // Adding 0.1 seems to resolve the issue.
      android: IOVisualCostants.appMarginDefault + 0.1,
      default: IOVisualCostants.appMarginDefault
    }),
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    backgroundColor: WALLET_L3_BG_COLOR,
    borderBottomEndRadius: 16,
    borderBottomStartRadius: 16
  }
});
