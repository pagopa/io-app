import { Content, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import customVariables from "../../theme/variables";

type Props = Readonly<{
  dark?: boolean;
  hasFlatBottom?: boolean;
}>;

const styles = StyleSheet.create({
  container: {
    backgroundColor: customVariables.milderGray
  },
  content: {
    borderRadius: 8,
    marginHorizontal: 8,
    marginBottom: 16,
    padding: 16
  },
  contentBottomFlat: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginHorizontal: 8,
    padding: 16
  },
  dark: {
    backgroundColor: customVariables.darkerGray
  },
  white: {
    backgroundColor: customVariables.colorWhite
  }
});

export const SlidedContentComponent = (props: Props & React.Props<Content>) => {
  return (
    <Content noPadded={true} style={styles.container} bounces={false}>
      <View
        style={[
          props.hasFlatBottom ? styles.contentBottomFlat : styles.content,
          props.dark ? styles.dark : styles.white
        ]}
      >
        {props.children}
      </View>
    </Content>
  );
};
