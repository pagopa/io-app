import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { VSpacer, IOPictograms, Pictogram } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import themeVariables from "../../theme/variables";
import { setAccessibilityFocus } from "../../utils/accessibility";
import { Body } from "../core/typography/Body";
import { H2 } from "../core/typography/H2";

type Props = {
  image: IOPictograms;
  title: string;
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
      <Body testID="InfoAltScreenBody" style={styles.textAlignCenter}>
        {body}
      </Body>
    );
  }

  return body;
};

/**
 * A base screen that displays one illustration (through the Pictogram component),
 * text, and one bottom button. It's an alternative to the InfoScreenComponent
 * that accepts a generic raster image.
 *
 * @param props
 * @constructor
 */
export const InfoAltScreenComponent = ({ image, title, body }: Props) => {
  const elementRef = React.createRef<Text>();

  useFocusEffect(
    React.useCallback(() => setAccessibilityFocus(elementRef), [elementRef])
  );

  return (
    <View style={styles.main} testID="InfoAltScreenComponent">
      <Pictogram name={image} />
      <VSpacer size={24} />
      <H2
        testID="infoScreenTitle"
        accessible
        ref={elementRef}
        style={styles.textAlignCenter}
      >
        {title}
      </H2>
      {body && (
        <>
          <VSpacer size={16} />
          {renderNode(body)}
        </>
      )}
    </View>
  );
};
