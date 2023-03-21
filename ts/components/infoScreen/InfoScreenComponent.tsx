import { NavigationEvents } from "@react-navigation/compat";
import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import themeVariables from "../../theme/variables";
import { setAccessibilityFocus } from "../../utils/accessibility";
import { VSpacer } from "../core/spacer/Spacer";
import { Body } from "../core/typography/Body";
import { H2 } from "../core/typography/H2";

type Props = {
  image: React.ReactNode;
  title: string;
  // this is necessary in order to render text with different formatting
  body?: string | React.ReactNode;
};

const styles = StyleSheet.create({
  main: {
    padding: themeVariables.contentPadding,
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  textAlignCenter: {
    textAlign: "center"
  }
});

const renderNode = (body: string | React.ReactNode) => {
  if (typeof body === "string") {
    return (
      <Body testID="infoScreenBody" style={styles.textAlignCenter}>
        {body}
      </Body>
    );
  }

  return body;
};

/**
 * A base screen that displays one image, text, and one bottom button
 * @param props
 * @constructor
 */
export const InfoScreenComponent: React.FunctionComponent<Props> = props => {
  const elementRef = React.createRef<Text>();

  return (
    <View style={styles.main} testID="InfoScreenComponent">
      <NavigationEvents onWillFocus={() => setAccessibilityFocus(elementRef)} />
      {props.image}
      <VSpacer size={24} />
      <H2
        testID="infoScreenTitle"
        accessible
        ref={elementRef}
        style={styles.textAlignCenter}
      >
        {props.title}
      </H2>
      <VSpacer size={16} />
      {renderNode(props.body)}
    </View>
  );
};
