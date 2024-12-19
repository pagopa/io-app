import { Body, H2, VSpacer } from "@pagopa/io-app-design-system";
import { EmailString } from "@pagopa/ts-commons/lib/strings";
import { useFocusEffect } from "@react-navigation/native";

import { FunctionComponent, ReactNode, createRef, useCallback } from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import themeVariables from "../../../theme/variables";
import { setAccessibilityFocus } from "../../../utils/accessibility";

type Props = {
  image: ReactNode;
  title: string;
  // this is necessary in order to render text with different formatting
  body?: string | ReactNode;
  email?: EmailString;
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

const renderNode = (body: string | ReactNode, email?: EmailString) => {
  if (typeof body === "string") {
    return (
      <>
        <Body testID="infoScreenBody" style={styles.textAlignCenter}>
          {body}
          {email && <> </>}
        </Body>
        {email && (
          <Body
            weight="Semibold"
            asLink
            onPress={() => Linking.openURL(`mailto:${email}`)}
          >
            {email}
          </Body>
        )}
      </>
    );
  }

  return body;
};

/**
 * A base screen that displays one image, text, and one bottom button
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
      <H2
        testID="infoScreenTitle"
        accessible
        ref={elementRef}
        style={styles.textAlignCenter}
      >
        {props.title}
      </H2>
      <VSpacer size={16} />
      {renderNode(props.body, props.email)}
    </View>
  );
};
