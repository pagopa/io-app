import * as React from "react";
import { StyleSheet, View } from "react-native";
import {
  Body,
  H3,
  LoadingSpinner,
  VSpacer,
  WithTestID
} from "@pagopa/io-app-design-system";
import customVariables from "../../../theme/variables";
import { LoadingIndicator } from "../../../components/ui/LoadingIndicator";

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

type Props = WithTestID<
  Readonly<{
    captionTitle?: string;
    captionSubtitle?: string;
  }>
>;

/**
 * A Component to display an animated spinner.
 * It can be used to display a loading spinner with optionally a caption title and subtitle.
 */
const LoadingComponent = (props: Props) => {
  const { captionTitle, captionSubtitle } = props;

  return (
    <View style={styles.main} testID={props.testID}>
      <LoadingIndicator />
      <VSpacer size={48} />
      <H3 style={styles.textAlignCenter} testID="LoadingSpinnerCaptionTitleID">
        {captionTitle}
      </H3>
      <VSpacer />
      <Body
        style={styles.textAlignCenter}
        testID="LoadingSpinnerCaptionSubTitleID"
      >
        {captionSubtitle}
      </Body>
    </View>
  );
};

export default LoadingComponent;
