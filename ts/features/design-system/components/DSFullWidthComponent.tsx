import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import customVariables from "../../../theme/variables";

type Props = {
  children: ReactNode;
};

const styles = StyleSheet.create({
  container: {
    marginLeft: customVariables.contentPadding * -1,
    marginRight: customVariables.contentPadding * -1
  }
});

export const DSFullWidthComponent = ({ children }: Props) => (
  <View style={styles.container}>{children}</View>
);
