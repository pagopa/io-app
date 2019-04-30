import { View } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import Placeholder from "rn-placeholder";

import customVariables from "../../theme/variables";

type Props = {};

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: customVariables.contentPadding
  }
});

class MessageListItemPlaceholder extends React.PureComponent<Props> {
  public render() {
    return (
      <View style={styles.mainWrapper}>
        <Placeholder.Paragraph
          textSize={customVariables.fontSizeBase}
          color={customVariables.shineColor}
          lineNumber={3}
          lineSpacing={5}
          width="100%"
          firstLineWidth="100%"
          lastLineWidth="75%"
          onReady={false}
        />
      </View>
    );
  }
}

export default MessageListItemPlaceholder;
