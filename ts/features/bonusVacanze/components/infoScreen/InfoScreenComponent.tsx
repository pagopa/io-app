import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationEvents } from "react-navigation";
import themeVariables from "../../../../theme/variables";
import { setAccessibilityFocus } from "../../../../utils/accessibility";

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
  body: {
    textAlign: "center"
  },
  bold: {
    fontWeight: "bold"
  }
});

export const InfoScreenStyle = styles;

const renderNode = (body: string | React.ReactNode) => {
  if (typeof body === "string") {
    return <Text style={styles.body}>{body}</Text>;
  }

  return body;
};

/**
 * A base screen that displays one image, text, and one bottom button
 * @param props
 * @constructor
 */
export const InfoScreenComponent: React.FunctionComponent<Props> = props => {
  const elementRef = React.createRef<View>();
  return (
    <View style={styles.main}>
      <NavigationEvents onDidFocus={() => setAccessibilityFocus(elementRef)} />
      {props.image}
      <View spacer={true} large={true} />
      <Text style={styles.title} bold={true} ref={elementRef} accessible={true}>
        {props.title}
      </Text>
      <View spacer={true} />
      {renderNode(props.body)}
    </View>
  );
};
