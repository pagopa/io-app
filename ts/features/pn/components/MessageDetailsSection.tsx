import React from "react";
import { View, StyleSheet } from "react-native";
import { IOIcons, Icon } from "@pagopa/io-app-design-system";
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
  title: {
    flex: 1
  }
});

type Props = Readonly<{
  title?: string;
  iconName?: IOIcons;
  testID?: string;
}>;

export const MessageDetailsSection = (
  props: React.PropsWithChildren<Props>
): React.ReactElement | null => (
  <View style={styles.container} testID={props.testID}>
    <View style={styles.header}>
      {props.title && (
        <H2 color="bluegrey" style={styles.title}>
          {props.title}
        </H2>
      )}
      {props.iconName && (
        <Icon name={props.iconName} color="grey-200" size={32} />
      )}
    </View>
    {props.children && <View>{props.children}</View>}
  </View>
);
