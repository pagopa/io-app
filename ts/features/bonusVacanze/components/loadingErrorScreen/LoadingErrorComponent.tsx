import * as React from "react";
import { SafeAreaView } from "react-native";
import { withLoadingSpinner } from "../../../../components/helpers/withLoadingSpinner";
import GenericErrorComponent from "../../../../components/screens/GenericErrorComponent";
import { bonusVacanzeStyle } from "../Styles";

export type LoadingErrorProps = {
  isLoading: boolean;
  loadingCaption?: string;
  loadingOpacity?: number;
  errorText?: string;
  onRetry: () => void;
  onAbort?: () => void;
};

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
const InnerLoadingErrorComponent: React.FunctionComponent<
  LoadingErrorProps
> = props => {
  return (
    <SafeAreaView style={bonusVacanzeStyle.flex}>
      <GenericErrorComponent
        onRetry={props.onRetry}
        onCancel={props.onAbort}
        text={props.errorText}
        subText={" "}
      />
    </SafeAreaView>
  );
};

export const LoadingErrorComponent = withLoadingSpinner(
  InnerLoadingErrorComponent
);
