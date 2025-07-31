import { Platform, StyleSheet, View } from "react-native";
import { PropsWithChildren } from "react";
import { IOVisualCostants } from "@pagopa/io-app-design-system";
import { useIOSelector } from "../../../../store/hooks";
import { itwShouldRenderNewItWalletSelector } from "../store/selectors";
import FocusAwareStatusBar from "../../../../components/ui/FocusAwareStatusBar";
import { WALLET_L3_BG_COLOR } from "../utils/constants";

export const ItwWalletCardsWrapper = ({ children }: PropsWithChildren) => {
  const isNewItwRenderable = useIOSelector(itwShouldRenderNewItWalletSelector);

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
    // This negative margin was added to avoid the white strip
    // caused by the space between the wallet content and the app header
    marginTop: -16,
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    backgroundColor: WALLET_L3_BG_COLOR,
    borderBottomEndRadius: 16,
    borderBottomStartRadius: 16
  }
});
