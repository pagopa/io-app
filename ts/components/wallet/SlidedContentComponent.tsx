import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { IOColors, IOStyles } from "@pagopa/io-app-design-system";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = Readonly<{
  dark?: boolean;
  hasFlatBottom?: boolean;
}>;

const styles = StyleSheet.create({
  container: {
    backgroundColor: IOColors.bluegrey
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
  }
});

/**
 * A component to render the Screen Content as a slide on top of the Container background
 * Props:
 * - dark: the backgound is a dark gray
 * - hasFlatBottom: the bottom is anchored to the container bottom
 */
export const SlidedContentComponent = (
  props: React.PropsWithChildren<Props>
) => (
  <ScrollView style={[styles.container, IOStyles.flex]} bounces={false}>
    <SafeAreaView style={IOStyles.flex} edges={["bottom"]}>
      <View
        style={[
          styles.flexGrow,
          props.hasFlatBottom ? styles.contentBottomFlat : styles.content,
          props.dark ? styles.dark : styles.white
        ]}
      >
        {props.children}
      </View>
    </SafeAreaView>
  </ScrollView>
);
