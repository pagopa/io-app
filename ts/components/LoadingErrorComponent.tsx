import { Millisecond } from "@pagopa/ts-commons/lib/units";
import * as React from "react";
import { useEffect } from "react";
import { ActivityIndicator, SafeAreaView, View } from "react-native";
import { WithTestID } from "../types/WithTestID";
import { setAccessibilityFocus } from "../utils/accessibility";
import { IOStyles } from "./core/variables/IOStyles";
import { InfoScreenComponent } from "./infoScreen/InfoScreenComponent";
import GenericErrorComponent from "./screens/GenericErrorComponent";

export type LoadingErrorProps = WithTestID<{
  isLoading: boolean;
  loadingCaption: string;
  loadingSubtitle?: string;
  errorText?: string;
  errorSubText?: string;
  onRetry: () => void;
  onAbort?: () => void;
}>;

const errorRef = React.createRef<View>();
const loadingRef = React.createRef<View>();

const renderError = (props: LoadingErrorProps) => (
  <GenericErrorComponent
    testID={"LoadingErrorComponentError"}
    onRetry={props.onRetry}
    onCancel={props.onAbort}
    text={props.errorText}
    subText={props.errorSubText ?? ""}
    ref={errorRef}
  />
);

const renderLoading = (loadingCaption: string, loadingSubtitle?: string) => (
  <View
    accessible={true}
    ref={loadingRef}
    style={{ flex: 1 }}
    testID={"LoadingErrorComponentLoading"}
  >
    <InfoScreenComponent
      image={
        <ActivityIndicator
          color={"black"}
          accessible={false}
          importantForAccessibility={"no-hide-descendants"}
          accessibilityElementsHidden={true}
        />
      }
      title={loadingCaption}
      body={loadingSubtitle}
    />
  </View>
);

const delay = 100 as Millisecond;

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
export const LoadingErrorComponent: React.FunctionComponent<
  LoadingErrorProps
> = props => {
  useEffect(() => {
    setAccessibilityFocus(props.isLoading ? loadingRef : errorRef, delay);
  }, [props.isLoading]);

  return (
    <SafeAreaView style={IOStyles.flex} testID={props.testID}>
      {props.isLoading
        ? renderLoading(props.loadingCaption, props.loadingSubtitle)
        : renderError(props)}
    </SafeAreaView>
  );
};
