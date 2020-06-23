import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import themeVariables from "../../../../theme/variables";

type Props = {
  image: React.ReactNode;
  title?: string;
  body?: string | React.ReactNode;
};

const styles = StyleSheet.create({
  main: {
    padding: themeVariables.contentPadding,
    flex: 1,
    alignItems: "center"
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
  return (
    <View style={styles.main}>
      <View spacer={true} extralarge={true} />
      <View spacer={true} extralarge={true} />
      <View spacer={true} extralarge={true} />
      {props.image}
      <View spacer={true} extralarge={true} />
      {props.title && (
        <>
          <Text style={styles.title} bold={true}>
            {props.title}
          </Text>
          <View spacer={true} />
        </>
      )}

      {renderNode(props.body)}
    </View>
  );
};
