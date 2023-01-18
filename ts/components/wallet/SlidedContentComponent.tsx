import { Content } from "native-base";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { FOOTER_SAFE_AREA } from "../../utils/constants";
import { IOColors } from "../core/variables/IOColors";

type Props = Readonly<{
  dark?: boolean;
  hasFlatBottom?: boolean;
}>;

const styles = StyleSheet.create({
  container: {
    backgroundColor: IOColors.milderGray
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
    backgroundColor: IOColors.bluegrey
  },
  white: {
    backgroundColor: IOColors.white
  },
  flexGrow: {
    flexGrow: 1
  },
  correctBottomPadding: {
    marginBottom: -FOOTER_SAFE_AREA,
    paddingBottom: FOOTER_SAFE_AREA * 2
  }
});

/**
 * A component to render the Screen Content as a slide on top of the Container background
 * Props:
 * - dark: the backgound is a dark gray
 * - hasFlatBottom: the bottom is anchored to the container bottom
 */
export const SlidedContentComponent = (props: Props & React.Props<Content>) => (
  <Content
    noPadded={true}
    style={[styles.container, styles.flexGrow]}
    contentContainerStyle={styles.flexGrow}
    bounces={false}
  >
    <View
      style={[
        styles.flexGrow,
        styles.correctBottomPadding,
        props.hasFlatBottom ? styles.contentBottomFlat : styles.content,
        props.dark ? styles.dark : styles.white
      ]}
    >
      {props.children}
    </View>
  </Content>
);
