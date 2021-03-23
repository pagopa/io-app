import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { H1 } from "../../components/core/typography/H1";

const styles = StyleSheet.create({
  alignCenter: {
    alignItems: "center"
  }
});

type OwnProps = {
  title: string;
};

export const ShowroomSection: React.FunctionComponent<OwnProps> = props => (
  <View style={styles.alignCenter}>
    <H1>{props.title}</H1>
    <View spacer={true} />
    {props.children}
  </View>
);
