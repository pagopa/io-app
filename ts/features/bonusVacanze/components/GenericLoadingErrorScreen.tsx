import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { withLoadingSpinner } from "../../../components/helpers/withLoadingSpinner";
import GenericErrorComponent from "../../../components/screens/GenericErrorComponent";
import customVariables from "../../../theme/variables";

type Props = {
  isLoading: boolean;
  loadingCaption?: string;
  loadingOpacity?: number;
  errorText?: string;
  onRetry: () => void;
  onCancel?: () => void;
};

const styles = StyleSheet.create({
  main: {
    backgroundColor: customVariables.colorWhite,
    flex: 1,
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  }
});
/**
 * This component is a generic error component composed with a loading.
 * In this way it is testable regardless of how it will be connected to the application flow.
 * This component, when {@link Props.isLoading} display a loading overlay, hiding the background, using
 * {@link withLoadingSpinner}.
 * When {@link Props.isLoading} is false, display a {@link GenericErrorComponent} displaying the reasons of the error
 * and two buttons to cancel the operation or retry.
 * @param props
 * @constructor
 */
const InnerGenericLoadingErrorScreen: React.FunctionComponent<
  Props
> = props => {
  return (
    <View style={styles.main}>
      <GenericErrorComponent
        onRetry={props.onRetry}
        onCancel={props.onCancel}
        text={props.errorText}
      />
    </View>
  );
};

export const GenericLoadingErrorScreen = withLoadingSpinner(
  InnerGenericLoadingErrorScreen
);
