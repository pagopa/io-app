import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";

import variables from "../theme/variables";

const styles = StyleSheet.create({
  content: {
    backgroundColor: variables.brandPrimary,
    padding: variables.contentPadding
  }
});

interface Props {
  title?: string;
  message: string;
}

/**
 * Renders an information banner (with blue background)
 */
export const InfoBanner: React.SFC<Props> = ({ title, message }) => (
  <View style={styles.content}>
    {title && (
      <Text white={true} bold={true}>
        {title}
      </Text>
    )}
    <Text white={true}>{message}</Text>
  </View>
);
