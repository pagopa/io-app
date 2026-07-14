import { IOVisualCostants } from "@io-app/design-system";
import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

type Props = {
  children: ReactNode;
};

const styles = StyleSheet.create({
  container: {
    marginLeft: IOVisualCostants.appMarginDefault * -1,
    marginRight: IOVisualCostants.appMarginDefault * -1
  }
});

export const DSFullWidthComponent = ({ children }: Props) => (
  <View style={styles.container}>{children}</View>
);
