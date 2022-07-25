import React from "react";
import { View, StyleSheet } from "react-native";
import { H2 } from "../../../components/core/typography/H2";
import customVariables from "../../../theme/variables";

const styles = StyleSheet.create({
  container: {
    marginTop: customVariables.spacerExtralargeHeight
  },
  header: {
    flex: 1,
    flexDirection: "row"
  },
  icon: {
    width: customVariables.iconSizeBase,
    marginStart: customVariables.spacerWidth
  }
});

type Props = Readonly<{
  title?: string;
  icon?: React.ReactNode;
}>;

export const PnMessageDetailsSection = (
  props: React.PropsWithChildren<Props>
): React.ReactElement | null => (
  <View style={styles.container}>
    <View style={styles.header}>
      {props.title && <H2 color="bluegrey">{props.title}</H2>}
      {props.icon && <View style={styles.icon}>{props.icon}</View>}
    </View>
    {props.children && <View>{props.children}</View>}
  </View>
);
