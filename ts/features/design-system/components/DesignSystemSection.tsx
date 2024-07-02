import * as React from "react";
import { View, StyleSheet } from "react-native";
import { H1 } from "../../../components/core/typography/H1";

const styles = StyleSheet.create({
  content: {
    marginBottom: 54
  },
  title: {
    marginBottom: 16
  }
});

type OwnProps = React.PropsWithChildren<{
  title: string;
}>;

export const DesignSystemSection = (props: OwnProps) => (
  <View style={styles.content}>
    <H1 style={styles.title}>{props.title}</H1>
    {props.children}
  </View>
);
