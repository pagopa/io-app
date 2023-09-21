import React from "react";
import { View, StyleSheet } from "react-native";
import {
  IOPictogramSizeScale,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import customVariables from "../../../theme/variables";
import { H2 } from "../../../components/core/typography/H2";
import { H4 } from "../../../components/core/typography/H4";

type Props = {
  title: string;
  content: string;
};

const styles = StyleSheet.create({
  main: {
    padding: customVariables.contentPadding,
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  textAlignCenter: {
    textAlign: "center"
  }
});

const VALIDATION_ILLUSTRATION_WIDTH: IOPictogramSizeScale = 80;

/**
 * The base graphical component, take a title and a content as input
 * and display a pictogram. This could be used for success or thank you page
 */
const ItwActionCompleted = (props: Props): React.ReactElement => (
  <View style={styles.main} testID={"ItwActionCompletedTestID"}>
    <Pictogram
      name={"completed"}
      size={VALIDATION_ILLUSTRATION_WIDTH}
      color="aqua"
    />
    <VSpacer size={48} />
    <H2 style={styles.textAlignCenter} testID={"ItwActionCompletedTitleTestID"}>
      {props.title}
    </H2>
    <VSpacer size={24} />
    <H4
      weight="Regular"
      style={styles.textAlignCenter}
      testID={"ItwActionCompletedContentTestID"}
    >
      {props.content}
    </H4>
  </View>
);

export default ItwActionCompleted;
