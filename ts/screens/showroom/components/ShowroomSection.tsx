import * as React from "react";
import { View, StyleSheet } from "react-native";
import { IOColors } from "../../../components/core/variables/IOColors";
import { H1 } from "../../../components/core/typography/H1";

const styles = StyleSheet.create({
  content: {
    marginBottom: 54
  },
  title: {
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: IOColors.greyLight
  }
});

type OwnProps = {
  title: string;
};

export const ShowroomSection: React.FunctionComponent<OwnProps> = props => (
  <View style={styles.content}>
    <H1 style={styles.title}>{props.title}</H1>
    {props.children}
  </View>
);
