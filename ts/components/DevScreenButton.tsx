import { Text } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import ButtonDefaultOpacity from "./ButtonDefaultOpacity";

type Props = Readonly<{
  onPress: () => void;
}>;

const styles = StyleSheet.create({
  devButton: {
    position: "absolute",
    top: 20,
    left: 3,
    zIndex: 1000
  }
});

export const DevScreenButton: React.SFC<Props> = props => (
  <ButtonDefaultOpacity
    dark={true}
    onPress={props.onPress}
    small={true}
    bordered={true}
    transparent={true}
    style={styles.devButton}
  >
    <Text>Dev</Text>
  </ButtonDefaultOpacity>
);
