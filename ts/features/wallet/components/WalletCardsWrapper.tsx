import { StyleSheet, View } from "react-native";
import { PropsWithChildren } from "react";
import { IOColors } from "@pagopa/io-app-design-system";
import { useIOSelector } from "../../../store/hooks";
import { itwShouldRenderNewITWallet } from "../../itwallet/common/store/selectors";
import FocusAwareStatusBar from "../../../components/ui/FocusAwareStatusBar";
import { WalletCategoryFilterTabs } from "./WalletCategoryFilterTabs";

export const WalletCardsWrapper = ({ children }: PropsWithChildren) => {
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

  return (
    <>
      <WalletCategoryFilterTabs />
      {children}
    </>
  );
};

const styles = StyleSheet.create({
  itwWrapper: {
    backgroundColor: IOColors["blueIO-500"],
    borderBottomEndRadius: 16,
    borderBottomStartRadius: 16
  }
});
