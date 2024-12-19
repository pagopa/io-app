import { Body, H4, VSpacer } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";

import { createRef, FunctionComponent, ReactNode, useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import themeVariables from "../../theme/variables";
import { setAccessibilityFocus } from "../../utils/accessibility";

type Props = {
  image: ReactNode;
  title: string;
  // this is necessary in order to render text with different formatting
  body?: string | ReactNode;
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

const renderNode = (body: string | ReactNode) => {
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
 * @deprecated Use `OperationResultScreen` instead
 * @param props
 * @constructor
 */
export const InfoScreenComponent: FunctionComponent<Props> = props => {
  const elementRef = createRef<Text>();
  useFocusEffect(
    useCallback(() => setAccessibilityFocus(elementRef), [elementRef])
  );

  return (
    <View style={styles.main} testID="InfoScreenComponent">
      {props.image}
      <VSpacer size={24} />
      <H4
        testID="infoScreenTitle"
        accessible
        ref={elementRef}
        style={styles.textAlignCenter}
      >
        {props.title}
      </H4>
      <VSpacer size={16} />
      {renderNode(props.body)}
    </View>
  );
};
