import { View } from "native-base";
import * as React from "react";
import { StyleSheet, Text } from "react-native";
import { NavigationEvents } from "react-navigation";
import themeVariables from "../../theme/variables";
import { setAccessibilityFocus } from "../../utils/accessibility";
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
  title: {
    textAlign: "center",
    fontSize: 20
  },
  textAlignCenter: {
    textAlign: "center"
  },
  bold: {
    fontWeight: "bold"
  }
});

export const InfoScreenStyle = styles;

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
      <NavigationEvents onDidFocus={() => setAccessibilityFocus(elementRef)} />
      {props.image}
      <View spacer={true} large={true} />
      <H2
        testID="infoScreenTitle"
        accessible
        ref={elementRef}
        style={styles.textAlignCenter}
      >
        {props.title}
      </H2>
      <View spacer={true} />
      {renderNode(props.body)}
    </View>
  );
};
