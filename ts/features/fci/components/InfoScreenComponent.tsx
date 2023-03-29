import { NavigationEvents } from "@react-navigation/compat";
import * as React from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import { EmailString } from "@pagopa/ts-commons/lib/strings";
import themeVariables from "../../../theme/variables";
import { setAccessibilityFocus } from "../../../utils/accessibility";
import { Body } from "../../../components/core/typography/Body";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { H2 } from "../../../components/core/typography/H2";
import { Link } from "../../../components/core/typography/Link";

type Props = {
  image: React.ReactNode;
  title: string;
  // this is necessary in order to render text with different formatting
  body?: string | React.ReactNode;
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

const renderNode = (body: string | React.ReactNode, email?: EmailString) => {
  if (typeof body === "string") {
    return (
      <Body testID="infoScreenBody" style={styles.textAlignCenter}>
        {body}
        {email && (
          <Text>
            {" "}
            <Link onPress={() => Linking.openURL(`mailto:${email}`)}>
              {email}
            </Link>
            {"."}
          </Text>
        )}
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
      {renderNode(props.body, props.email)}
    </View>
  );
};
