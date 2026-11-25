import { IODimensions } from "@io-app/design-system";
import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

type Props = {
  children: ReactNode;
};

const styles = StyleSheet.create({
  container: {
    marginLeft: IODimensions.padding.screen.default * -1,
    marginRight: IODimensions.padding.screen.default * -1
  }
});

export const DSFullWidthComponent = ({ children }: Props) => (
  <View style={styles.container}>{children}</View>
);
