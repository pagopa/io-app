import { Text, View } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";

import customVariables from "../../theme/variables";

type Props = {};

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: customVariables.contentPadding
  }
});

class MessageListItemError extends React.PureComponent<Props> {
  public render() {
    return (
      <View style={styles.mainWrapper}>
        <Text>Error loading the message detail.</Text>
      </View>
    );
  }
}

export default MessageListItemError;
